import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LogOut, Users, Briefcase, ShieldCheck, Boxes, Kanban, Plug, Store, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/crm")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel CRM — Maxor Sports" },
      { name: "description", content: "Painel interno de gestão comercial da Maxor Sports." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Painel CRM — Maxor Sports" },
      { property: "og:description", content: "Painel interno da equipe Maxor Sports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminCrmPage,
  errorComponent: ({ error }) => (
    <main className="grid min-h-screen place-items-center bg-background px-4 text-center">
      <p role="alert" className="text-sm text-destructive">{error.message}</p>
    </main>
  ),
  notFoundComponent: () => (
    <main className="grid min-h-screen place-items-center bg-background">
      <p className="text-sm text-foreground/70">Painel não encontrado.</p>
    </main>
  ),
});

type Access = {
  email: string;
  roles: string[];
} | null;

function AdminCrmPage() {
  const navigate = useNavigate();
  const [access, setAccess] = useState<Access>(null);
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<{
    products: number;
    published: number;
    contacts: number;
    deals: number;
    activities: number;
  } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        navigate({ to: "/admin", replace: true });
        return;
      }
      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const roles = Array.from(new Set((roleRows ?? []).map((r) => String(r.role))));
      if (!active) return;
      if (roles.length === 0) {
        setDenied(true);
        setLoading(false);
        return;
      }
      setAccess({ email: user.email ?? "", roles });

      const [productsResult, publishedResult, contactsResult, dealsResult, activitiesResult] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("site_visible", true),
        supabase.from("contacts").select("id", { count: "exact", head: true }),
        supabase.from("deals").select("id", { count: "exact", head: true }),
        supabase.from("activities").select("id", { count: "exact", head: true }),
      ]);
      if (!active) return;
      setCounts({
        products: productsResult.count ?? 0,
        published: publishedResult.count ?? 0,
        contacts: contactsResult.count ?? 0,
        deals: dealsResult.count ?? 0,
        activities: activitiesResult.count ?? 0,
      });
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/admin", replace: true });
  }

  if (loading && !denied) {
    return (
      <main className="grid min-h-screen place-items-center bg-background">
        <span className="flex items-center gap-2 text-sm text-foreground/70">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando painel...
        </span>
      </main>
    );
  }

  if (denied) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-7 text-center">
          <h1 className="font-display text-xl font-black uppercase text-offwhite">Acesso negado</h1>
          <p className="mt-2 text-sm text-foreground/70">
            Sua conta não possui permissão na organização do CRM. Fale com um administrador.
          </p>
          <button
            onClick={handleSignOut}
            className="mt-5 rounded-lg border border-border px-4 py-2 text-xs uppercase tracking-wider text-foreground/80 transition hover:text-offwhite"
          >
            Sair
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="font-display text-3xl font-black uppercase tracking-wide text-offwhite">
              Painel CRM
            </h1>
            <p className="mt-1 flex items-center gap-2 text-xs text-foreground/60">
              <ShieldCheck className="h-4 w-4 text-[color:var(--mint-brand)]" />
              {access?.email} · {access?.roles.join(", ")}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs uppercase tracking-wider text-foreground/80 transition hover:text-offwhite"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-4">
          <StatCard icon={<Boxes className="h-5 w-5" />} label="Produtos" value={counts?.products ?? 0} />
          <StatCard icon={<Store className="h-5 w-5" />} label="Na vitrine" value={counts?.published ?? 0} />
          <StatCard icon={<Users className="h-5 w-5" />} label="Contatos" value={counts?.contacts ?? 0} />
          <StatCard icon={<Briefcase className="h-5 w-5" />} label="Negócios" value={counts?.deals ?? 0} />
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <ModuleCard
            to="/maxorcrm/fase-1"
            icon={<Boxes className="h-6 w-6" />}
            title="Cadastro de Produtos"
            description="Acesso total ao estoque, fotos, custos, vitrines, marcas e publicações do catálogo."
            stat={`${counts?.published ?? 0}/${counts?.products ?? 0} publicados`}
          />
          <ModuleCard
            to="/maxorcrm/fase-2"
            icon={<Kanban className="h-6 w-6" />}
            title="Vendas e CRM"
            description="Pipeline comercial, contatos, negócios, atividades e acompanhamento por organização."
            stat={`${counts?.contacts ?? 0} contatos · ${counts?.deals ?? 0} negócios`}
          />
          <ModuleCard
            to="/maxorcrm/fase-3"
            icon={<Plug className="h-6 w-6" />}
            title="Financeiro"
            description="Área operacional/financeira liberada para super-admins no MaxorCRM."
            stat={`${counts?.activities ?? 0} atividades`}
          />
        </section>

        <section className="mt-8 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold text-offwhite">Atalhos</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/maxorcrm"
              className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--cyan-brand)] px-4 py-2 text-xs uppercase tracking-wider text-[color:var(--cyan-brand)] transition hover:brightness-110"
            >
              <ShieldCheck className="h-4 w-4" /> Abrir MaxorCRM completo
            </Link>
            <Link
              to="/kit-validador"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs uppercase tracking-wider text-foreground/80 transition hover:text-[color:var(--cyan-brand)]"
            >
              <Wrench className="h-4 w-4" /> Validador do Kit
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs uppercase tracking-wider text-foreground/80 transition hover:text-[color:var(--cyan-brand)]"
            >
              <Store className="h-4 w-4" /> Ver a loja
            </Link>
          </div>
          <p className="mt-4 text-xs text-foreground/55">
            Este painel usa os mesmos acessos do MaxorCRM. Super-admins entram em todos os módulos internos.
          </p>
        </section>
      </div>
    </main>
  );
}

function ModuleCard({
  to,
  icon,
  title,
  description,
  stat,
}: {
  to: "/maxorcrm/fase-1" | "/maxorcrm/fase-2" | "/maxorcrm/fase-3";
  icon: React.ReactNode;
  title: string;
  description: string;
  stat: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-border bg-card p-6 transition hover:border-[color:var(--cyan-brand)] hover:brightness-110"
    >
      <div className="text-[color:var(--cyan-brand)]">{icon}</div>
      <h2 className="mt-3 font-display text-lg font-black uppercase text-offwhite">{title}</h2>
      <p className="mt-1 text-sm text-foreground/65">{description}</p>
      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[color:var(--mint-brand)]">{stat}</p>
    </Link>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-[color:var(--cyan-brand)]">{icon}
        <span className="text-[11px] uppercase tracking-wider text-foreground/60">{label}</span>
      </div>
      <p className="mt-2 font-display text-4xl font-black text-offwhite">{value}</p>
    </div>
  );
}
