import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { BRANDS } from "@/components/site/brands-data";
import { ROUPAS } from "@/components/site/roupas-data";

const BASE_URL = "https://maxorsports.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/masculino", changefreq: "daily", priority: "0.9" },
          { path: "/feminino", changefreq: "daily", priority: "0.9" },
          { path: "/infantil", changefreq: "weekly", priority: "0.8" },
          { path: "/lancamentos", changefreq: "daily", priority: "0.8" },
          { path: "/ofertas", changefreq: "daily", priority: "0.8" },
          { path: "/catalogo", changefreq: "weekly", priority: "0.8" },
          { path: "/categorias", changefreq: "weekly", priority: "0.7" },
          { path: "/marcas", changefreq: "weekly", priority: "0.7" },
          { path: "/roupas", changefreq: "weekly", priority: "0.7" },
          { path: "/acessorios", changefreq: "weekly", priority: "0.7" },
          { path: "/eletronicos", changefreq: "weekly", priority: "0.7" },
          { path: "/colecao/masculino", changefreq: "weekly", priority: "0.7" },
          { path: "/colecao/feminino", changefreq: "weekly", priority: "0.7" },
          { path: "/blog/guia-tenis-nike", changefreq: "monthly", priority: "0.6" },

        ];

        for (const brand of BRANDS) {
          entries.push({ path: `/marcas/${brand.slug}`, changefreq: "weekly", priority: "0.6" });
        }
        for (const roupa of ROUPAS) {
          entries.push({ path: `/roupas/${roupa.slug}`, changefreq: "weekly", priority: "0.6" });
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
