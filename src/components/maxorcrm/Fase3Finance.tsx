import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus, Search, RefreshCw, X, Wallet, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, Trash2, Edit, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyOrgId } from "@/lib/maxorcrm-org";
import { CurrencyInput } from "@/components/maxorcrm/Fase1Catalog";

export type FinanceKind = "payable" | "receivable";
export type FinanceStatus = "open" | "paid" | "canceled";

export type FinanceEntry = {
  id: string;
  kind: FinanceKind;
  description: string;
  category: string | null;
  counterparty: string | null;
  amount_brl: number;
  due_date: string;
  paid_at: string | null;
  status: FinanceStatus;
  method: string | null;
  notes: string | null;
  deal_id: string | null;
};

type DealOption = { id: string; title: string };

export const brl = (n: number) =>
  `R$ ${Number(n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const today = () => new Date().toISOString().slice(0, 10);

export const isOverdue = (e: FinanceEntry) => e.status === "open" && e.due_date < today();

const METHODS = ["PIX", "Cartão", "Boleto", "Dinheiro", "Transferência"] as const;

const fmtDate = (d: string | null) =>
  d ? new Date(`${d}T12:00:00`).toLocaleDateString("pt-BR") : "—";

export function Fase3Finance() {
  const [tab, setTab] = useState<FinanceKind>("receivable");
  const [rows, setRows] = useState<FinanceEntry[]>([]);
  const [deals, setDeals] = useState<DealOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | FinanceStatus | "overdue">("all");
  const [month, setMonth] = useState<string>("");
  const [editing, setEditing] = useState<FinanceEntry | null>(null);
  const [modal, setModal] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const org = await getMyOrgId();
    if (!org) {
      setError("Não foi possível identificar sua organização no CRM.");
      setLoading(false);
      return;
    }
    const [fin, dl] = await Promise.all([
      supabase
        .from("finance_entries")
        .select("id, kind, description, category, counterparty, amount_brl, due_date, paid_at, status, method, notes, deal_id")
        .eq("org_id", org)
        .order("due_date", { ascending: true }),
      supabase.from("deals").select("id, title").eq("org_id", org).order("created_at", { ascending: false }).limit(300),
    ]);
    if (fin.error) setError(fin.error.message);
    setRows((fin.data ?? []) as FinanceEntry[]);
    setDeals((dl.data ?? []) as DealOption[]);
    setLoading(false);
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const totals = useMemo(() => {
    const open = rows.filter((r) => r.status === "open");
    const receivable = open.filter((r) => r.kind === "receivable").reduce((s, r) => s + Number(r.amount_brl || 0), 0);
    const payable = open.filter((r) => r.kind === "payable").reduce((s, r) => s + Number(r.amount_brl || 0), 0);
    const overdue = open.filter(isOverdue).reduce((s, r) => s + Number(r.amount_brl || 0), 0);
    return { receivable, payable, saldo: receivable - payable, overdue };
  }, [rows]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (r.kind !== tab) return false;
      if (statusFilter === "overdue" ? !isOverdue(r) : statusFilter !== "all" && r.status !== statusFilter) return false;
      if (month && !r.due_date.startsWith(month)) return false;
      if (!q) return true;
      return [r.description, r.category, r.counterparty].some((v) => (v ?? "").toLowerCase().includes(q));
    });
  }, [rows, tab, statusFilter, month, search]);

  async function markPaid(row: FinanceEntry) {
    const { error: err } = await supabase
      .from("finance_entries")
      .update({ status: "paid", paid_at: today() })
      .eq("id", row.id);
    if (err) { setError(err.message); return; }
    void fetchAll();
  }

  async function remove(row: FinanceEntry) {
    if (!window.confirm(`Excluir "${row.description}"?`)) return;
    const { error: err } = await supabase.from("finance_entries").delete().eq("id", row.id);
    if (err) { setError(err.message); return; }
    void fetchAll();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="flex items-center gap-2 text-lg font-black uppercase text-offwhite sm:text-xl">
          <Wallet className="shrink-0 text-[color:var(--cyan-brand)]" size={24} /> Financeiro · Operação
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => void fetchAll()}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs uppercase tracking-wider text-foreground/75 transition hover:brightness-110"
          >
            <RefreshCw size={14} /> Atualizar
          </button>
          <button
            onClick={() => { setEditing(null); setModal(true); }}
            className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--cyan-brand)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-navy transition hover:brightness-110"
          >
            <Plus size={14} /> Nova conta
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={TrendingUp} label="A receber (em aberto)" value={brl(totals.receivable)} tone="mint" />
        <StatCard icon={TrendingDown} label="A pagar (em aberto)" value={brl(totals.payable)} tone="lime" />
        <StatCard icon={Wallet} label="Saldo previsto" value={brl(totals.saldo)} tone="cyan" />
        <StatCard icon={AlertTriangle} label="Vencidos" value={brl(totals.overdue)} tone="alert" />
      </section>

      <div className="flex flex-wrap gap-2">
        {([["receivable", "Contas a receber"], ["payable", "Contas a pagar"]] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-lg border px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              tab === k
                ? "border-[color:var(--cyan-brand)] bg-[color:var(--cyan-brand)]/10 text-[color:var(--cyan-brand)]"
                : "border-border text-foreground/70 hover:brightness-110"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <label className="relative block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar descrição, categoria ou pessoa…"
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-offwhite placeholder:text-foreground/40"
          />
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-offwhite"
        >
          <option value="all">Todas as situações</option>
          <option value="open">Em aberto</option>
          <option value="overdue">Vencidas</option>
          <option value="paid">Pagas</option>
          <option value="canceled">Canceladas</option>
        </select>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-offwhite"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {loading ? (
          <p className="flex items-center justify-center gap-2 p-8 text-sm text-foreground/60">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando lançamentos…
          </p>
        ) : visible.length === 0 ? (
          <p className="p-8 text-center text-sm text-foreground/60">Nenhum lançamento encontrado.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-[11px] uppercase tracking-wider text-foreground/55">
              <tr>
                <th className="px-3 py-3 sm:px-4">Descrição</th>
                <th className="hidden px-4 py-3 md:table-cell">Categoria</th>
                <th className="hidden px-4 py-3 sm:table-cell">Vencimento</th>
                <th className="px-3 py-3 text-right sm:px-4">Valor</th>
                <th className="hidden px-4 py-3 md:table-cell">Situação</th>
                <th className="px-3 py-3 text-right sm:px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-3 sm:px-4">
                    <span className="font-semibold text-offwhite">{r.description}</span>
                    <span className="mt-0.5 block text-[11px] text-foreground/55">
                      {r.counterparty || "Sem contraparte"} · vence {fmtDate(r.due_date)}
                      {r.method ? ` · ${r.method}` : ""}
                    </span>
                    <span className="mt-1 block md:hidden">
                      <StatusPill row={r} />
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-foreground/70 md:table-cell">{r.category || "—"}</td>
                  <td className={`hidden px-4 py-3 sm:table-cell ${isOverdue(r) ? "text-destructive" : "text-foreground/70"}`}>
                    {fmtDate(r.due_date)}
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-offwhite sm:px-4">{brl(r.amount_brl)}</td>
                  <td className="hidden px-4 py-3 md:table-cell"><StatusPill row={r} /></td>
                  <td className="px-3 py-3 sm:px-4">
                    <div className="flex justify-end gap-1">
                      {r.status === "open" && (
                        <button
                          onClick={() => void markPaid(r)}
                          title="Marcar como pago"
                          className="rounded-lg p-2 text-[color:var(--mint-brand)] transition hover:bg-background"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => { setEditing(r); setModal(true); }}
                        title="Editar"
                        className="rounded-lg p-2 text-foreground/70 transition hover:bg-background"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => void remove(r)}
                        title="Excluir"
                        className="rounded-lg p-2 text-destructive transition hover:bg-background"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <EntryModal
          entry={editing}
          defaultKind={tab}
          deals={deals}
          onClose={() => { setModal(false); setEditing(null); }}
          onSaved={() => { setModal(false); setEditing(null); void fetchAll(); }}
        />
      )}
    </div>
  );
}

function StatusPill({ row }: { row: FinanceEntry }) {
  const overdue = isOverdue(row);
  const map = {
    paid: ["Pago", "text-[color:var(--mint-brand)] border-[color:var(--mint-brand)]/40"],
    canceled: ["Cancelado", "text-foreground/50 border-border"],
    open: overdue
      ? ["Vencido", "text-destructive border-destructive/40"]
      : ["Em aberto", "text-[color:var(--cyan-brand)] border-[color:var(--cyan-brand)]/40"],
  } as const;
  const [label, cls] = map[row.status];
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
}

function StatCard({
  icon: Icon, label, value, tone,
}: {
  icon: React.ElementType; label: string; value: string; tone: "mint" | "lime" | "cyan" | "alert";
}) {
  const color =
    tone === "mint" ? "text-[color:var(--mint-brand)]"
      : tone === "lime" ? "text-[color:var(--lime-brand)]"
        : tone === "cyan" ? "text-[color:var(--cyan-brand)]"
          : "text-destructive";
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <Icon className={`h-5 w-5 ${color}`} />
      <p className="mt-2 text-[11px] uppercase tracking-wider text-foreground/55">{label}</p>
      <p className="mt-1 font-display text-lg font-black text-offwhite sm:text-xl">{value}</p>
    </div>
  );
}

function EntryModal({
  entry, defaultKind, deals, onClose, onSaved,
}: {
  entry: FinanceEntry | null;
  defaultKind: FinanceKind;
  deals: DealOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [kind, setKind] = useState<FinanceKind>(entry?.kind ?? defaultKind);
  const [description, setDescription] = useState(entry?.description ?? "");
  const [category, setCategory] = useState(entry?.category ?? "");
  const [counterparty, setCounterparty] = useState(entry?.counterparty ?? "");
  const [amount, setAmount] = useState(Number(entry?.amount_brl ?? 0));
  const [dueDate, setDueDate] = useState(entry?.due_date ?? today());
  const [paidAt, setPaidAt] = useState(entry?.paid_at ?? "");
  const [status, setStatus] = useState<FinanceStatus>(entry?.status ?? "open");
  const [method, setMethod] = useState(entry?.method ?? "");
  const [dealId, setDealId] = useState(entry?.deal_id ?? "");
  const [notes, setNotes] = useState(entry?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) { setErr("Informe a descrição."); return; }
    setSaving(true);
    setErr(null);

    const payload = {
      kind,
      description: description.trim(),
      category: category.trim() || null,
      counterparty: counterparty.trim() || null,
      amount_brl: amount,
      due_date: dueDate,
      paid_at: status === "paid" ? (paidAt || today()) : null,
      status,
      method: method || null,
      deal_id: dealId || null,
      notes: notes.trim() || null,
    };

    if (entry) {
      const { error } = await supabase.from("finance_entries").update(payload).eq("id", entry.id);
      if (error) { setErr(error.message); setSaving(false); return; }
    } else {
      const org = await getMyOrgId();
      if (!org) { setErr("Organização não encontrada."); setSaving(false); return; }
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("finance_entries")
        .insert([{ ...payload, org_id: org, owner_id: u.user?.id ?? null }]);
      if (error) { setErr(error.message); setSaving(false); return; }
    }
    setSaving(false);
    onSaved();
  }

  const field = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-offwhite placeholder:text-foreground/40";
  const label = "mb-1 block text-[11px] uppercase tracking-wider text-foreground/55";

  return (
    <div className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-navy/80 p-2 backdrop-blur-sm sm:place-items-center sm:p-4">
      <form onSubmit={save} className="my-4 w-full max-w-2xl rounded-2xl border border-border bg-card p-4 shadow-2xl sm:p-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="font-display text-base font-black uppercase text-offwhite sm:text-xl">
            {entry ? "Editar lançamento" : "Nova conta"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-lg p-2 text-foreground/60 hover:bg-background">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <span className={label}>Tipo</span>
            <div className="flex gap-2">
              {([["receivable", "A receber"], ["payable", "A pagar"]] as const).map(([k, lb]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
                    kind === k
                      ? "border-[color:var(--cyan-brand)] bg-[color:var(--cyan-brand)]/10 text-[color:var(--cyan-brand)]"
                      : "border-border text-foreground/70"
                  }`}
                >
                  {lb}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className={label} htmlFor="fin-desc">Descrição</label>
            <input id="fin-desc" value={description} onChange={(e) => setDescription(e.target.value)} className={field} placeholder="Ex.: Lote de tênis — fornecedor Yolo" />
          </div>

          <div>
            <label className={label} htmlFor="fin-cat">Categoria</label>
            <input id="fin-cat" value={category} onChange={(e) => setCategory(e.target.value)} className={field} placeholder="Compras, frete, marketing…" />
          </div>

          <div>
            <label className={label} htmlFor="fin-cp">{kind === "payable" ? "Fornecedor" : "Cliente"}</label>
            <input id="fin-cp" value={counterparty} onChange={(e) => setCounterparty(e.target.value)} className={field} />
          </div>

          <div>
            <span className={label}>Valor</span>
            <CurrencyInput value={amount} onChange={setAmount} />
          </div>

          <div>
            <label className={label} htmlFor="fin-due">Vencimento</label>
            <input id="fin-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={field} />
          </div>

          <div>
            <label className={label} htmlFor="fin-status">Situação</label>
            <select id="fin-status" value={status} onChange={(e) => setStatus(e.target.value as FinanceStatus)} className={field}>
              <option value="open">Em aberto</option>
              <option value="paid">Pago</option>
              <option value="canceled">Cancelado</option>
            </select>
          </div>

          <div>
            <label className={label} htmlFor="fin-paid">Data do pagamento</label>
            <input id="fin-paid" type="date" value={paidAt ?? ""} onChange={(e) => setPaidAt(e.target.value)} disabled={status !== "paid"} className={`${field} disabled:opacity-40`} />
          </div>

          <div>
            <label className={label} htmlFor="fin-method">Forma de pagamento</label>
            <select id="fin-method" value={method ?? ""} onChange={(e) => setMethod(e.target.value)} className={field}>
              <option value="">—</option>
              {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className={label} htmlFor="fin-deal">Negócio vinculado (opcional)</label>
            <select id="fin-deal" value={dealId ?? ""} onChange={(e) => setDealId(e.target.value)} className={field}>
              <option value="">—</option>
              {deals.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={label} htmlFor="fin-notes">Observações</label>
            <textarea id="fin-notes" rows={3} value={notes ?? ""} onChange={(e) => setNotes(e.target.value)} className={field} />
          </div>
        </div>

        {err && <p role="alert" className="mt-4 text-sm text-destructive">{err}</p>}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-xs uppercase tracking-wider text-foreground/75">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[color:var(--cyan-brand)] px-5 py-2 text-xs font-bold uppercase tracking-wider text-navy transition hover:brightness-110 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
