import { randomUUIDv7, type ServerWebSocket } from "bun";
import type { IncomingMessage, SignupIncomingMessage } from "common/types";
import { prismaClient } from "db/client";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";

const availableValidators: { validatorId: string, socket: ServerWebSocket<unknown>, publicKey: string }[] = [];
const lastDispatch: Record<string, number> = {};
const DISPATCH_COOLDOWN_MS = 10_000; 

const CALLBACKS : { [callbackId: string]: (data: IncomingMessage) => void } = {}
const COST_PER_VALIDATION = 100; 

Bun.serve({
        fetch(req, server) {
            const url = new URL(req.url);
            if (url.pathname === '/stats') {
                return new Response(JSON.stringify({
                        onlineValidators: availableValidators.length,
                        validators: availableValidators.map(v => ({ id: v.validatorId, publicKey: v.publicKey })),
                }), {
                        headers: {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*',
                        }
                });
            }
            if (server.upgrade(req)) {
                return;
            }
            return new Response("Upgrade failed", { status: 500 });
        },
    port: 8081,
    websocket: {
        async message(ws: ServerWebSocket<unknown>, message: string) {
            const data: IncomingMessage = JSON.parse(message);
            
            if (data.type === 'signup') {

                const verified = await verifyMessage(
                    `Signed message for ${data.data.callbackId}, ${data.data.publicKey}`,
                    data.data.publicKey,
                    data.data.signedMessage
                );
                if (verified) {
                    await signupHandler(ws, data.data);
                }
            } else if (data.type === 'validate') {
                CALLBACKS[data.data.callbackId](data);
                delete CALLBACKS[data.data.callbackId];
            }
        },
        async close(ws: ServerWebSocket<unknown>) {
            availableValidators.splice(availableValidators.findIndex(v => v.socket === ws), 1);
        }
    },
});

async function signupHandler(ws: ServerWebSocket<unknown>, { ip, publicKey, signedMessage, callbackId }: SignupIncomingMessage) {
    const validatorDb = await prismaClient.validator.findFirst({
        where: {
            publicKey,
        },
    });

    if (validatorDb) {
        ws.send(JSON.stringify({
            type: 'signup',
            data: {
                validatorId: validatorDb.id,
                callbackId,
            },
        }));
        availableValidators.push({
            validatorId: validatorDb.id,
            socket: ws,
            publicKey: validatorDb.publicKey,
        });
        // Kick off an immediate validation cycle for fast feedback
        triggerValidationCycleForValidator(validatorDb.id, ws, validatorDb.publicKey).catch(console.error);
        return;
    }
    
    //TODO: Given the ip, return the location
    const validator = await prismaClient.validator.create({
        data: {
            ip,
            publicKey,
            location: 'unknown',
        },
    });

    ws.send(JSON.stringify({
        type: 'signup',
        data: {
            validatorId: validator.id,
            callbackId,
        },
    }));

    availableValidators.push({
        validatorId: validator.id,
        socket: ws,
        publicKey: validator.publicKey,
    });
    triggerValidationCycleForValidator(validator.id, ws, validator.publicKey).catch(console.error);
}

async function verifyMessage(message: string, publicKey: string, signature: string) {
    const messageBytes = nacl_util.decodeUTF8(message);
    const result = nacl.sign.detached.verify(
        messageBytes,
        new Uint8Array(JSON.parse(signature)),
        new PublicKey(publicKey).toBytes(),
    );

    return result;
}

setInterval(async () => {
    await triggerValidationCycleAllValidators();
}, 60 * 1000);

async function triggerValidationCycleAllValidators() {
    const websitesToMonitor = await prismaClient.website.findMany({ where: { disabled: false } });
    for (const website of websitesToMonitor) {
        availableValidators.forEach(validator => sendValidateRequest(validator, website.id, website.url));
    }
}

function sendValidateRequest(validator: { validatorId: string; socket: ServerWebSocket<unknown>; publicKey: string; }, websiteId: string, url: string) {
    const key = `${validator.validatorId}:${websiteId}`;
    const now = Date.now();
    if (lastDispatch[key] && now - lastDispatch[key] < DISPATCH_COOLDOWN_MS) {
        return; // still cooling down
    }
    lastDispatch[key] = now;
    const callbackId = randomUUIDv7();
    console.log(`Sending validate to ${validator.validatorId} ${url}`);
    validator.socket.send(JSON.stringify({
        type: 'validate',
        data: {
            url,
            callbackId,
            websiteId,
        },
    }));

    CALLBACKS[callbackId] = async (data: IncomingMessage) => {
        if (data.type === 'validate') {
            const { validatorId, status, latency, signedMessage } = data.data;
            const verified = await verifyMessage(
                `Replying to ${callbackId}`,
                validator.publicKey,
                signedMessage
            );
            if (!verified) {
                return;
            }

            await prismaClient.$transaction(async (tx) => {
                await tx.websiteTick.create({
                    data: {
                        websiteId,
                        validatorId,
                        status,
                        latency,
                        createdAt: new Date(),
                    },
                });
                console.log(`Tick created for website ${websiteId} by validator ${validatorId} status=${status} latency=${latency}`);

                await tx.validator.update({
                    where: { id: validatorId },
                    data: {
                        pendingPayouts: { increment: COST_PER_VALIDATION },
                    },
                });
            });
        }
    };
}

async function triggerValidationCycleForValidator(validatorId: string, socket: ServerWebSocket<unknown>, publicKey: string) {
    const websitesToMonitor = await prismaClient.website.findMany({ where: { disabled: false } });
    const validator = { validatorId, socket, publicKey };
    for (const website of websitesToMonitor) {
        sendValidateRequest(validator, website.id, website.url);
    }
}

console.log("Hub server starting on port 8081...");