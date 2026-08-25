import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Área administrativa — CRM Maxor Sports" },
      {
        name: "description",
        content: "Acesso restrito da equipe Maxor Sports ao painel de gestão e CRM.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Área administrativa — CRM Maxor Sports" },
      { property: "og:description", content: "Login restrito da equipe Maxor Sports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (data.user) navigate({ to: "/maxorcrm", replace: true });
      else setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) throw authError;
      navigate({ to: "/maxorcrm", replace: true });
    } catch (err) {
      setError(
        err instanceof Error && /invalid/i.test(err.message)
          ? "E-mail ou senha inválidos."
          : "Não foi possível entrar. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1 text-xs uppercase tracking-wider text-foreground/60 transition hover:text-[color:var(--cyan-brand)]"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar à loja
        </Link>

        <div className="rounded-2xl border border-border bg-card p-7 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--cyan-brand)]/15 text-[color:var(--cyan-brand)]">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-black uppercase tracking-wide text-offwhite">
                Área administrativa
              </h1>
              <p className="text-xs text-foreground/60">Acesso restrito ao CRM Maxor</p>
            </div>
          </div>

          {checking ? (
            <div className="mt-8 flex items-center gap-2 text-sm text-foreground/60">
              <Loader2 className="h-4 w-4 animate-spin" /> Verificando sessão...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div>
                <label htmlFor="admin-email" className="mb-1 block text-xs uppercase tracking-wider text-foreground/70">
                  E-mail corporativo
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/20 px-3 py-2.5 text-sm text-offwhite outline-none transition focus:border-[color:var(--cyan-brand)]"
                  placeholder="voce@maxorsports.com.br"
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="mb-1 block text-xs uppercase tracking-wider text-foreground/70">
                  Senha
                </label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/20 px-3 py-2.5 text-sm text-offwhite outline-none transition focus:border-[color:var(--cyan-brand)]"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[color:var(--cyan-brand)] px-4 py-3 text-sm font-bold uppercase tracking-wider text-[color:var(--navy-brand,#0F1720)] transition hover:brightness-110 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Entrar no CRM
              </button>

              <p className="text-center text-[11px] text-foreground/50">
                Acesso exclusivo para a equipe. Clientes acessam pela{" "}
                <Link to="/login" className="text-[color:var(--cyan-brand)] hover:underline">
                  área do cliente
                </Link>
                .
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
