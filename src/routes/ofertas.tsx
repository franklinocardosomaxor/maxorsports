import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CatalogPage, type CatalogProduct } from "@/components/site/CatalogPage";
import { ALL_PRODUCTS, groupProductsByModel, type ProductWithSection } from "@/lib/catalog";
import { useCatalogVersion } from "@/hooks/use-crm-sync";


export const Route = createFileRoute("/ofertas")({
  component: OfertasPage,
  head: () => ({
    meta: [
      { title: "Ofertas — Maxor Sports" },
      {
        name: "description",
        content:
          "Ofertas Maxor Sports: descontos reais em tênis de corrida, casual, trail e combos promocionais montados a dedo.",
      },
      { property: "og:title", content: "Ofertas — Maxor Sports" },
      {
        property: "og:description",
        content: "Descontos reais + combos promocionais Maxor Sports.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://maxorsports.lovable.app/ofertas" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://maxorsports.lovable.app/ofertas" }],
  }),
});

function OfertasPage() {
  // Muda a cada sincronização do CRM (realtime) e refaz os memos abaixo.
  const catalogVersion = useCatalogVersion();

  // Ofertas = produtos marcados como "ofertas" no CRM + qualquer produto
  // com preço antigo maior que o atual + a vitrine base local.
  const products = useMemo(() => {
    const seen = new Set<string>();
    const out: ProductWithSection[] = [];
    for (const p of ALL_PRODUCTS) {
      const isOffer = p.selo === "oferta";
      if (!isOffer || seen.has(p.id)) continue;
      seen.add(p.id);
      out.push(p);
    }
    return groupProductsByModel(out) as unknown as CatalogProduct[];
  }, [catalogVersion]);


  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [products],
  );
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products],
  );
  const sizes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.sizes))).sort((a, b) => a - b),
    [products],
  );

  return (
    <div>
      {/* Catálogo padrão (mesmo layout de masculino/feminino/infantil) */}
      <CatalogPage
        activeNav="Ofertas"
        breadcrumb={["Ofertas"]}
        theme={{
          eyebrow: "Semana Maxor",
          title: "Ofertas Imperdíveis",
          subtitle:
            "Descontos reais nos tênis mais procurados. Combos promocionais montados a dedo para você somar itens e economizar mais.",
          headerGradient:
            "linear-gradient(120deg, #0F1720 0%, #3a2b12 55%, #C7F500 100%)",
          accent: "lime",
        }}
        products={products}
        brands={brands}
        categories={categories}
        sizes={sizes.length > 0 ? sizes : [38, 39, 40, 41, 42, 43, 44, 45]}
      />

    </div>
  );
}
