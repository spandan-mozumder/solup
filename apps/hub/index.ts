import { randomUUIDv7, type ServerWebSocket } from "bun";
import type { IncomingMessage, SignupIncomingMessage } from "common/types";
import { prismaClient } from "db/client";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";

const availableValidators: {
  validatorId: string;
  socket: ServerWebSocket<unknown>;
  publicKey: string;
}[] = [];

const CALLBACKS: { [callbackId: string]: (data: IncomingMessage) => void } = {};
const COST_PER_VALIDATION = 100;

Bun.serve({
  fetch(req, server) {
    if (server.upgrade(req)) {
      return;
    }
    return new Response("Upgrade failed", { status: 500 });
  },
  port: 8081,
  websocket: {
    async message(ws: ServerWebSocket<unknown>, message: string) {
      const data: IncomingMessage = JSON.parse(message);

      if (data.type === "signup") {
        const verified = await verifyMessage(
          `Signed message for ${data.data.callbackId}, ${data.data.publicKey}`,
          data.data.publicKey,
          data.data.signedMessage,
        );
        if (verified) {
          await signupHandler(ws, data.data);
        }
      } else if (data.type === "validate") {
        console.log(
          `Received validation response for callback ${data.data.callbackId}`,
        );
        if (CALLBACKS[data.data.callbackId]) {
          CALLBACKS[data.data.callbackId](data);
          delete CALLBACKS[data.data.callbackId];
        } else {
          console.error(`No callback found for ${data.data.callbackId}`);
        }
      }
    },
    async close(ws: ServerWebSocket<unknown>) {
      availableValidators.splice(
        availableValidators.findIndex((v) => v.socket === ws),
        1,
      );
    },
  },
});

async function signupHandler(
  ws: ServerWebSocket<unknown>,
  { ip, publicKey, signedMessage, callbackId }: SignupIncomingMessage,
) {
  const validatorDb = await prismaClient.validator.findFirst({
    where: {
      publicKey,
    },
  });

  if (validatorDb) {
    ws.send(
      JSON.stringify({
        type: "signup",
        data: {
          validatorId: validatorDb.id,
          callbackId,
        },
      }),
    );

    availableValidators.push({
      validatorId: validatorDb.id,
      socket: ws,
      publicKey: validatorDb.publicKey,
    });
    return;
  }

  const validator = await prismaClient.validator.create({
    data: {
      ip,
      publicKey,
      location: "unknown",
    },
  });

  ws.send(
    JSON.stringify({
      type: "signup",
      data: {
        validatorId: validator.id,
        callbackId,
      },
    }),
  );

  availableValidators.push({
    validatorId: validator.id,
    socket: ws,
    publicKey: validator.publicKey,
  });
}

async function verifyMessage(
  message: string,
  publicKey: string,
  signature: string,
) {
  const messageBytes = nacl_util.decodeUTF8(message);
  const result = nacl.sign.detached.verify(
    messageBytes,
    new Uint8Array(JSON.parse(signature)),
    new PublicKey(publicKey).toBytes(),
  );

  return result;
}

setInterval(async () => {
  const websitesToMonitor = await prismaClient.website.findMany({
    where: {
      disabled: false,
    },
  });

  console.log(
    `Starting validation cycle: ${websitesToMonitor.length} websites, ${availableValidators.length} validators`,
  );

  if (availableValidators.length === 0) {
    console.log("No validators available - skipping validation cycle");
    return;
  }

  for (const website of websitesToMonitor) {
    for (const validator of availableValidators) {
      const callbackId = randomUUIDv7();
      console.log(
        `Sending validate to ${validator.validatorId} ${website.url}`,
      );
      validator.socket.send(
        JSON.stringify({
          type: "validate",
          data: {
            url: website.url,
            callbackId,
            websiteId: website.id,
          },
        }),
      );

      CALLBACKS[callbackId] = async (data: IncomingMessage) => {
        console.log(
          `Received callback for ${callbackId}:`,
          JSON.stringify(data),
        );
        if (data.type === "validate") {
          const { validatorId, status, latency, signedMessage } = data.data;
          console.log(
            `Processing validation response from ${validatorId} for website ${website.id}`,
          );

          const verified = await verifyMessage(
            `Replying to ${callbackId}`,
            validator.publicKey,
            signedMessage,
          );

          if (!verified) {
            console.error(
              `Message verification failed for validator ${validatorId} and callback ${callbackId}`,
            );
            return;
          }

          console.log(
            `Message verified successfully for ${validatorId}. Creating database entries...`,
          );

          try {
            await prismaClient.$transaction(async (tx) => {
              const tick = await tx.websiteTick.create({
                data: {
                  websiteId: website.id,
                  validatorId,
                  status,
                  latency,
                  createdAt: new Date(),
                },
              });
              console.log(`Created websiteTick:`, tick.id);

              await tx.validator.update({
                where: { id: validatorId },
                data: {
                  pendingPayouts: { increment: COST_PER_VALIDATION },
                },
              });
              console.log(`Updated validator ${validatorId} payout`);
            });
          } catch (error) {
            console.error(`Database operation failed:`, error);
          }
        } else {
          console.log(`Received non-validate message type: ${data.type}`);
        }
      };
    }
  }
}, 60 * 1000);
