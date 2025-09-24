"use client";
import { useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import naclUtil from "tweetnacl-util";
import { PublicKey } from "@solana/web3.js";

interface ValidateMessagePayload {
  url: string;
  callbackId: string;
  websiteId: string;
}

interface IncomingMessage {
  type: string;
  data: unknown;
}

function signMessage(message: string, publicKey: PublicKey, sign: (msg: Uint8Array) => Promise<Uint8Array>) {
  const bytes = naclUtil.decodeUTF8(message);

  return sign(bytes);
}

export const BrowserValidatorRuntime = ({ validatorId, hubUrl = "ws://localhost:8081" }: { validatorId: string; hubUrl?: string }) => {
  const { connected, publicKey, signMessage: walletSignMessage } = useWallet();
  const wsRef = useRef<WebSocket | null>(null);
  const [active, setActive] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);
  const [signupDone, setSignupDone] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const attemptRef = useRef(0);
  const abortRef = useRef(false);


  useEffect(() => {
    abortRef.current = false;
    function scheduleReconnect() {
      if (abortRef.current || !connected || !publicKey || !validatorId) return;
      const backoff = Math.min(1000 * Math.pow(2, attemptRef.current), 15000);
      reconnectTimerRef.current = window.setTimeout(() => {
        attemptRef.current += 1;
        openConnection();
      }, backoff);
    }

    async function openConnection() {
      if (!connected || !publicKey || !validatorId) return;
      if (!signMessage) {
        setErrors('Wallet does not support message signing. Enable message signing.');
        return;
      }
      if (wsRef.current) return;
      setErrors(null);
      setActive(false);
      setSignupDone(false);
      const ws = new WebSocket(hubUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        setActive(true);
        attemptRef.current = 0;
        try {
          const callbackId = crypto.randomUUID();
          const message = `Signed message for ${callbackId}, ${publicKey?.toBase58()}`;
            const signatureBytes = await walletSignMessage?.(new TextEncoder().encode(message));
            ws.send(JSON.stringify({
              type: 'signup',
              data: {
                callbackId,
                ip: 'browser',
                publicKey: publicKey.toBase58(),
                signedMessage: signatureBytes ? JSON.stringify(Array.from(signatureBytes)) : "",
              }
            }));
        } catch (e: any) {
          setErrors(e.message || 'Failed to sign signup message');
          try { ws.close(); } catch {}
        }
      };

      ws.onmessage = async (event) => {
        try {
          const incoming: IncomingMessage = JSON.parse(event.data);
          if (incoming.type === 'signup') {
            setSignupDone(true);
          } else if (incoming.type === 'validate' && signupDone) {
            const payload: ValidateMessagePayload = incoming.data as ValidateMessagePayload;
            const start = performance.now();
            let status: 'Good' | 'Bad' = 'Good';
            try {
              const resp = await fetch(payload.url, { method: 'GET' });
              if (!resp.ok) status = 'Bad';
            } catch (_) {
              status = 'Bad';
            }
            const latency = performance.now() - start;
            const replyCallbackId = payload.callbackId;
            const replyMessage = `Replying to ${replyCallbackId}`;
            try {
              const sigBytes = await walletSignMessage?.(new TextEncoder().encode(replyMessage));
              ws.send(JSON.stringify({
                type: 'validate',
                data: {
                  callbackId: replyCallbackId,
                  status,
                  latency,
                  validatorId,
                  websiteId: payload.websiteId,
                  signedMessage: sigBytes ? JSON.stringify(Array.from(sigBytes)) : "",
                }
              }));
            } catch (e) {
              console.error('Failed to sign validation reply', e);
            }
          }
        } catch (e) {
          console.error(e);
        }
      };

      ws.onerror = (ev) => {
        console.error('Validator WS error', ev);
        if (!errors) setErrors('WebSocket error – see console');
      };

      ws.onclose = () => {
        wsRef.current = null;
        setActive(false);
        if (!signupDone && !errors && !abortRef.current) {
          setErrors('Connection closed before signup completed');
        }
        scheduleReconnect();
      };

      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        if (!active && ws.readyState !== WebSocket.OPEN) {
          setErrors('WebSocket timeout (5s) – hub unreachable?');
          try { ws.close(); } catch {}
        }
      }, 5000);
    }

    openConnection();
    return () => {
      abortRef.current = true;
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
      try { wsRef.current?.close(); } catch {}
      wsRef.current = null;
    };
  }, [connected, publicKey, validatorId, hubUrl, walletSignMessage]);

  if (!connected) return null;
  if (errors) return <div className="text-red-500 text-xs">Validator runtime error: {errors}</div>;
  const stateLabel = errors ? 'error' : active ? (signupDone ? 'active' : 'signing up') : 'connecting';
  return <div className="text-xs text-muted-foreground">Validator runtime: {stateLabel} (attempt {attemptRef.current + 1}).</div>;
};
