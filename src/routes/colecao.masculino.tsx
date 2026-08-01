import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage, type CatalogProduct } from "@/components/site/CatalogPage";
import { getSectionProducts } from "@/lib/catalog";
import { useCatalogVersion } from "@/hooks/use-crm-sync";

export const Route = createFileRoute("/colecao/masculino")({
  component: ColecaoPage,
  head: () => ({
    meta: [
      { title: "Coleção Maxor Masculino — Maxor Sports" },
      { name: "description", content: "Coleção exclusiva masculina Maxor Sports com drops, performance e lifestyle." },
      { property: "og:title", content: "Coleção Maxor Masculino" },
      { property: "og:description", content: "Seleção exclusiva masculina da Maxor Sports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
          { property: "og:url", content: "https://maxorsports.lovable.app/colecao/masculino" },
],
    links: [{ rel: "canonical", href: "https://maxorsports.lovable.app/colecao/masculino" }],
  }),
});

function ColecaoPage() {
  useCatalogVersion();
  const products = getSectionProducts("masculino") as unknown as CatalogProduct[];
  return (
    <CatalogPage
      activeNav="Masculino"
      breadcrumb={["Coleção", "Masculino"]}
      theme={{
        eyebrow: "Coleção Exclusiva",
        title: "Maxor Masculino",
        subtitle: "Seleção exclusiva da coleção masculina Maxor Sports — drops, performance e streetwear.",
        headerGradient: "linear-gradient(120deg, #0F1720 0%, #103642 55%, #C7F500 100%)",
        accent: "lime",
      }}
      products={products}
      brands={["Adidas", "Nike", "New Balance", "Asics", "Puma"]}
      categories={["Corrida", "Basquete", "Casual", "Trail", "Training"]}
      sizes={[38, 39, 40, 41, 42, 43, 44, 45]}
    />
  );
}
