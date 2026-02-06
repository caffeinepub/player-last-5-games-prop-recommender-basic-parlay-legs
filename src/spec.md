# Specification

## Summary
**Goal:** Move “Last 5 Games” ingestion to the backend by adding a new `ingestPlayer(playerName)` method that calls BallDontLie, stores the latest 5 games in the existing backend `Game` shape, and update the frontend to use this backend ingestion flow end-to-end.

**Planned changes:**
- Backend: Add public `ingestPlayer(playerName: Text) : async ()` in `backend/main.mo` that searches BallDontLie for the player, fetches the most recent 5 games, converts them to `{ points; rebounds; assists; threes; date; opponent }`, and stores them keyed by `playerName` for `getLast5Games(playerName)` to return.
- Backend: Align BallDontLie outcalls to use `https://api.balldontlie.io/v1/...` endpoints for player search and stats retrieval, without requiring any frontend-provided API URL.
- Backend: Reject (trap/throw) with clear English error messages for player not found, stats not found, and network/provider failures.
- Frontend: Update `useIngestLastFiveGamesMutation` to stop calling BallDontLie directly and instead call `actor.ingestPlayer(playerName)`, then invalidate/refetch `['lastFiveGames', playerName]` and `['propRecommendations', playerName]`.
- Frontend: Update `frontend/src/features/playerProps/backendClient.ts` to expose `ingestPlayer(playerName: string): Promise<void>` and keep `getLastFiveGames` mapping working (including backend `threes` to frontend `threesMade`).
- Frontend: Ensure the existing UI flow works end-to-end (player input + “Fetch Last 5 Games” + preview table + recommendations + reset), and no UI requires a “Stats API URL” input.

**User-visible outcome:** A user can enter a player name and click “Fetch Last 5 Games” to ingest via the backend, then see a 5-row last-five-games preview and recommendations automatically, with clear English errors if ingestion fails.
