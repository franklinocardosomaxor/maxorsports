import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/site/CatalogPage";
import { FEMININO } from "@/components/site/catalog-data";

export const Route = createFileRoute("/feminino")({
  component: () => (
    <CatalogPage
      activeNav="Feminino"
      breadcrumb={["Feminino", "Tênis"]}
      theme={{
        eyebrow: "Coleção Maxor",
        title: "Tênis Feminino",
        subtitle: "Movimento, leveza e atitude. Modelos selecionados pra treino, corrida e street — sempre com a energia Maxor.",
        headerGradient: "linear-gradient(120deg, #0F1720 0%, #124638 55%, #7EEBC1 100%)",
        accent: "mint",
      }}
      products={FEMININO}
      brands={["Adidas", "Nike", "New Balance", "Asics", "Puma"]}
      categories={["Corrida", "Casual", "Trail", "Training"]}
      sizes={[33, 34, 35, 36, 37, 38, 39, 40]}
    />
  ),
  head: () => ({
    meta: [
      { title: "Tênis Feminino — Maxor Sports" },
      { name: "description", content: "Coleção feminina Maxor Sports: tênis de corrida, casual, trail e training com curadoria premium." },
      { property: "og:title", content: "Tênis Feminino — Maxor Sports" },
      { property: "og:description", content: "Tênis femininos com performance e estilo." },
          { property: "og:url", content: "https://maxorsports.lovable.app/feminino" },
],
    links: [{ rel: "canonical", href: "https://maxorsports.lovable.app/feminino" }],
  }),
});
