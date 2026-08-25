import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { getCopy } from "@/lib/copy";
import { Link } from "@/i18n/navigation";
import { MachineCanvasClient } from "@/components/scene/MachineCanvasClient";
import { StatsBar } from "@/components/scene/StatsBar";
import { PieceNav } from "@/components/scene/PieceNav";
import { PiecePanel } from "@/components/scene/PiecePanel";
import { PieceDeepLink } from "@/components/scene/PieceDeepLink";
import { HostPanel } from "@/components/scene/HostPanel";
import { MobileNav } from "@/components/scene/MobileNav";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const copy = getCopy(locale);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <MachineCanvasClient />

      <header className="pointer-events-none fixed inset-x-0 top-0 z-10 flex items-start justify-between p-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            {copy.siteTitle}
          </h1>
          <p className="text-sm text-muted">{copy.tagline}</p>
        </div>
        <nav className="pointer-events-auto flex gap-3 font-mono text-xs text-muted">
          <Link href="/about" className="hover:text-accent-soft">
            {copy.about}
          </Link>
          <a
            href="https://github.com/guillaumehussong/visualize-lightning"
            target="_blank"
            rel="noreferrer"
            className="hover:text-accent-soft"
          >
            {copy.github}
          </a>
        </nav>
      </header>

      <Suspense fallback={null}>
        <PieceDeepLink />
      </Suspense>
      <PieceNav />
      <MobileNav />
      <PiecePanel />
      <HostPanel />
      <StatsBar />
    </main>
  );
}
