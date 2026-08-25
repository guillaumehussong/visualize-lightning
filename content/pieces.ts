/**
 * The piece cards: facts the host may say, the guided-tour narration script,
 * and panel copy. This file is the single source of truth for the host's
 * system prompts (phase 5). EN only at launch; the record shape is ready for
 * locale wrapping. Rules: simple words, one idea per sentence, no jargon
 * without a one-line explanation, no em dashes.
 */
export interface PieceContent {
  id: string;
  title: string;
  tagline: string;
  /** short bullets shown in the side panel */
  facts: string[];
  /** guided tour script, ~90 seconds when read aloud */
  narration: string;
}

export const PIECE_CONTENT: Record<string, PieceContent> = {
  wallet: {
    id: "wallet",
    title: "Wallet",
    tagline: "Where your sats live",
    facts: [
      "A Lightning wallet is a Bitcoin wallet that can open payment channels.",
      "Some wallets hold your keys for you (custodial). Some leave you in full control (self-custodial).",
      "Your balance off-chain is still your bitcoin. It is just parked inside channels.",
    ],
    narration:
      "Every payment on this machine starts here, in a wallet. A Lightning wallet is a normal Bitcoin wallet with one extra skill: it knows how to open payment channels. When you put bitcoin into Lightning, your coins do not go anywhere strange. They move into a shared account between you and one other node, and only you two can touch them. Some wallets do all of this for you and hold your keys, which is simple but means trusting a company. Other wallets leave every key in your hands. That is more work, and more freedom. Either way, the sats you see here are real bitcoin. Look at the counter: this is what one US dollar is worth in sats right now, live.",
  },
  invoice: {
    id: "invoice",
    title: "Invoice",
    tagline: "A signed payment request",
    facts: [
      "To receive a payment you create an invoice: amount, destination, expiry, and a payment hash.",
      "Invoices are long strings starting with lnbc. They can also be shown as a QR code.",
      "Most invoices expire, often after one hour. An expired invoice cannot be paid.",
    ],
    narration:
      "On Lightning, you do not just receive money out of nowhere. First you ask for it, with an invoice. An invoice is a short signed message that says: who I am, how much I want, and which secret lock the payer must open. It looks like a long string of letters starting with lnbc, and your wallet can show it as a QR code. Inside there is an amount, a destination, an expiry time, and something called a payment hash. That hash is the public half of a secret. Only the receiver knows the secret itself, and revealing it is what finally settles the payment. Most invoices live for about an hour. After that, they are just paper.",
  },
  channel: {
    id: "channel",
    title: "Channel",
    tagline: "A shared 2-of-2 UTXO",
    facts: [
      "A channel is one Bitcoin UTXO shared between two nodes. Both must sign to move it.",
      "The capacity is fixed at opening. Only the split between the two sides changes.",
      "Right now the whole network holds thousands of BTC inside channels like this one.",
    ],
    narration:
      "This tube is the heart of Lightning: a payment channel. Under the hood it is one real Bitcoin transaction output, locked on-chain, shared between two nodes. Two keys, two owners, and both must agree to move anything. That is why it needs no trust. The total amount in the tube, the capacity, is fixed when the channel opens. What changes with every payment is only the split: how much sits on my side, how much on yours. Payments on Lightning are just two partners updating this split, thousands of times, without touching the blockchain. The numbers on screen are live: this is how many channels exist on the real network right now, and how much bitcoin they hold together.",
  },
  liquidity: {
    id: "liquidity",
    title: "Liquidity",
    tagline: "Which way the tube can push",
    facts: [
      "You can only send what sits on your side of the channel. That is outbound liquidity.",
      "To receive, the other side must have funds to push. That is inbound liquidity.",
      "Shops need inbound. Liquidity service providers sell it as a service.",
    ],
    narration:
      "Look inside the tube. The orange liquid is the capacity, and the wall in the middle is the split. You can only push what is on your side. If your side is empty, your payment stops, no matter how big the channel is. Sending needs liquid on your side: outbound liquidity. Receiving needs liquid on the other side: inbound liquidity. This is the part beginners never see coming. A shop that only receives payments must first find inbound capacity, or every payment fails. That is why liquidity providers exist: they rent you space on their side of the tube. Watch the levels move. Every real payment on the network is one of these little tides.",
  },
  htlc: {
    id: "htlc",
    title: "HTLC",
    tagline: "A safe with two locks",
    facts: [
      "HTLC stands for Hashed Time-Locked Contract.",
      "The receiver opens the safe by revealing the secret, called the preimage.",
      "If the secret never comes, a timer refunds the sender automatically.",
    ],
    narration:
      "How do you pay a stranger through other strangers, with no trust anywhere? With this: a safe with two locks, called an HTLC. The first lock is a hash. The receiver's wallet created a secret, and only showed its fingerprint. Whoever reveals the secret opens the safe and takes the money. The second lock is a timer. If the secret never shows up before the deadline, the safe refunds the sender, automatically. No judge, no support ticket, no chargeback. These two locks together mean a payment can travel across the whole network, and nobody in the middle can keep the coins. They either pass the secret along, or everyone gets refunded. A channel can hold hundreds of these safes at once.",
  },
  routing: {
    id: "routing",
    title: "Routing",
    tagline: "The sats GPS",
    facts: [
      "You do not need a direct channel with the person you pay. The network finds a path.",
      "Each hop is one HTLC wrapped inside the next, like nested envelopes.",
      "Nodes only see the previous and next hop. Onion routing hides the full path.",
    ],
    narration:
      "You have a channel with one node. The person you want to pay is three nodes away. No problem: the network finds a path, like a GPS for your sats. Your wallet wraps the payment in nested envelopes, one per hop. Each node opens only its own envelope, sees where to pass the package next, and forwards it. No node in the middle knows who sent the payment or who finally receives it. Watch the light travel across this graph. These are real nodes from the live network, and the path between them is computed from real connections. If one path fails, the wallet simply tries another route. That is why Lightning works without asking anyone for permission.",
  },
  fees: {
    id: "fees",
    title: "Fees",
    tagline: "Tiny tolls on the way",
    facts: [
      "Every routing node charges a toll: a small fixed base fee plus a rate per million sats.",
      "The live network average is shown here in ppm: parts per million.",
      "Routing a payment usually costs a fraction of a cent.",
    ],
    narration:
      "Nothing is free, not even on Lightning. Every node that forwards your payment charges a tiny toll. It has two parts: a fixed base fee, a fraction of a cent, plus a rate measured in parts per million of the amount you send. The arches on this path are the toll booths, and you can see the sparks they collect as the payment passes through. The number on screen is the live average fee rate of the whole network, straight from public data. Compare it with what a card network charges a shop: around three percent. Here, routing a payment usually costs less than a single cent. That difference is why people bother building all of this.",
  },
  justice: {
    id: "justice",
    title: "Justice",
    tagline: "Cheat and lose it all",
    facts: [
      "Every channel update is a signed commitment. Old states are revoked on purpose.",
      "Broadcasting an old state lets your partner take the whole channel balance.",
      "Watchtowers can enforce this while you are offline.",
    ],
    narration:
      "What stops your channel partner from closing the channel with an old balance, one where they had more? This hammer. Every time the split changes, both partners sign a new state and arm a trap against the old one. If you ever broadcast a revoked state, the other side can present proof and take everything in the channel. Not their share. Everything. The penalty is the whole design: cheating costs more than it pays, so nobody cheats. And if you are offline for weeks? You can hire a watchtower, a quiet guard that watches the chain and drops the hammer for you. Lightning does not need honest participants. It just needs this balance of terror.",
  },
  nodes: {
    id: "nodes",
    title: "Nodes",
    tagline: "Who runs the network",
    facts: [
      "The network is thousands of public nodes run by companies, shops, and hobbyists.",
      "Big routing nodes keep hundreds of channels open and earn the tolls.",
      "Many nodes run over Tor. You only see the public part of the network here.",
    ],
    narration:
      "Step back. The machine you have been exploring is just one tiny part of a constellation. Every point of light here is a real public node, from the live snapshot of the network. Some are professional routers, companies that keep thousands of channels open and live off the tolls. Some are shops. Some are people running a node on a small computer in their living room. Many hide behind Tor, and private channels never appear in public data at all. So the real network is bigger than what you see. Nobody owns this constellation, nobody can switch it off, and anyone can add a star. The counter below is the live number of public nodes right now.",
  },
  settlement: {
    id: "settlement",
    title: "Settlement",
    tagline: "The Bitcoin bedrock below",
    facts: [
      "Opening and closing a channel are the only two moments that touch the blockchain.",
      "Everything between is just signed promises. The chain is the final judge.",
      "The blocks passing under the machine are the real latest Bitcoin blocks.",
    ],
    narration:
      "Under the whole machine, there is bedrock: the Bitcoin blockchain. Lightning never replaces it. It leans on it. A channel touches the chain exactly twice: once when it opens, once when it closes. In between, thousands of payments can happen as pure signed promises, fast and cheap, because everyone knows the chain is there to settle any dispute. Watch the blocks of rock passing below. These are the real latest Bitcoin blocks, pulled live from the network, one roughly every ten minutes. Every channel in the constellation above is anchored in this rock. Lightning is fast because Bitcoin is slow and solid. That is the whole trick of this machine.",
  },
};

export const PIECE_CONTENT_LIST: PieceContent[] = Object.values(PIECE_CONTENT);
