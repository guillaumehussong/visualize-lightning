import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About - Visualize Lightning",
  description:
    "Who built this live 3D Lightning machine, why it exists, and what Watt the host really is.",
};

const section = "mb-8";
const h2 = "mb-2 font-mono text-xs uppercase tracking-widest text-accent-soft";
const p = "mb-3 leading-relaxed text-foreground/90";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="font-mono text-xs text-muted hover:text-accent-soft">
        &larr; back to the machine
      </Link>

      <h1 className="mb-8 mt-4 text-2xl font-semibold">About</h1>

      <section className={section}>
        <h2 className={h2}>What this is</h2>
        <p className={p}>
          The Lightning Network explained as a live 3D machine. Every piece you
          see is a real part of how Lightning works: a wallet, an invoice, a
          channel, liquidity, HTLCs, routing, fees, justice, nodes, and the
          Bitcoin bedrock below. The numbers on screen are read from public
          network data while you watch.
        </p>
        <p className={p}>
          Lightning payments are private. This site never claims to show live
          payments. It shows live network data: nodes, channels, capacity,
          fees, blocks. Every number carries its fetch time.
        </p>
      </section>

      <section className={section}>
        <h2 className={h2}>Why it exists</h2>
        <p className={p}>
          Everyone explains Lightning with words, and it stays abstract:
          channels, liquidity, HTLCs, things you have to take on faith. But it
          is a machine, and a machine can be shown. This site exists so you can
          point at each part and watch it move.
        </p>
      </section>

      <section className={section}>
        <h2 className={h2}>Watt is a character</h2>
        <p className={p}>
          The mechanic in the corner is not a person. Watt is a written
          character: his guided tour is a hand-written script read by a
          synthetic voice, and his live answers come from an AI model that may
          only use a short fact card per piece. If he gets something wrong,
          that is the author&apos;s error, and it gets fixed.
        </p>
      </section>

      <section className={section}>
        <h2 className={h2}>How it is built</h2>
        <p className={p}>
          Next.js and React Three Fiber, drawn live in your browser in real 3D.
          Network data comes from mempool.space and blockstream.info through a
          small server cache, so the site works even where those APIs are
          blocked. No ads, no accounts, no cookies, no trackers.
        </p>
      </section>

      <section className={section}>
        <h2 className={h2}>Credit</h2>
        <p className={p}>
          The concept comes from{" "}
          <a
            href="https://visualizebitcoin.org"
            className="text-accent-soft underline"
            target="_blank"
            rel="noreferrer"
          >
            visualizebitcoin.org
          </a>
          , built by Tote for Bitcoin layer 1. This project brings the same
          idea to the Lightning Network, with his inspiration fully
          acknowledged.
        </p>
      </section>

      <section className={section}>
        <h2 className={h2}>Who made it</h2>
        <p className={p}>
          <a
            href="https://x.com/glass_bit"
            className="text-accent-soft underline"
            target="_blank"
            rel="noreferrer"
          >
            Guillaume
          </a>
          , an independent builder in El Salvador. The code is open source
          under the MIT license:{" "}
          <a
            href="https://github.com/guillaumehussong/visualize-lightning"
            className="text-accent-soft underline"
            target="_blank"
            rel="noreferrer"
          >
            github.com/guillaumehussong/visualize-lightning
          </a>
          .
        </p>
      </section>
    </main>
  );
}
