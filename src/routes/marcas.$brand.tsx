import { createFileRoute, notFound } from "@tanstack/react-router";
import { CatalogPage, type CatalogProduct } from "@/components/site/CatalogPage";
import { BRAND_PRODUCTS, getBrand } from "@/components/site/brands-data";
import { getBrandProducts } from "@/lib/catalog";
import { useCatalogVersion } from "@/hooks/use-crm-sync";


const ACCENT_GRADIENT: Record<string, string> = {
  cyan: "linear-gradient(120deg, #0F1720 0%, #103642 55%, #00BFC6 100%)",
  mint: "linear-gradient(120deg, #0F1720 0%, #124638 55%, #7EEBC1 100%)",
  lime: "linear-gradient(120deg, #0F1720 0%, #2c3a12 55%, #C7F500 100%)",
};

export const Route = createFileRoute("/marcas/$brand")({
  loader: ({ params }) => {
    const brand = getBrand(params.brand);
    if (!brand) throw notFound();
    return { brand };
  },
  component: BrandPage,
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Marca não encontrada — Maxor Sports" }, { name: "robots", content: "noindex" }] };
    }
    const { brand } = loaderData;
    const url = `https://maxorsports.lovable.app/marcas/${params.brand}`;
    return {
      meta: [
        { title: `${brand.name} — Maxor Sports` },
        { name: "description", content: `Tênis ${brand.name} com curadoria Maxor Sports: ${brand.tagline}.` },
        { property: "og:title", content: `${brand.name} — Maxor Sports` },
        { property: "og:description", content: `Coleção ${brand.name} — ${brand.tagline}.` },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },

});

function BrandPage() {
  const { brand } = Route.useLoaderData();
  const products = BRAND_PRODUCTS[brand.slug] ?? [];
  const categories = Array.from(new Set(products.map((p) => p.category)));
  const sizes = Array.from(new Set(products.flatMap((p) => p.sizes))).sort((a, b) => a - b);

  return (
    <CatalogPage
      activeNav="Marcas"
      breadcrumb={["Marcas", brand.name]}
      theme={{
        eyebrow: "Marca Maxor",
        title: brand.name,
        subtitle: `${brand.tagline} — curadoria Maxor Sports com os principais lançamentos e clássicos da ${brand.name}.`,
        headerGradient: ACCENT_GRADIENT[brand.accent],
        accent: brand.accent,
      }}
      products={products}
      brands={[brand.name]}
      categories={categories.length > 0 ? categories : ["Casual"]}
      sizes={sizes.length > 0 ? sizes : [38, 39, 40, 41, 42, 43]}
    />
  );
}
