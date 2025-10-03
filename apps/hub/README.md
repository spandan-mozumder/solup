# Hub Service

Realtime coordination / messaging layer (intended to broker validator runtime communication and possibly WebSocket fan-out).

## Responsibilities

- Accepts websocket connections from browser validator runtimes
- Relays validation tasks / responses (future)
- Potential queue or pub/sub integration point

## Tech Stack

- Runtime: Bun
- Transport: (Planned) WebSocket server
- Shared types/utilities can be imported from packages

## Development

```bash
bun install
bun run index.ts
```

## Future Enhancements

- Authentication / signed messages
- Topic-based subscription model
- Backpressure / rate limiting
