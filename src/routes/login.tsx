import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ChevronLeft } from "lucide-react";
import { Shell } from "@/components/site/Shell";
import { supabase } from "@/integrations/supabase/client";

const WHATSAPP_NUMBER = "5577999599009";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — Maxor Sports" },
      { name: "description", content: "Acesse sua conta Maxor Sports ou cadastre-se para acompanhar pedidos e agilizar o checkout." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Entrar ou criar conta — Maxor Sports" },
      { property: "og:description", content: "Área do comprador Maxor Sports." },
    ],
  }),
  component: LoginPage,
});

type Mode = "signin" | "signup";

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "info"; text: string } | null>(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    country: "Brasil",
    state: "",
    city: "",
    address: "",
    zip: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/minha-conta" });
    });
  }, [navigate]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) throw error;
        navigate({ to: "/minha-conta" });
      } else {
        const requiredMissing = !form.full_name.trim() || !form.phone.trim() ||
          !form.state.trim() || !form.city.trim() || !form.address.trim() || !form.zip.trim();
        if (requiredMissing) {
          setMsg({ kind: "error", text: "Preencha todos os campos obrigatórios (*) para criar sua conta." });
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            emailRedirectTo: `${window.location.origin}/minha-conta`,
            data: {
              full_name: form.full_name,
              phone: form.phone,
              country: form.country,
              state: form.state,
              city: form.city,
              address: form.address,
              zip: form.zip,
            },
          },
        });
        if (error) throw error;
        if (data.session) {
          // sessão ativa: já salva perfil
          const { upsertMyBuyerProfile } = await import("@/lib/buyer.functions");
          try {
            await upsertMyBuyerProfile({
              data: {
                full_name: form.full_name,
                phone: form.phone,
                email: form.email,
                country: form.country,
                state: form.state,
                city: form.city,
                address: form.address,
                zip: form.zip,
              },
            });
          } catch { /* ignore, o usuário pode completar depois */ }
          navigate({ to: "/minha-conta" });
        } else {
          setMsg({
            kind: "info",
            text: "Conta criada! Enviamos um e-mail de confirmação para validar seu cadastro. Confirme e faça login.",
          });
          setMode("signin");
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível concluir. Tente novamente.";
      setMsg({ kind: "error", text: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell active="">
      <div className="border-b border-white/10 bg-navy">
        <div className="mx-auto max-w-7xl px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--lime-brand)]">
          Home / <span className="text-offwhite">Área do comprador</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-offwhite">
          <ChevronLeft className="h-4 w-4" /> Voltar para a loja
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-xl border border-border bg-card p-6">
            <h1 className="font-display text-2xl font-black uppercase text-offwhite md:text-3xl">
              {mode === "signin" ? "Entrar na sua conta" : "Criar conta Maxor"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Acesse seu histórico de pedidos, endereços e checkout mais rápido."
                : "Cadastro com validação por e-mail. Seus dados ficam salvos para o próximo pedido."}
            </p>

            <div className="mt-4 inline-flex rounded-full border border-border bg-cream p-1 text-xs font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => { setMode("signin"); setMsg(null); }}
                className={`rounded-full px-4 py-1.5 ${mode === "signin" ? "bg-navy text-[color:var(--lime-brand)]" : "text-navy/60"}`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => { setMode("signup"); setMsg(null); }}
                className={`rounded-full px-4 py-1.5 ${mode === "signup" ? "bg-navy text-[color:var(--lime-brand)]" : "text-navy/60"}`}
              >
                Criar conta
              </button>
            </div>

            {msg && (
              <div
                className={`mt-4 rounded-md border px-3 py-2 text-sm ${
                  msg.kind === "error"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 grid gap-3 sm:grid-cols-2">
              <Field label="E-mail *" type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="voce@email.com" />
              <Field label="Senha *" type="password" value={form.password} onChange={(v) => set("password", v)} placeholder="mín. 6 caracteres" />

              {mode === "signup" && (
                <>
                  <Field label="Nome completo *" value={form.full_name} onChange={(v) => set("full_name", v)} placeholder="Como no documento" />
                  <Field label="Telefone / WhatsApp *" value={form.phone} onChange={(v) => set("phone", v)} placeholder="(77) 99999-0000" />
                  <Field label="País *" value={form.country} onChange={(v) => set("country", v)} />
                  <Field label="Estado *" value={form.state} onChange={(v) => set("state", v)} placeholder="BA" />
                  <Field label="Cidade *" value={form.city} onChange={(v) => set("city", v)} placeholder="Barreiras" />
                  <Field label="CEP *" value={form.zip} onChange={(v) => set("zip", v)} placeholder="47800-000" />
                  <div className="sm:col-span-2">
                    <Field label="Endereço completo *" value={form.address} onChange={(v) => set("address", v)} placeholder="Rua, número, complemento, bairro" />
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy py-3 text-sm font-black uppercase tracking-widest text-[color:var(--lime-brand)] hover:brightness-110 disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === "signin" ? "Entrar" : "Criar conta"}
                </button>
              </div>
            </form>
          </section>

          <aside className="rounded-xl border border-border bg-cream p-6">
            <h2 className="font-display text-sm font-black uppercase tracking-widest text-offwhite">
              Prefere sem cadastro?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Você pode comprar direto pelo WhatsApp — fechamos tudo com o agente Maxor,
              sem precisar criar uma conta.
            </p>
            <a
              href={`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent("Olá Maxor! Quero comprar sem cadastro.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-black uppercase tracking-widest text-white hover:brightness-110"
            >
              Comprar pelo WhatsApp
            </a>
            <p className="mt-4 text-[11px] text-muted-foreground">
              Ao criar conta você agiliza o checkout, acompanha pedidos e recebe atualizações do rastreio dos Correios.
            </p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-offwhite/70">{label}</span>
      <input
        type={type}
        className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-[color:var(--cyan-brand)]"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={type === "password" ? (label.includes("*") ? "new-password" : "current-password") : undefined}
      />
    </label>
  );
}
