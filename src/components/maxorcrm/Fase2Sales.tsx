import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus, Search, RefreshCw, X, Kanban, Users, MessageCircle,
  Trash2, Edit, Package, Loader2, Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyOrgId } from "@/lib/maxorcrm-org";
import { CurrencyInput } from "@/components/maxorcrm/Fase1Catalog";

type Stage = { id: string; name: string; order: number; color: string | null };
type Contact = {
  id: string; name: string; email: string | null; phone_e164: string | null;
  company: string | null; tags: string[]; source: string | null;
};
type Deal = {
  id: string; title: string; value_brl: number; probability: number;
  stage_id: string | null; contact_id: string | null; status: string;
  expected_close: string | null;
};
type Activity = { id: string; kind: string; body: string | null; created_at: string };
type CatalogItem = { id: string; sku: string | null; name: string; price: number };

const brl = (n: number) =>
  `R$ ${Number(n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");

export function Fase2Sales() {
  const [tab, setTab] = useState<"deals" | "contacts">("deals");
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);

  const [stages, setStages] = useState<Stage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [pipelineId, setPipelineId] = useState<string | null>(null);

  const [dealModal, setDealModal] = useState(false);
  const [contactModal, setContactModal] = useState(false);
  const [openDeal, setOpenDeal] = useState<Deal | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const contactName = useCallback(
    (id: string | null) => contacts.find((c) => c.id === id)?.name ?? "Sem contato",
    [contacts],
  );

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const org = await getMyOrgId();
    setOrgId(org);
    if (!org) {
      setError("Não foi possível identificar sua organização no CRM.");
      setLoading(false);
      return;
    }

    const { data: pipes } = await supabase
      .from("pipelines").select("id, is_default").eq("org_id", org).order("is_default", { ascending: false });
    const pid = pipes?.[0]?.id ?? null;
    setPipelineId(pid);

    const [st, dl, ct, pr] = await Promise.all([
      pid
        ? supabase.from("stages").select("id, name, order, color").eq("pipeline_id", pid).order("order")
        : Promise.resolve({ data: [] as Stage[] }),
      supabase.from("deals")
        .select("id, title, value_brl, probability, stage_id, contact_id, status, expected_close")
        .eq("org_id", org).order("created_at", { ascending: false }),
      supabase.from("contacts")
        .select("id, name, email, phone_e164, company, tags, source")
        .eq("org_id", org).order("created_at", { ascending: false }),
      supabase.from("products").select("id, sku, name, name_prod, price, valor_dec").limit(500),
    ]);

    setStages((st.data ?? []) as Stage[]);
    setDeals((dl.data ?? []) as Deal[]);
    setContacts((ct.data ?? []) as Contact[]);
    setCatalog(
      ((pr as { data: Record<string, unknown>[] | null }).data ?? []).map((p) => ({
        id: String(p.id),
        sku: (p.sku as string) ?? null,
        name: String(p.name_prod || p.name || "Produto"),
        price: Number(p.price || p.valor_dec || 0),
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  // Realtime: reflete alterações feitas por outro operador do CRM.
  useEffect(() => {
    const channel = supabase
      .channel("maxorcrm-fase2")
      .on("postgres_changes", { event: "*", schema: "public", table: "deals" }, () => void fetchAll())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [fetchAll]);

  async function logActivity(entityType: string, entityId: string, kind: string, body: string) {
    if (!orgId) return;
    const { data: u } = await supabase.auth.getUser();
    await supabase.from("activities").insert([{
      org_id: orgId, entity_type: entityType, entity_id: entityId,
      kind, body, owner_id: u.user?.id ?? null,
    }]);
  }

  async function moveDeal(dealId: string, stageId: string) {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage_id === stageId) return;
    const stageName = stages.find((s) => s.id === stageId)?.name ?? "";
    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage_id: stageId } : d)));
    const { error: err } = await supabase.from("deals").update({ stage_id: stageId }).eq("id", dealId);
    if (err) { setError(err.message); void fetchAll(); return; }
    await logActivity("deal", dealId, "stage_changed", `Movido para "${stageName}"`);
  }

  const totals = useMemo(() => {
    const open = deals.filter((d) => d.status === "open").reduce((s, d) => s + Number(d.value_brl || 0), 0);
    const won = deals.filter((d) => d.status === "won").reduce((s, d) => s + Number(d.value_brl || 0), 0);
    return { open, won, count: deals.length };
  }, [deals]);

  const visibleDeals = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return deals;
    return deals.filter((d) =>
      d.title.toLowerCase().includes(q) || contactName(d.contact_id).toLowerCase().includes(q));
  }, [deals, search, contactName]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="flex items-center gap-2 text-lg font-black uppercase text-offwhite sm:text-xl">
          <Kanban className="shrink-0 text-[color:var(--cyan-brand)]" size={24} /> Vendas · Comercial
        </h1>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <button
            onClick={() => { setOpenDeal(null); setDealModal(true); }}
            className="flex items-center justify-center gap-2 rounded-xl bg-[color:var(--cyan-brand)] px-4 py-2.5 text-sm font-bold text-navy transition hover:brightness-110 sm:px-5 sm:text-base"
          >
            <Plus size={18} /> Novo Negócio
          </button>
          <button
            onClick={() => setContactModal(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-offwhite transition hover:brightness-110 sm:px-5 sm:text-base"
          >
            <Users size={18} /> Novo Contato
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatBox label="Em aberto" value={brl(totals.open)} tone="cyan" />
        <StatBox label="Ganho" value={brl(totals.won)} tone="mint" />
        <StatBox label="Negócios" value={String(totals.count)} tone="lime" />
      </div>


      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="inline-flex rounded-xl border border-border bg-background p-1">
          {(["deals", "contacts"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                tab === t ? "bg-[color:var(--cyan-brand)] text-navy" : "text-foreground/60 hover:text-offwhite"
              }`}
            >
              {t === "deals" ? "Negócios" : "Contatos"}
            </button>
          ))}
        </div>
        <div className="flex flex-1 items-center gap-3">
          <Search className="text-foreground/50" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "deals" ? "Buscar negócio ou contato..." : "Buscar por nome, telefone ou e-mail..."}
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-[color:var(--cyan-brand)] focus:outline-none"
          />
          <button onClick={() => void fetchAll()} className="rounded-xl bg-background p-2.5 transition hover:bg-border">
            <RefreshCw size={18} className="text-foreground/60" />
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 p-10 text-sm text-foreground/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando pipeline...
        </div>
      ) : tab === "deals" ? (
        <KanbanBoard
          stages={stages}
          deals={visibleDeals}
          contactName={contactName}
          onMove={moveDeal}
          onOpen={(d) => { setOpenDeal(d); setDealModal(true); }}
        />
      ) : (
        <ContactsTable
          contacts={contacts}
          search={search}
          onRefresh={fetchAll}
          onEdit={() => setContactModal(true)}
        />
      )}

      {dealModal && (
        <DealModal
          orgId={orgId}
          pipelineId={pipelineId}
          stages={stages}
          contacts={contacts}
          catalog={catalog}
          deal={openDeal}
          onClose={() => { setDealModal(false); setOpenDeal(null); }}
          onSaved={() => { setDealModal(false); setOpenDeal(null); void fetchAll(); }}
          logActivity={logActivity}
        />
      )}

      {contactModal && (
        <ContactModal
          orgId={orgId}
          onClose={() => setContactModal(false)}
          onSaved={() => { setContactModal(false); void fetchAll(); }}
        />
      )}
    </div>
  );
}

function StatBox({ label, value, tone }: { label: string; value: string; tone: "cyan" | "mint" | "lime" }) {
  const color =
    tone === "cyan" ? "var(--cyan-brand)" : tone === "mint" ? "var(--mint-brand)" : "var(--lime-brand)";
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-foreground/55">{label}</p>
      <p className="mt-1 font-display text-2xl font-black" style={{ color: `color-mix(in oklab, ${color} 90%, white)` }}>
        {value}
      </p>
    </div>
  );
}

function KanbanBoard({
  stages, deals, contactName, onMove, onOpen,
}: {
  stages: Stage[];
  deals: Deal[];
  contactName: (id: string | null) => string;
  onMove: (dealId: string, stageId: string) => void;
  onOpen: (d: Deal) => void;
}) {
  const [dragOver, setDragOver] = useState<string | null>(null);

  if (stages.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-foreground/60">
        Nenhum estágio configurado no pipeline desta organização.
      </p>
    );
  }

  return (
    <div className="grid gap-4 overflow-x-auto md:grid-cols-3 xl:grid-cols-6">
      {stages.map((s) => {
        const items = deals.filter((d) => d.stage_id === s.id);
        const total = items.reduce((sum, d) => sum + Number(d.value_brl || 0), 0);
        return (
          <div
            key={s.id}
            onDragOver={(e) => { e.preventDefault(); setDragOver(s.id); }}
            onDragLeave={() => setDragOver((cur) => (cur === s.id ? null : cur))}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(null);
              const id = e.dataTransfer.getData("text/deal-id");
              if (id) onMove(id, s.id);
            }}
            className={`min-h-[220px] rounded-2xl border bg-card p-3 transition ${
              dragOver === s.id ? "border-[color:var(--cyan-brand)]" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-offwhite">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color ?? "#00BFC6" }} />
                {s.name}
              </span>
              <span className="text-[10px] font-bold text-foreground/50">{items.length}</span>
            </div>
            <p className="mt-2 text-[11px] font-bold text-[color:var(--mint-brand)]">{brl(total)}</p>

            <div className="mt-3 space-y-2">
              {items.map((d) => (
                <button
                  key={d.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/deal-id", d.id)}
                  onClick={() => onOpen(d)}
                  className="w-full cursor-grab rounded-xl border border-border bg-background p-3 text-left transition hover:border-[color:var(--cyan-brand)] active:cursor-grabbing"
                >
                  <p className="truncate text-sm font-bold text-offwhite">{d.title}</p>
                  <p className="mt-0.5 truncate text-[11px] text-foreground/55">{contactName(d.contact_id)}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-[color:var(--mint-brand)]">{brl(d.value_brl)}</span>
                    <span className="text-[10px] font-bold text-foreground/45">{d.probability}%</span>
                  </div>
                </button>
              ))}
              {items.length === 0 && (
                <p className="py-4 text-center text-[11px] text-foreground/35">Arraste um negócio para cá</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ContactsTable({
  contacts, search, onRefresh, onEdit,
}: {
  contacts: Contact[]; search: string; onRefresh: () => void; onEdit: () => void;
}) {
  const q = search.trim().toLowerCase();
  const rows = q
    ? contacts.filter((c) =>
        [c.name, c.email, c.phone_e164, c.company].some((v) => (v ?? "").toLowerCase().includes(q)))
    : contacts;

  async function remove(id: string) {
    if (!confirm("Excluir este contato?")) return;
    await supabase.from("contacts").delete().eq("id", id);
    onRefresh();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
      <table className="w-full text-left text-sm text-foreground/70">
        <thead className="border-b border-border bg-background text-xs font-semibold uppercase text-foreground/50">
          <tr>
            <th className="p-4">Contato</th>
            <th className="p-4">Telefone</th>
            <th className="p-4">E-mail</th>
            <th className="p-4">Origem</th>
            <th className="p-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 ? (
            <tr><td colSpan={5} className="p-8 text-center text-foreground/50">Nenhum contato cadastrado.</td></tr>
          ) : rows.map((c) => (
            <tr key={c.id} className="transition hover:bg-border/40">
              <td className="p-4">
                <div className="font-bold text-offwhite">{c.name}</div>
                <div className="text-xs text-foreground/50">{c.company || "—"}</div>
              </td>
              <td className="p-4">{c.phone_e164 || "—"}</td>
              <td className="p-4">{c.email || "—"}</td>
              <td className="p-4 text-xs uppercase text-foreground/50">{c.source || "—"}</td>
              <td className="p-4">
                <div className="flex justify-end gap-2">
                  {c.phone_e164 && (
                    <a
                      href={`https://api.whatsapp.com/send?phone=${onlyDigits(c.phone_e164)}`}
                      target="_blank" rel="noopener noreferrer"
                      aria-label={`Abrir WhatsApp de ${c.name}`}
                      className="rounded-lg bg-background p-2 text-[color:var(--mint-brand)] transition hover:bg-border"
                    >
                      <MessageCircle size={16} />
                    </a>
                  )}
                  <button onClick={onEdit} aria-label="Novo contato" className="rounded-lg bg-background p-2 text-foreground/60 transition hover:bg-border">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => void remove(c.id)} aria-label="Excluir contato" className="rounded-lg bg-background p-2 text-rose-400 transition hover:bg-border">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DealModal({
  orgId, pipelineId, stages, contacts, catalog, deal, onClose, onSaved, logActivity,
}: {
  orgId: string | null;
  pipelineId: string | null;
  stages: Stage[];
  contacts: Contact[];
  catalog: CatalogItem[];
  deal: Deal | null;
  onClose: () => void;
  onSaved: () => void;
  logActivity: (t: string, id: string, kind: string, body: string) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [activities, setActivities] = useState<Activity[] | null>(deal ? null : []);
  const [picked, setPicked] = useState<CatalogItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: deal?.title ?? "",
    contact_id: deal?.contact_id ?? "",
    value_brl: Number(deal?.value_brl ?? 0),
    probability: Number(deal?.probability ?? 0),
    expected_close: deal?.expected_close ?? "",
    stage_id: deal?.stage_id ?? stages[0]?.id ?? "",
    status: deal?.status ?? "open",
  });

  useEffect(() => {
    if (!deal) return;
    supabase.from("activities")
      .select("id, kind, body, created_at")
      .eq("entity_type", "deal").eq("entity_id", deal.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setActivities((data ?? []) as Activity[]));
  }, [deal]);

  function addProduct(id: string) {
    const item = catalog.find((c) => c.id === id);
    if (!item) return;
    const next = [...picked, item];
    setPicked(next);
    setForm((f) => ({ ...f, value_brl: next.reduce((s, p) => s + p.price, 0) }));
  }

  function removeProduct(idx: number) {
    const next = picked.filter((_, i) => i !== idx);
    setPicked(next);
    setForm((f) => ({ ...f, value_brl: next.reduce((s, p) => s + p.price, 0) }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) { setErr("Organização não identificada."); return; }
    setSaving(true);
    setErr(null);

    const { data: u } = await supabase.auth.getUser();
    const payload = {
      org_id: orgId,
      pipeline_id: pipelineId,
      stage_id: form.stage_id || null,
      contact_id: form.contact_id || null,
      title: form.title.trim(),
      value_brl: Number(form.value_brl || 0),
      probability: Number(form.probability || 0),
      expected_close: form.expected_close || null,
      status: form.status,
      owner_id: u.user?.id ?? null,
    };

    if (deal) {
      const { error } = await supabase.from("deals").update(payload).eq("id", deal.id);
      if (error) { setErr(error.message); setSaving(false); return; }
      if (note.trim()) await logActivity("deal", deal.id, "note", note.trim());
    } else {
      const { data, error } = await supabase.from("deals").insert([payload]).select("id").single();
      if (error) { setErr(error.message); setSaving(false); return; }
      await logActivity("deal", data.id, "created", `Negócio criado — ${brl(payload.value_brl)}`);
      if (picked.length > 0) {
        await logActivity("deal", data.id, "products_linked",
          picked.map((p) => `${p.sku ?? "—"} · ${p.name}`).join(" | "));
      }
      if (note.trim()) await logActivity("deal", data.id, "note", note.trim());
    }

    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-navy/80 p-4 backdrop-blur-sm">
      <form onSubmit={save} className="my-8 w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="font-display text-xl font-black uppercase text-offwhite">
            {deal ? "Editar negócio" : "Novo negócio"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-lg p-2 text-foreground/60 hover:bg-background">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Labeled label="Título do negócio *" className="md:col-span-2">
            <input
              required value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ex.: Pedido WhatsApp — 2 pares Nike Pegasus"
              className={inputCls}
            />
          </Labeled>

          <Labeled label="Contato">
            <select
              value={form.contact_id}
              onChange={(e) => setForm((f) => ({ ...f, contact_id: e.target.value }))}
              className={inputCls}
            >
              <option value="">Sem contato</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Labeled>

          <Labeled label="Estágio">
            <select
              value={form.stage_id}
              onChange={(e) => setForm((f) => ({ ...f, stage_id: e.target.value }))}
              className={inputCls}
            >
              {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Labeled>

          <Labeled label="Valor (R$)">
            <CurrencyInput value={form.value_brl} onChange={(v) => setForm((f) => ({ ...f, value_brl: v }))} />
          </Labeled>

          <Labeled label="Probabilidade (%)">
            <input
              type="number" min={0} max={100} value={form.probability}
              onChange={(e) => setForm((f) => ({ ...f, probability: Number(e.target.value) }))}
              className={inputCls}
            />
          </Labeled>

          <Labeled label="Previsão de fechamento">
            <input
              type="date" value={form.expected_close ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, expected_close: e.target.value }))}
              className={inputCls}
            />
          </Labeled>

          <Labeled label="Status">
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className={inputCls}
            >
              <option value="open">Aberto</option>
              <option value="won">Ganho</option>
              <option value="lost">Perdido</option>
            </select>
          </Labeled>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-background p-4">
          <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-offwhite">
            <Package size={14} className="text-[color:var(--cyan-brand)]" /> Produtos do catálogo
          </p>
          {catalog.length === 0 ? (
            <p className="mt-2 text-xs text-foreground/50">
              Nenhum produto cadastrado ainda na Fase 1 — o valor pode ser digitado manualmente.
            </p>
          ) : (
            <select
              value=""
              onChange={(e) => { if (e.target.value) addProduct(e.target.value); }}
              className={`mt-3 ${inputCls}`}
            >
              <option value="">Adicionar produto ao negócio...</option>
              {catalog.map((c) => (
                <option key={c.id} value={c.id}>{c.sku ? `${c.sku} · ` : ""}{c.name} — {brl(c.price)}</option>
              ))}
            </select>
          )}
          {picked.length > 0 && (
            <ul className="mt-3 space-y-2">
              {picked.map((p, i) => (
                <li key={`${p.id}-${i}`} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs">
                  <span className="truncate text-offwhite">{p.sku ? `${p.sku} · ` : ""}{p.name}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-bold text-[color:var(--mint-brand)]">{brl(p.price)}</span>
                    <button type="button" onClick={() => removeProduct(i)} aria-label="Remover produto" className="text-rose-400">
                      <X size={14} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-5">
          <Labeled label="Registrar nota no histórico">
            <textarea
              value={note} onChange={(e) => setNote(e.target.value)} rows={2}
              placeholder="Ex.: Cliente pediu foto da cor verde antes de fechar."
              className={inputCls}
            />
          </Labeled>
        </div>

        {deal && (
          <div className="mt-5 rounded-xl border border-border bg-background p-4">
            <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-offwhite">
              <Clock size={14} className="text-[color:var(--mint-brand)]" /> Linha do tempo
            </p>
            {activities === null ? (
              <p className="mt-2 text-xs text-foreground/50">Carregando histórico...</p>
            ) : activities.length === 0 ? (
              <p className="mt-2 text-xs text-foreground/50">Sem atividades registradas.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {activities.map((a) => (
                  <li key={a.id} className="border-l-2 border-border pl-3 text-xs">
                    <span className="font-bold uppercase text-[color:var(--cyan-brand)]">{a.kind}</span>
                    <span className="ml-2 text-foreground/45">
                      {new Date(a.created_at).toLocaleString("pt-BR")}
                    </span>
                    {a.body && <p className="mt-0.5 text-foreground/70">{a.body}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {err && <p role="alert" className="mt-4 text-sm text-destructive">{err}</p>}

        <div className="mt-6 flex justify-end gap-3 border-t border-border pt-5">
          <button type="button" onClick={onClose} className="rounded-xl border border-border px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground/70">
            Cancelar
          </button>
          <button
            type="submit" disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--cyan-brand)] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-navy transition hover:brightness-110 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Salvar negócio
          </button>
        </div>
      </form>
    </div>
  );
}

function ContactModal({
  orgId, onClose, onSaved,
}: { orgId: string | null; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", phone_e164: "", email: "", company: "", tags: "", source: "WhatsApp",
  });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) { setErr("Organização não identificada."); return; }
    setSaving(true);
    setErr(null);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("contacts").insert([{
      org_id: orgId,
      name: form.name.trim(),
      phone_e164: form.phone_e164.trim() || null,
      email: form.email.trim() || null,
      company: form.company.trim() || null,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      source: form.source || null,
      owner_id: u.user?.id ?? null,
    }]);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/80 p-4 backdrop-blur-sm">
      <form onSubmit={save} className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="font-display text-xl font-black uppercase text-offwhite">Novo contato</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-lg p-2 text-foreground/60 hover:bg-background">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Labeled label="Nome *" className="sm:col-span-2">
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
          </Labeled>
          <Labeled label="Telefone / WhatsApp">
            <input value={form.phone_e164} onChange={(e) => setForm((f) => ({ ...f, phone_e164: e.target.value }))} placeholder="+55 77 99999-0000" className={inputCls} />
          </Labeled>
          <Labeled label="E-mail">
            <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputCls} />
          </Labeled>
          <Labeled label="Empresa">
            <input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} className={inputCls} />
          </Labeled>
          <Labeled label="Origem">
            <select value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} className={inputCls}>
              <option>WhatsApp</option>
              <option>Instagram</option>
              <option>Site</option>
              <option>Indicação</option>
              <option>Outro</option>
            </select>
          </Labeled>
          <Labeled label="Tags (separadas por vírgula)" className="sm:col-span-2">
            <input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="vip, corrida" className={inputCls} />
          </Labeled>
        </div>

        {err && <p role="alert" className="mt-4 text-sm text-destructive">{err}</p>}

        <div className="mt-6 flex justify-end gap-3 border-t border-border pt-5">
          <button type="button" onClick={onClose} className="rounded-xl border border-border px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground/70">
            Cancelar
          </button>
          <button
            type="submit" disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--cyan-brand)] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-navy transition hover:brightness-110 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Salvar contato
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-offwhite focus:border-[color:var(--cyan-brand)] focus:outline-none";

function Labeled({
  label, children, className = "",
}: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-foreground/60">{label}</span>
      {children}
    </label>
  );
}
