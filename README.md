# x402-canary-frontend

Public frontend for the @tinycrops x402 testnet marketplace.

- Frontend hosting: GitHub Pages
- Backend hosting: Tailscale Funnel (private service)

## Local edits

1. Update `frontend/config.js` with your current Funnel backend URL.
2. Push to `main`.
3. GitHub Actions deploys `frontend/` to Pages.

## Security model

- This repo must remain static frontend only.
- Never commit backend code, `.env`, keys, or wallet material here.
