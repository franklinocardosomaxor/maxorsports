import { createFileRoute } from "@tanstack/react-router";
import { Fase1Catalog } from "@/components/maxorcrm/Fase1Catalog";

export const Route = createFileRoute("/maxorcrm/fase-1")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "MaxorCRM · Fase 1 · Catálogo" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <div className="space-y-6">
      <Fase1Catalog />
    </div>
  ),
});
