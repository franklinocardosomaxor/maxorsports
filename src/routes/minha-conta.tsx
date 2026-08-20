import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LogOut, ChevronLeft, Heart, Trash2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Shell } from "@/components/site/Shell";
import { supabase } from "@/integrations/supabase/client";
import { getMyBuyerProfile, upsertMyBuyerProfile } from "@/lib/buyer.functions";
import { listMyFavorites, removeFavorite, type FavoriteRow } from "@/lib/favorites.functions";

const TRACKING_URL = "https://rastreamento.correios.com.br/app/index.php";

export const Route = createFileRoute("/minha-conta")({
  head: () => ({
    meta: [
      { title: "Minha conta — Maxor Sports" },
      { name: "description", content: "Área do comprador Maxor Sports: dados pessoais, endereço e rastreio de pedidos." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Minha conta — Maxor Sports" },
      { property: "og:description", content: "Área do comprador Maxor Sports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const loadProfile = useServerFn(getMyBuyerProfile);
  const saveProfile = useServerFn(upsertMyBuyerProfile);

  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [trackCode, setTrackCode] = useState("");

  const [form, setForm] = useState({
    full_name: "", phone: "", email: "",
    country: "Brasil", state: "", city: "", address: "", zip: "",
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { navigate({ to: "/login" }); return; }
      setEmail(data.user.email ?? null);
      try {
        const p = await loadProfile();
        if (p) {
          setForm({
            full_name: p.full_name ?? "",
            phone: p.phone ?? "",
            email: p.email ?? data.user.email ?? "",
            country: p.country ?? "Brasil",
            state: p.state ?? "",
            city: p.city ?? "",
            address: p.address ?? "",
            zip: p.zip ?? "",
          });
        } else {
          const md = (data.user.user_metadata ?? {}) as Record<string, string>;
          setForm((f) => ({
            ...f,
            full_name: md.full_name ?? "",
            phone: md.phone ?? "",
            email: data.user.email ?? "",
            country: md.country ?? "Brasil",
            state: md.state ?? "",
            city: md.city ?? "",
            address: md.address ?? "",
            zip: md.zip ?? "",
          }));
        }
      } catch { /* ignore */ }
      setChecking(false);
    })();
  }, [loadProfile, navigate]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      await saveProfile({ data: form });
      setMsg("Dados atualizados com sucesso.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (checking) {
    return (
      <Shell active="">
        <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando sua conta…
        </div>
      </Shell>
    );
  }

  return (
    <Shell active="">
      <div className="border-b border-white/10 bg-navy">
        <div className="mx-auto max-w-7xl px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--lime-brand)]">
          Home / <span className="text-offwhite">Minha conta</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-offwhite">
              <ChevronLeft className="h-4 w-4" /> Voltar para a loja
            </Link>
            <h1 className="mt-2 font-display text-2xl font-black uppercase text-offwhite md:text-3xl">Olá, {form.full_name || "comprador"}</h1>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold uppercase tracking-wider text-offwhite hover:bg-secondary"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-sm font-black uppercase tracking-widest text-offwhite">Dados pessoais e entrega</h2>
            <p className="mt-1 text-xs text-muted-foreground">Essas informações vão no resumo do WhatsApp e no envio pelos Correios.</p>

            {msg && (
              <div className="mt-4 rounded-md border border-[color:var(--cyan-brand)]/40 bg-secondary px-3 py-2 text-sm text-offwhite">{msg}</div>
            )}

            <form onSubmit={handleSave} className="mt-5 grid gap-3 sm:grid-cols-2">
              <Field label="Nome completo *" value={form.full_name} onChange={(v) => set("full_name", v)} />
              <Field label="Telefone / WhatsApp *" value={form.phone} onChange={(v) => set("phone", v)} />
              <Field label="E-mail de contato" type="email" value={form.email} onChange={(v) => set("email", v)} />
              <Field label="País" value={form.country} onChange={(v) => set("country", v)} />
              <Field label="Estado" value={form.state} onChange={(v) => set("state", v)} />
              <Field label="Cidade" value={form.city} onChange={(v) => set("city", v)} />
              <div className="sm:col-span-2">
                <Field label="Endereço completo" value={form.address} onChange={(v) => set("address", v)} />
              </div>
              <Field label="CEP" value={form.zip} onChange={(v) => set("zip", v)} />
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--lime-brand)] py-3 text-sm font-black uppercase tracking-widest text-navy hover:brightness-110 disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Salvar alterações
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-display text-sm font-black uppercase tracking-widest text-offwhite">Rastreio dos Correios</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Cole o código de rastreio recebido no WhatsApp para acompanhar seu pedido.
              </p>
              <input
                type="text"
                value={trackCode}
                onChange={(e) => setTrackCode(e.target.value.toUpperCase())}
                placeholder="Ex.: AA123456789BR"
                className="mt-3 w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-[color:var(--cyan-brand)]"
              />
              <a
                href={TRACKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-[color:var(--cyan-brand)] py-2.5 text-xs font-black uppercase tracking-widest text-navy hover:brightness-110"
              >
                {trackCode ? `Rastrear ${trackCode}` : "Abrir rastreio dos Correios"}
              </a>
            </div>

            <FavoritesLibrary />

            <div className="rounded-xl border border-border bg-secondary p-6">
              <h2 className="font-display text-sm font-black uppercase tracking-widest text-offwhite">Pedidos e dados bancários</h2>
              <p className="mt-2 text-xs text-muted-foreground">
                Em breve: histórico de pedidos importados do WhatsApp e dados bancários salvos com segurança
                para PIX recorrente.
              </p>
            </div>
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
      />
    </label>
  );
}

function FavoritesLibrary() {
  const load = useServerFn(listMyFavorites);
  const drop = useServerFn(removeFavorite);
  const [rows, setRows] = useState<FavoriteRow[] | null>(null);

  useEffect(() => {
    load().then((r) => setRows(r)).catch(() => setRows([]));
  }, [load]);

  async function onRemove(id: string) {
    setRows((prev) => (prev ?? []).filter((r) => r.id !== id));
    try { await drop({ data: { id } }); } catch { /* ignore */ }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="flex items-center gap-2 font-display text-sm font-black uppercase tracking-widest text-offwhite">
        <Heart className="h-4 w-4 text-[color:var(--lime-brand)]" /> Minha biblioteca de favoritos
      </h2>
      {rows === null && (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Carregando favoritos…
        </p>
      )}
      {rows !== null && rows.length === 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Você ainda não favoritou nenhum modelo. Toque no coração na página do produto para salvar aqui.
        </p>
      )}
      {rows !== null && rows.length > 0 && (
        <ul className="mt-4 space-y-3">
          {rows.map((f) => (
            <li key={f.id} className="flex items-center gap-3">
              <Link to="/produto/$id" params={{ id: f.product_id }} className="shrink-0">
                <img src={f.img ?? ""} alt={f.name} loading="lazy" className="h-14 w-14 rounded-lg bg-secondary object-contain p-1" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to="/produto/$id" params={{ id: f.product_id }} className="block truncate text-sm font-semibold text-offwhite hover:text-[color:var(--cyan-brand)]">
                  {f.name}
                </Link>
                <p className="text-[11px] text-muted-foreground">{f.brand}</p>
              </div>
              <button
                onClick={() => onRemove(f.id)}
                aria-label="Remover dos favoritos"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-offwhite"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
