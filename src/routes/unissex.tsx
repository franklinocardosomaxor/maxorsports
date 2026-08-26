import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/site/CatalogPage";
import { getUnisexProducts } from "@/lib/catalog";
import { useCatalogVersion } from "@/hooks/use-crm-sync";

export const Route = createFileRoute("/unissex")({
  component: UnissexPage,
  head: () => ({
    meta: [
      { title: "Tênis Unissex — Maxor Sports" },
      {
        name: "description",
        content:
          "Tênis unissex Maxor Sports: modelos que servem para todos os estilos, com curadoria de marcas premium e várias cores.",
      },
      { property: "og:title", content: "Tênis Unissex — Maxor Sports" },
      { property: "og:description", content: "Modelos unissex com performance e estilo para todos." },
      { property: "og:url", content: "https://maxorsports.lovable.app/unissex" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://maxorsports.lovable.app/unissex" }],
  }),
});

function UnissexPage() {
  useCatalogVersion();
  const products = getUnisexProducts();
  return (
    <CatalogPage
      activeNav="Unissex"
      breadcrumb={["Unissex", "Tênis"]}
      theme={{
        eyebrow: "Coleção Maxor",
        title: "Tênis Unissex",
        subtitle:
          "Modelos que servem para todos. Corrida, casual, training e lifestyle — cada cor listada individualmente, direto do nosso catálogo.",
        headerGradient: "linear-gradient(120deg, #0F1720 0%, #12463d 55%, #7EEBC1 100%)",
        accent: "mint",
      }}
      products={products}
      brands={["Adidas", "Nike", "New Balance", "Asics", "Puma"]}
      categories={["Corrida", "Casual", "Training", "Trail", "Basquete"]}
      sizes={[35, 36, 37, 38, 39, 40, 41, 42, 43, 44]}
    />
  );
}
