import { createFileRoute, Link } from "@tanstack/react-router";
import { CatalogPage, type CatalogProduct } from "@/components/site/CatalogPage";
import { Shell } from "@/components/site/Shell";
import { getBrandVisual } from "@/components/site/brands-data";
import { getBrandDef, brandSlug } from "@/lib/brands";
import { getBrandDirectory, getBrandProducts, isCatalogLoaded } from "@/lib/catalog";
import { useCatalogVersion } from "@/hooks/use-crm-sync";


const ACCENT_GRADIENT: Record<string, string> = {
  cyan: "linear-gradient(120deg, #0F1720 0%, #103642 55%, #00BFC6 100%)",
  mint: "linear-gradient(120deg, #0F1720 0%, #124638 55%, #7EEBC1 100%)",
  lime: "linear-gradient(120deg, #0F1720 0%, #2c3a12 55%, #C7F500 100%)",
};

/** "new-balance" -> "New Balance" (fallback de título para marcas só do CRM). */
const prettifySlug = (slug: string) =>
  slug.split("-").filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

export const Route = createFileRoute("/marcas/$brand")({
  // Sem loader com notFound: marcas cadastradas só no CRM são descobertas
  // em runtime (o catálogo chega via sync client-side) e ganham página
  // automaticamente — um 404 no loader as derrubaria antes da sincronização.
  component: BrandPage,
  head: ({ params }) => {
    const name = getBrandDef(params.brand)?.name ?? prettifySlug(params.brand);
    const url = `https://maxorsports.lovable.app/marcas/${params.brand}`;
    return {
      meta: [
        { title: `${name} — Maxor Sports` },
        { name: "description", content: `Tênis ${name} com curadoria Maxor Sports: lançamentos e clássicos selecionados.` },
        { property: "og:title", content: `${name} — Maxor Sports` },
        { property: "og:description", content: `Coleção ${name} na Maxor Sports.` },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },

});

function BrandPage() {
  const { brand: slug } = Route.useParams();
  // Re-renderiza quando o CRM sincroniza novos produtos (realtime).
  useCatalogVersion();

  // Diretório vivo: resolve tanto marcas estáticas quanto as vindas do CRM.
  const entry = getBrandDirectory().find((e) => e.slug === slug);

  // Catálogo ainda sincronizando e marca fora da lista estática: aguarda o CRM.
  if (!entry && !isCatalogLoaded()) {
    return (
      <Shell active="Marcas">
        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[color:var(--cyan-brand)] border-t-transparent" />
          <p className="mt-4 text-sm uppercase tracking-widest text-offwhite/60">
            Sincronizando catálogo do CRM…
          </p>
        </div>
      </Shell>
    );
  }

  // Catálogo carregado e a marca não existe nem no CRM: página amigável.
  if (!entry) {
    return (
      <Shell active="Marcas">
        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-offwhite sm:text-4xl">
            Marca não encontrada
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-offwhite/70">
            A marca <span className="font-semibold text-[color:var(--lime-brand)]">{prettifySlug(slug)}</span> ainda
            não faz parte do catálogo Maxor. Assim que for cadastrada no CRM, a página dela entra no ar
            automaticamente.
          </p>
          <Link
            to="/marcas"
            className="mt-6 inline-block rounded-full bg-[color:var(--cyan-brand)] px-6 py-3 text-xs font-bold uppercase tracking-widest text-navy transition hover:brightness-110"
          >
            Ver todas as marcas
          </Link>
        </div>
      </Shell>
    );
  }

  const brand = getBrandVisual(entry);
  // Produtos cadastrados no CRM para esta marca (matching único em brands.ts).
  const products = getBrandProducts(brand.slug) as unknown as CatalogProduct[];

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const sizes = Array.from(new Set(products.flatMap((p) => p.sizes))).sort((a, b) => a - b);


  return (
    <CatalogPage
      activeNav="Marcas"
      breadcrumb={["Marcas", brand.name]}
      theme={{
        eyebrow: entry.fromCrm ? "Nova marca do CRM" : "Marca Maxor",
        title: brand.name,
        subtitle:
          products.length > 0
            ? `${brand.tagline} — curadoria Maxor Sports com os principais lançamentos e clássicos da ${brand.name}.`
            : `A coleção ${brand.name} está sendo preparada no nosso CRM. Em breve os modelos aparecem aqui automaticamente.`,
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

// Mantido para reuso em links internos que montam URL de marca fora do router.
export const brandPagePath = (name: string) => `/marcas/${brandSlug(name)}`;
