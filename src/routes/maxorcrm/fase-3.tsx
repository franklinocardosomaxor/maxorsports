import { createFileRoute } from "@tanstack/react-router";
import { Fase3Finance } from "@/components/maxorcrm/Fase3Finance";

export const Route = createFileRoute("/maxorcrm/fase-3")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "MaxorCRM · Financeiro · Contas a pagar e a receber" },
      { name: "description", content: "Controle financeiro interno da Maxor Sports: contas a pagar, contas a receber e saldo previsto." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "MaxorCRM · Financeiro" },
      { property: "og:description", content: "Painel financeiro interno restrito da Maxor Sports." },
    ],
  }),
  component: Fase3Finance,
  errorComponent: ({ error }) => (
    <div className="rounded-2xl border border-border bg-card p-8">
      <p role="alert" className="text-sm text-destructive">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="rounded-2xl border border-border bg-card p-8">
      <p className="text-sm text-foreground/70">Módulo não encontrado.</p>
    </div>
  ),
});
