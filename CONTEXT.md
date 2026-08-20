# FinOrganizer UI

A personal finance dashboard: multi-currency accounts, asset portfolio tracking, cash flow forecasting, and budget analysis. Frontend only — see [`finorganizer-api`](https://github.com/guibranco/finorganizer-api) for the reference backend implementation ([ADR-0002](./docs/adr/0002-pluggable-backend-connection.md)).

## Language

**Live Mode**:
The app is connected to a real, user-configured backend API (URL + auth key), reading and writing real data.
_Avoid_: Secure Mode, Connected Mode

**Mock Mode**:
The app runs entirely against a local, in-browser fake database (`mockDb.ts`), with no backend at all — used for sandboxing and demos.
_Avoid_: Sandbox, Demo Mode
