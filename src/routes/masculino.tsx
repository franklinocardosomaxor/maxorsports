import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/site/CatalogPage";
import { getSectionProducts } from "@/lib/catalog";
import { useCatalogVersion } from "@/hooks/use-crm-sync";

if (typeof window !== "undefined") console.log("[DBG masc] module loaded");

export const Route = createFileRoute("/masculino")({
  component: SectionPage,
  head: () => ({
    meta: [
      { title: "Tênis Masculino — Maxor Sports" },
      { name: "description", content: "Coleção masculina Maxor Sports: tênis de corrida, basquete, casual, trail e training com curadoria premium." },
      { property: "og:title", content: "Tênis Masculino — Maxor Sports" },
      { property: "og:description", content: "Tênis masculinos com performance e estilo." },
      { property: "og:url", content: "https://maxorsports.lovable.app/masculino" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://maxorsports.lovable.app/masculino" }],
  }),
});

function SectionPage() {
  useCatalogVersion();
  const products = getSectionProducts("masculino");
  if (typeof window !== "undefined") console.log("[DBG masc] render", products.length);
  useEffect(() => { console.log("[DBG masc] committed", products.length, document.querySelectorAll('a[href^="/produto/"]').length); });
  return (
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
      products={products}
      brands={["Adidas", "Nike", "New Balance", "Asics", "Puma"]}
      categories={["Corrida", "Basquete", "Casual", "Trail", "Training"]}
      sizes={[38, 39, 40, 41, 42, 43, 44, 45]}
    />
  );
}
