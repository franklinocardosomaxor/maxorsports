import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/site/CatalogPage";
import { MASCULINO } from "@/components/site/catalog-data";

export const Route = createFileRoute("/masculino")({
  component: () => (
    <CatalogPage
      activeNav="Masculino"
      breadcrumb={["Masculino", "Tênis"]}
      theme={{
        eyebrow: "Coleção Maxor",
        title: "Tênis Masculino",
        subtitle: "Performance com seu estilo. Corrida, basquete, casual, trail e training — curadoria com as principais marcas e drops exclusivos.",
        headerGradient: "linear-gradient(120deg, #0F1720 0%, #103642 55%, #00BFC6 100%)",
        accent: "cyan",
      }}
      products={MASCULINO}
      brands={["Adidas", "Nike", "New Balance", "Asics", "Puma"]}
      categories={["Corrida", "Basquete", "Casual", "Trail", "Training"]}
      sizes={[38, 39, 40, 41, 42, 43, 44, 45]}
    />
  ),
  head: () => ({
    meta: [
      { title: "Tênis Masculino — Maxor Sports" },
      { name: "description", content: "Coleção masculina Maxor Sports: tênis de corrida, basquete, casual, trail e training com curadoria premium." },
      { property: "og:title", content: "Tênis Masculino — Maxor Sports" },
      { property: "og:description", content: "Tênis masculinos com performance e estilo." },
          { property: "og:url", content: "https://maxorsports.lovable.app/masculino" },
],
    links: [{ rel: "canonical", href: "https://maxorsports.lovable.app/masculino" }],
  }),
});
