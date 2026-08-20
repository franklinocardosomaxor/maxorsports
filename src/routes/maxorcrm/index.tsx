import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Boxes, Kanban, Plug, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/maxorcrm/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "MaxorCRM — Visão geral" },
      { name: "description", content: "Visão geral das três fases do MaxorCRM da Maxor Sports." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "MaxorCRM — Visão geral" },
      { property: "og:description", content: "Catálogo, comercial e operação em um só painel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Overview,
});

function Overview() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [p, pv, c, d, a] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("site_visible", true),
        supabase.from("contacts").select("id", { count: "exact", head: true }),
        supabase.from("deals").select("id", { count: "exact", head: true }),
        supabase.from("activities").select("id", { count: "exact", head: true }),
      ]);
      if (!active) return;
      setCounts({
        produtos: p.count ?? 0,
        publicados: pv.count ?? 0,
        contatos: c.count ?? 0,
        negocios: d.count ?? 0,
        atividades: a.count ?? 0,
      });
    })();
    return () => {
      active = false;
    };
  }, []);

  const cards = [
    {
      to: "/maxorcrm/fase-1" as const,
      icon: Boxes,
      title: "Estoque (Fase 1)",
      desc: "Cadastre produtos reais: SKU, nome, marca, custo/frete/margem, fotos e selos (Destaque/Lançamento).",
      stat: counts && `${counts.publicados}/${counts.produtos} publicados`,
    },
    {
      to: "/maxorcrm/fase-2" as const,
      icon: Kanban,
      title: "Vendas (Fase 2)",
      desc: "Gestão comercial, contatos, negócios e pipeline de vendas.",
      stat: counts && `${counts.contatos} contatos · ${counts.negocios} negócios`,
    },
    {
      to: "/maxorcrm/fase-3" as const,
      icon: Plug,
      title: "Financeiro (Fase 3)",
      desc: "Operação financeira, fluxo de caixa e atividades do sistema.",
      stat: counts && `${counts.atividades} atividades`,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {cards.map(({ to, icon: Icon, title, desc, stat }) => (
        <Link
          key={to}
          to={to}
          className="rounded-2xl border border-border bg-card p-6 transition hover:border-[color:var(--cyan-brand)] hover:brightness-110"
        >
          <Icon className="h-6 w-6 text-[color:var(--cyan-brand)]" />
          <h2 className="mt-3 font-display text-lg font-black uppercase text-offwhite">{title}</h2>
          <p className="mt-1 text-sm text-foreground/65">{desc}</p>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[color:var(--mint-brand)]">
            {stat ?? <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          </p>
        </Link>
      ))}
    </section>
  );
}
