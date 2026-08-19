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
  { to: "/maxorcrm/fase-1", label: "Fase 1 · Catálogo", icon: Boxes },
  { to: "/maxorcrm/fase-2", label: "Fase 2 · Comercial", icon: Kanban },
  { to: "/maxorcrm/fase-3", label: "Fase 3 · Operação", icon: Plug },
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
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <Link to="/maxorcrm" className="font-display text-3xl font-black uppercase tracking-wide text-offwhite">
              Maxor<span className="text-[color:var(--cyan-brand)]">CRM</span>
            </Link>
            <p className="mt-1 flex items-center gap-2 text-xs text-foreground/60">
              <ShieldCheck className="h-4 w-4 text-[color:var(--mint-brand)]" /> {email} · super-admin
            </p>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs uppercase tracking-wider text-foreground/80 transition hover:text-offwhite"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </header>

        <nav className="mt-5 flex flex-wrap gap-2">
          {FASES.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeProps={{
                className:
                  "border-[color:var(--cyan-brand)] text-[color:var(--cyan-brand)] bg-[color:var(--cyan-brand)]/10",
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-foreground/75 transition hover:brightness-110"
            >
              <Icon className="h-4 w-4" /> {label}
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
