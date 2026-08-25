import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Carregado sob demanda: o painel de catálogo nunca entra no bundle da vitrine.
const Fase1Catalog = lazy(() =>
  import("@/components/maxorcrm/Fase1Catalog").then((m) => ({ default: m.Fase1Catalog })),
);

export const Route = createFileRoute("/maxorcrm/fase-1")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "MaxorCRM · Fase 1 · Catálogo" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Fase1Route,
});

function Fase1Route() {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <span className="flex items-center gap-2 text-sm text-foreground/70">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando catálogo…
          </span>
        }
      >
        <Fase1Catalog />
      </Suspense>
    </div>
  );
}
