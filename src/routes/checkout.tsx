import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Copy, Check, ChevronLeft } from "lucide-react";
import { Shell } from "@/components/site/Shell";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/catalog";

const WHATSAPP_NUMBER = "5577999599009";
const PIX_KEY = "0010ef3f-7011-41f4-ae7d-43616eb08627";
const COMPANY_NAME = "Maxor Importação LTDA";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Maxor Sports" },
      { name: "description", content: "Finalize seu pedido Maxor Sports via WhatsApp ou PIX." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Checkout — Maxor Sports" },
      { property: "og:description", content: "Finalize seu pedido Maxor Sports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const cart = useCart();
  const [copied, setCopied] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    country: "Brasil",
    state: "",
    city: "",
    address: "",
    zip: "",
  });

  const shipping = 0; // combinado no atendimento
  const total = cart.subtotal + shipping;

  const requiredOk = Boolean(
    customer.name.trim() &&
      customer.phone.trim() &&
      customer.email.trim() &&
      customer.country.trim() &&
      customer.state.trim() &&
      customer.city.trim() &&
      customer.address.trim() &&
      customer.zip.trim(),
  );

  const summaryText = () => {
    const lines = cart.items.map(
      (i, n) =>
        `${n + 1}. ${i.name} (${i.brand}) — tam ${i.size} — ${i.qty}x ${brl(i.price)}`,
    );
    return [
      `*Novo pedido — Maxor Sports*`,
      ``,
      `*Dados do cliente*`,
      `Nome: ${customer.name}`,
      `Telefone: ${customer.phone}`,
      `E-mail: ${customer.email}`,
      `País: ${customer.country}`,
      `Estado: ${customer.state}`,
      `Cidade: ${customer.city}`,
      `Endereço completo: ${customer.address}`,
      `CEP: ${customer.zip}`,
      ``,
      `*Itens:*`,
      ...lines,
      ``,
      `*Subtotal:* ${brl(cart.subtotal)}`,
      `*Total:* ${brl(total)}`,
      ``,
      `Combinar frete e confirmar pagamento via PIX.`,
    ].join("\n");
  };

  // Detecta mobile para escolher o esquema correto (whatsapp:// no mobile, web.whatsapp.com no desktop).
  const buildWaLinks = () => {
    const text = encodeURIComponent(summaryText());
    return {
      appLink: `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${text}`,
      webLink: `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${text}`,
      universal: `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`,
    };
  };

  const openWhatsApp = () => {
    if (!requiredOk) {
      alert("Preencha todos os dados obrigatórios para enviar o pedido pelo WhatsApp.");
      return;
    }
    const { appLink, webLink, universal } = buildWaLinks();
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const target = isMobile ? appLink : webLink;
    const win = window.open(target, "_blank", "noopener,noreferrer");
    // Fallback universal caso o esquema seja bloqueado
    setTimeout(() => {
      if (!win || win.closed) window.location.href = universal;
    }, 800);
  };

  const copyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (cart.items.length === 0) {
    return (
      <Shell active="">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="font-display text-3xl font-black uppercase text-offwhite">Sua sacola está vazia</h1>
          <p className="mt-2 text-sm text-muted-foreground">Explore o catálogo e escolha seu próximo par.</p>
          <Link
            to="/masculino"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--lime-brand)] px-6 py-3 text-sm font-black uppercase tracking-widest text-navy hover:brightness-110"
          >
            <ChevronLeft className="h-4 w-4" /> Ver catálogo
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell active="">
      <div className="border-b border-white/10 bg-navy">
        <div className="mx-auto max-w-7xl px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--lime-brand)]">
          Home / <span className="text-offwhite">Checkout</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="font-display text-3xl font-black uppercase text-offwhite md:text-4xl">Finalizar pedido</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Como somos agentes, o fechamento acontece via WhatsApp. Você pode pagar no PIX abaixo ou combinar direto com a gente.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Itens + dados */}
          <div className="space-y-6">
            <section className="rounded-xl border border-border bg-card">
              <header className="border-b border-border px-5 py-3">
                <h2 className="font-display text-sm font-black uppercase tracking-widest text-offwhite">
                  Itens ({cart.count})
                </h2>
              </header>
              <ul className="divide-y divide-border">
                {cart.items.map((i) => (
                  <li key={i.id} className="flex items-center gap-4 p-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-card">
                      <img src={i.img} alt={i.name} className="h-full w-full object-contain p-1" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--cyan-brand)]">{i.brand}</p>
                      <p className="truncate text-sm font-semibold text-offwhite">{i.name}</p>
                      <p className="text-xs text-muted-foreground">Tamanho {i.size}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => cart.setQty(i.id, i.qty - 1)}
                          className="h-7 w-7 rounded border border-border text-sm font-bold hover:bg-muted"
                        >
                          −
                        </button>
                        <span className="min-w-[2ch] text-center text-sm font-semibold">{i.qty}</span>
                        <button
                          onClick={() => cart.setQty(i.id, i.qty + 1)}
                          className="h-7 w-7 rounded border border-border text-sm font-bold hover:bg-muted"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-base font-black text-offwhite">{brl(i.price * i.qty)}</p>
                      <button
                        onClick={() => cart.remove(i.id)}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remover
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-sm font-black uppercase tracking-widest text-offwhite">
                Seus dados para envio
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Preencha todos os campos — essas informações são obrigatórias para fechar o pedido e vão no resumo enviado ao WhatsApp.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Nome completo *" value={customer.name} onChange={(v) => setCustomer({ ...customer, name: v })} placeholder="Como está no documento" />
                <Field label="Telefone / WhatsApp *" value={customer.phone} onChange={(v) => setCustomer({ ...customer, phone: v })} placeholder="(77) 99999-0000" />
                <Field label="E-mail *" value={customer.email} onChange={(v) => setCustomer({ ...customer, email: v })} placeholder="voce@email.com" type="email" />
                <Field label="País *" value={customer.country} onChange={(v) => setCustomer({ ...customer, country: v })} placeholder="Brasil" />
                <Field label="Estado *" value={customer.state} onChange={(v) => setCustomer({ ...customer, state: v })} placeholder="BA" />
                <Field label="Cidade *" value={customer.city} onChange={(v) => setCustomer({ ...customer, city: v })} placeholder="Barreiras" />
                <div className="sm:col-span-2">
                  <Field label="Endereço completo *" value={customer.address} onChange={(v) => setCustomer({ ...customer, address: v })} placeholder="Rua, número, complemento, bairro" />
                </div>
                <Field label="CEP *" value={customer.zip} onChange={(v) => setCustomer({ ...customer, zip: v })} placeholder="47800-000" />
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                * Em breve o cadastro completo vai gerar uma área do cliente com histórico de pedidos, dados bancários e rastreio dos Correios.
              </p>
            </section>


            <section className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-sm font-black uppercase tracking-widest text-offwhite">
                Pagamento via PIX
              </h2>
              <p className="mt-2 text-xs text-muted-foreground">
                Chave PIX (aleatória) — {COMPANY_NAME}
              </p>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-dashed border-[color:var(--cyan-brand)] bg-secondary p-3">
                <code className="flex-1 break-all text-sm font-bold text-offwhite">{PIX_KEY}</code>
                <button
                  onClick={copyPix}
                  className="inline-flex items-center gap-1 rounded-md bg-[color:var(--cyan-brand)] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-navy hover:brightness-110"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Após o pagamento, envie o comprovante pelo WhatsApp para confirmarmos e liberar a importação.
              </p>
            </section>
          </div>

          {/* Resumo */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-sm font-black uppercase tracking-widest text-offwhite">Resumo</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-semibold">{brl(cart.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Frete</dt>
                  <dd className="text-xs italic text-muted-foreground">combinado no atendimento</dd>
                </div>
                <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
                  <dt className="font-display text-sm font-black uppercase text-offwhite">Total</dt>
                  <dd className="font-display text-2xl font-black text-offwhite">{brl(total)}</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={openWhatsApp}
                aria-disabled={!requiredOk}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-black uppercase tracking-widest text-white ${
                  requiredOk ? "bg-[#25D366] hover:brightness-110" : "cursor-not-allowed bg-neutral-400"
                }`}
              >
                Enviar pedido no WhatsApp
              </button>

              <button
                onClick={() => cart.clear()}
                className="mt-3 w-full text-xs text-muted-foreground hover:text-red-500"
              >
                Esvaziar sacola
              </button>
              <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
                Ao finalizar, mandamos o resumo do pedido para o agente Maxor. Confirmamos disponibilidade,
                combinamos o frete e liberamos o pagamento PIX para você.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
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

