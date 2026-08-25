import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Carregado sob demanda: o painel comercial nunca entra no bundle da vitrine.
const Fase2Sales = lazy(() =>
  import("@/components/maxorcrm/Fase2Sales").then((m) => ({ default: m.Fase2Sales })),
);

export const Route = createFileRoute("/maxorcrm/fase-2")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "MaxorCRM · Fase 2 · Comercial" },
      { name: "description", content: "Painel comercial do MaxorCRM: pipeline de negócios, contatos e atividades." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "MaxorCRM · Fase 2 · Comercial" },
      { property: "og:description", content: "Pipeline de vendas interno da Maxor Sports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Fase2Route,
});

function Fase2Route() {
  return (
    <Suspense
      fallback={
        <span className="flex items-center gap-2 text-sm text-foreground/70">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando painel comercial…
        </span>
      }
    >
      <Fase2Sales />
    </Suspense>
  );
}
