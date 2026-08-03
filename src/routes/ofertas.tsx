import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Plus, Minus, ImagePlus, Sparkles, Trash2 } from "lucide-react";
import { Shell } from "@/components/site/Shell";
import { CatalogPage, type CatalogProduct } from "@/components/site/CatalogPage";
import { PROMO_COMBOS, type PromoCombo } from "@/components/site/ofertas-data";
import { ALL_PRODUCTS, getSectionProducts } from "@/lib/catalog";
import { useCatalogVersion } from "@/hooks/use-crm-sync";


const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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
          { property: "og:url", content: "https://maxorsports.lovable.app/ofertas" },
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
    const out: CatalogProduct[] = [];
    for (const p of ALL_PRODUCTS) {
      const isOffer =
        p.selo === "oferta" || p.section === "ofertas" || (!!p.old && p.old > p.price);
      if (!isOffer || seen.has(p.id)) continue;
      seen.add(p.id);
      out.push(p as unknown as CatalogProduct);
    }
    return out;
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

// Silence unused-import lint.
void Shell;
void ChevronRight;
void Link;
void PROMO_COMBOS;
void getSectionProducts;
