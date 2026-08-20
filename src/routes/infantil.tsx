import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/site/CatalogPage";
import { getSectionProducts } from "@/lib/catalog";
import { useCatalogVersion } from "@/hooks/use-crm-sync";

export const Route = createFileRoute("/infantil")({
  component: SectionPage,
  head: () => ({
    meta: [
      { title: "Tênis Infantil — Maxor Sports" },
      { name: "description", content: "Coleção infantil Maxor Sports: tênis leves e resistentes para corrida, casual e trail." },
      { property: "og:title", content: "Tênis Infantil — Maxor Sports" },
      { property: "og:description", content: "Tênis infantis com estilo e resistência." },
      { property: "og:url", content: "https://maxorsports.lovable.app/infantil" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://maxorsports.lovable.app/infantil" }],
  }),
});

function SectionPage() {
  useCatalogVersion();
  const products = getSectionProducts("infantil");
  return (
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
      products={products}
      brands={["Adidas", "Nike", "New Balance", "Asics", "Puma"]}
      categories={["Corrida", "Casual", "Trail"]}
      sizes={[26, 27, 28, 29, 30, 31, 32, 33, 34]}
    />
  );
}
