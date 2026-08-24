# Visualize Lightning

The Lightning Network explained as a live 3D machine, running on real network data.

Inspired by [visualizebitcoin.org](https://visualizebitcoin.org) by Tote. He built the
concept for Bitcoin L1; this project brings the same idea to the Lightning Network.

## What it is

A single 3D scene where each Lightning concept is a physical, animated piece of one
big machine: wallet, invoice, channel, liquidity, HTLC, routing, fees, justice,
nodes, and on-chain settlement. The machine runs on live network data (public node
and channel statistics, capacity, fees, block height, price). Lightning payments
are private, so the site never claims to show live payments. It shows live network
data, and says so.

## Stack

- Next.js 15 (App Router), TypeScript strict
- React Three Fiber + drei
- Tailwind CSS
- next-intl (EN at launch, i18n ready)
- Server-side data proxy with TTL cache (mempool.space, blockstream.info, Amboss fallback)

## Development

```bash
npm install
npm run dev
```

## Principles

- No ads, no accounts, no cookies, no third-party trackers.
- Every number on screen is real and verifiable, with its fetch time displayed.
- If upstream data fails, the site shows the last snapshot honestly, marked as stale.

## License

MIT. See LICENSE.
