import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/maxorcrm/fase-2")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "MaxorCRM · Fase 2 · Comercial" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <div className="rounded-2xl border border-border bg-card p-8">
      <h1 className="font-display text-2xl font-black uppercase text-offwhite">Fase 2 · Comercial</h1>
      <p className="mt-2 text-foreground/70">Aguardando comandos de migração do Antigravity...</p>
    </div>
  ),
});
