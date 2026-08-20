# Pluggable backend connection, not a hardcoded API

`ConnectionPortal` lets the user enter any API URL and auth key, stored in `localStorage`, rather than shipping a fixed backend URL. [`finorganizer-api`](https://github.com/guibranco/finorganizer-api) is the reference implementation of the API contract (`src/api/schema.d.ts`), not a required dependency — the UI works with any backend that implements the same contract, including someone's own self-hosted instance. This is permanent, not a stopgap for `finorganizer-api` not yet being deployed: it stays "bring your own server" even after `finorganizer-api` ships.

A full local `mockDb.ts` fallback ("Mock Mode") lets the UI run with zero backend at all, for demoing or offline use.
