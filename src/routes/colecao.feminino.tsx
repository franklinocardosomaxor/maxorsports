import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage, type CatalogProduct } from "@/components/site/CatalogPage";
import { getSectionProducts } from "@/lib/catalog";
import { useCatalogVersion } from "@/hooks/use-crm-sync";

export const Route = createFileRoute("/colecao/feminino")({
  component: ColecaoPage,
  head: () => ({
    meta: [
      { title: "Coleção Maxor Feminino — Maxor Sports" },
      { name: "description", content: "Coleção exclusiva feminina Maxor Sports com performance, estilo e atitude." },
      { property: "og:title", content: "Coleção Maxor Feminino" },
      { property: "og:description", content: "Seleção exclusiva feminina da Maxor Sports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
          { property: "og:url", content: "https://maxorsports.lovable.app/colecao/feminino" },
],
    links: [{ rel: "canonical", href: "https://maxorsports.lovable.app/colecao/feminino" }],
  }),
});

function ColecaoPage() {
  useCatalogVersion();
  const products = getSectionProducts("feminino") as unknown as CatalogProduct[];
  return (
    <CatalogPage
      activeNav="Feminino"
      breadcrumb={["Coleção", "Feminino"]}
      theme={{
        eyebrow: "Coleção Exclusiva",
        title: "Maxor Feminino",
        subtitle: "Seleção exclusiva da coleção feminina Maxor Sports — potência, estilo e atitude.",
        headerGradient: "linear-gradient(120deg, #0F1720 0%, #103642 55%, #00BFC6 100%)",
        accent: "cyan",
      }}
      products={products}
      brands={["Adidas", "Nike", "New Balance", "Asics", "Puma"]}
      categories={["Corrida", "Casual", "Trail", "Training"]}
      sizes={[34, 35, 36, 37, 38, 39, 40]}
    />
  );
}
