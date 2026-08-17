# Bounty Sentinel

Bounty Sentinel turns changing public bounty and hackathon pages into evidence-backed opportunities without confusing credits, hardware, or headline prize pools with cash.

The project was started after the Into the Scrape-Verse organizer declared the hackathon live on 2026-08-17. It is being built from scratch during the event window.

## Current vertical slice

- A strict opportunity schema separates cash, in-kind prizes, and credits.
- Every cash claim requires short, direct source evidence.
- Missing fields trigger a fail-closed drift gate instead of silently publishing incomplete data.
- Ranking is deterministic and explains deadline, cash, status, and remaining human actions.
- A synthetic fixture demonstrates the pipeline without copying third-party page content.

```bash
npm install
npm run check
npm run demo
```

## Bright Data integration

The next event-window milestone is a custom Scraper Studio collector created with the official Bright Data CLI. Collector receipts will be sanitized before they are committed: no API keys, cookies, account identifiers, private URLs, or source page bodies belong in this repository.

The intended chain is:

```text
Scraper Studio custom collector
  -> structured opportunity JSON
  -> drift and evidence gate
  -> deterministic ranking
  -> explainable dashboard
```

## Safety and evidence boundaries

- Public pages only; no login-gated, personal, paywalled, or restricted data.
- A page saying `PAID` or listing credits is not treated as contributor cash without explicit evidence.
- Synthetic fixtures are clearly labelled and never presented as live scraper results.
- AI-assisted development and validation are disclosed. The entrant remains responsible for the implementation and final submission.

## License

MIT
