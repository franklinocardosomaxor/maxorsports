import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LogOut, ShieldCheck, Boxes, Kanban, Plug } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/** Somente estes e-mails podem operar o MaxorCRM dentro do site. */
export const MAXORCRM_ALLOWED = [
  "maxortecnologia@gmail.com",
  "franklinocardoso@gmail.com",
];

export const FASES = [
  { to: "/maxorcrm/fase-1", label: "Estoque (Catálogo)", icon: Boxes },
  { to: "/maxorcrm/fase-2", label: "Vendas (Comercial)", icon: Kanban },
  { to: "/maxorcrm/fase-3", label: "Financeiro (Operação)", icon: Plug },
] as const;

export const Route = createFileRoute("/maxorcrm")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "MaxorCRM — Gestão interna Maxor Sports" },
      { name: "description", content: "Painel MaxorCRM: catálogo, comercial e operação da Maxor Sports." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "MaxorCRM — Gestão interna Maxor Sports" },
      { property: "og:description", content: "Painel interno restrito da Maxor Sports." },
    ],
  }),
  component: MaxorCrmLayout,
  errorComponent: ({ error }) => (
    <main className="grid min-h-screen place-items-center bg-background px-4 text-center">
      <p role="alert" className="text-sm text-destructive">{error.message}</p>
    </main>
  ),
  notFoundComponent: () => (
    <main className="grid min-h-screen place-items-center bg-background">
      <p className="text-sm text-foreground/70">Módulo não encontrado.</p>
    </main>
  ),
});

function MaxorCrmLayout() {
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "denied" | "ok">("loading");
  const [email, setEmail] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      const user = data.user;
      if (!user) {
        navigate({ to: "/admin", replace: true });
        return;
      }
      const mail = (user.email ?? "").toLowerCase();
      setEmail(mail);
      setState(MAXORCRM_ALLOWED.includes(mail) ? "ok" : "denied");
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/admin", replace: true });
  }

  if (state === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-background">
        <span className="flex items-center gap-2 text-sm text-foreground/70">
          <Loader2 className="h-4 w-4 animate-spin" /> Validando acesso…
        </span>
      </main>
    );
  }

  if (state === "denied") {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-7 text-center">
          <h1 className="font-display text-xl font-black uppercase text-offwhite">Acesso negado</h1>
          <p className="mt-2 text-sm text-foreground/70">
            O MaxorCRM é restrito aos super-administradores da Maxor Sports.
          </p>
          <button
            onClick={signOut}
            className="mt-5 rounded-lg border border-border px-4 py-2 text-xs uppercase tracking-wider text-foreground/80 transition hover:text-offwhite"
          >
            Sair
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-3 py-6 sm:px-4 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border pb-5 sm:flex sm:flex-wrap sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <Link to="/maxorcrm" className="font-display text-2xl font-black uppercase tracking-wide text-offwhite sm:text-3xl">
              Maxor<span className="text-[color:var(--cyan-brand)]">CRM</span>
            </Link>
            <p className="mt-1 flex items-center gap-2 text-[11px] text-foreground/60 sm:text-xs">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[color:var(--mint-brand)]" />
              <span className="truncate">{email} · super-admin</span>
            </p>
          </div>
          <button
            onClick={signOut}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs uppercase tracking-wider text-foreground/80 transition hover:text-offwhite sm:px-4"
          >
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sair</span>
          </button>
        </header>

        <nav className="-mx-3 mt-5 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {FASES.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeProps={{
                className:
                  "border-[color:var(--cyan-brand)] text-[color:var(--cyan-brand)] bg-[color:var(--cyan-brand)]/10",
              }}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-foreground/75 transition hover:brightness-110 sm:px-4 sm:text-xs"
            >
              <Icon className="h-4 w-4 shrink-0" /> {label}
            </Link>
          ))}
        </nav>


        <div className="mt-7">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
