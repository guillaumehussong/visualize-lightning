import { copy } from "@/lib/copy";
import { MachineCanvasClient } from "@/components/scene/MachineCanvasClient";
import { StatsBar } from "@/components/scene/StatsBar";
import { PieceNav } from "@/components/scene/PieceNav";

export default function Home() {
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
      </header>

      <PieceNav />
      <StatsBar />
    </main>
  );
}
