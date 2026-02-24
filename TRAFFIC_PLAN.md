# x402-canary Traffic Plan

This plan avoids dependence on X reach and focuses on developer + agent discovery channels.

## What is already live

- GitHub Pages dashboard with SEO metadata and structured data.
- `robots.txt` + `sitemap.xml` for crawler indexing.
- `llms.txt`, `agent-catalog.json`, and `.well-known/agent.json` for agent/LLM discovery.
- Backend paid routes now publish x402 Bazaar discovery extension metadata.
- `/ops/traffic/sources` shows where paid calls come from.

## Distribution targets

1. x402 Bazaar discovery (automatic)
- Keep backend reachable and paid endpoints healthy.
- Agents/facilitators can catalog from payment metadata.

2. GitHub-native discovery
- Enable repo topics: `x402`, `base-sepolia`, `agent-payments`, `web3`, `ai-agents`.
- Pin `x402-canary-frontend` on profile.

3. High-signal dev communities
- Coinbase x402 Discord channels
- Base/Farcaster builder channels
- Agent engineering communities (Discord/Slack)

4. Link placements with direct utility
- Add this project to x402-related awesome lists and ecosystem docs.
- Share only one canonical URL: https://tinycrops.github.io/x402-canary-frontend/

## Copy block for non-X posts

Use this exact text in Discord, Farcaster, GitHub Discussions, and builder chats:

```
x402-canary: public Base Sepolia sandbox for testing paid agent calls.

Dashboard: https://tinycrops.github.io/x402-canary-frontend/
Agent descriptor: https://ath-ms-7a73.tail6017fa.ts.net:8443/agent.json

Paid endpoints:
- /tool/weather
- /tool/summarize
- /market/snapshot
- /market/recommendations
- /market/alerts

Designed for agent developers who want traceable x402 payment + settlement behavior before mainnet.
```

## Success criteria

- `byOrigin` and `byReferer` in `/ops/traffic/sources` show non-`direct/none` entries.
- Daily unique user-agent count grows week-over-week.
- Paid hit mix broadens beyond internal checks.
