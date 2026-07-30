import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/site/CatalogPage";
import { INFANTIL } from "@/components/site/catalog-data";

export const Route = createFileRoute("/infantil")({
  component: () => (
    <CatalogPage
      activeNav="Infantil"
      breadcrumb={["Infantil", "Tênis"]}
      theme={{
        eyebrow: "Coleção Maxor Kids",
        title: "Tênis Infantil",
        subtitle: "Energia dos pequenos atletas. Modelos leves, resistentes e cheios de cor para todas as aventuras.",
        headerGradient: "linear-gradient(120deg, #0F1720 0%, #2c3a12 55%, #C7F500 100%)",
        accent: "lime",
      }}
      products={INFANTIL}
      brands={["Adidas", "Nike", "New Balance", "Asics", "Puma"]}
      categories={["Corrida", "Casual", "Trail"]}
      sizes={[26, 27, 28, 29, 30, 31, 32, 33, 34]}
    />
  ),
  head: () => ({
    meta: [
      { title: "Tênis Infantil — Maxor Sports" },
      { name: "description", content: "Coleção infantil Maxor Sports: tênis leves e resistentes para corrida, casual e trail." },
      { property: "og:title", content: "Tênis Infantil — Maxor Sports" },
      { property: "og:description", content: "Tênis infantis com estilo e resistência." },
          { property: "og:url", content: "https://maxorsports.lovable.app/infantil" },
],
    links: [{ rel: "canonical", href: "https://maxorsports.lovable.app/infantil" }],
  }),
});
