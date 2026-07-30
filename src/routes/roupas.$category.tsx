import { createFileRoute, notFound } from "@tanstack/react-router";
import { CatalogPage } from "@/components/site/CatalogPage";
import { ROUPA_PRODUCTS, getRoupa } from "@/components/site/roupas-data";

const ACCENT_GRADIENT: Record<string, string> = {
  cyan: "linear-gradient(120deg, #0F1720 0%, #103642 55%, #00BFC6 100%)",
  mint: "linear-gradient(120deg, #0F1720 0%, #124638 55%, #7EEBC1 100%)",
  lime: "linear-gradient(120deg, #0F1720 0%, #2c3a12 55%, #C7F500 100%)",
};

export const Route = createFileRoute("/roupas/$category")({
  loader: ({ params }) => {
    const roupa = getRoupa(params.category);
    if (!roupa) throw notFound();
    return { roupa };
  },
  component: RoupaCategoryPage,
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Categoria não encontrada — Maxor Sports" }, { name: "robots", content: "noindex" }] };
    }
    const { roupa } = loaderData;
    const url = `https://maxorsports.lovable.app/roupas/${params.category}`;
    return {
      meta: [
        { title: `Roupas ${roupa.name} — Maxor Sports` },
        { name: "description", content: `Roupas ${roupa.name} com curadoria Maxor Sports: ${roupa.tagline}.` },
        { property: "og:title", content: `Roupas ${roupa.name} — Maxor Sports` },
        { property: "og:description", content: `${roupa.tagline} — coleção Maxor Sports.` },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },

});

function RoupaCategoryPage() {
  const { roupa } = Route.useLoaderData();
  const products = ROUPA_PRODUCTS[roupa.slug] ?? [];
  const categories = Array.from(new Set(products.map((p) => p.category)));
  const brands = Array.from(new Set(products.map((p) => p.brand)));
  const sizes = Array.from(new Set(products.flatMap((p) => p.sizes))).sort((a, b) => a - b);

  return (
    <CatalogPage
      activeNav="Roupas"
      breadcrumb={["Roupas", roupa.name]}
      theme={{
        eyebrow: "Coleção Maxor",
        title: `Roupas ${roupa.name}`,
        subtitle: `${roupa.tagline} — curadoria Maxor Sports com peças pensadas pro seu esporte.`,
        headerGradient: ACCENT_GRADIENT[roupa.accent],
        accent: roupa.accent,
      }}
      products={products}
      brands={brands.length > 0 ? brands : ["Maxor"]}
      categories={categories.length > 0 ? categories : [roupa.name]}
      sizes={sizes.length > 0 ? sizes : [36, 38, 40, 42, 44, 46]}
    />
  );
}
