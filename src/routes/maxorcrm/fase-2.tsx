import { createFileRoute } from "@tanstack/react-router";
import { Fase2Sales } from "@/components/maxorcrm/Fase2Sales";

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
  component: () => <Fase2Sales />,
});
