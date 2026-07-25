import { ReactNode, useRef, useState } from "react";
import {
  Search, User, Heart, ShoppingBag, MapPin, Menu, Zap, Camera, X, Loader2,
  Instagram, Facebook, Youtube, Phone, Mail, Truck,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import monogram from "@/assets/maxor-monogram.png.asset.json";
import {
  searchByName,
  searchByImage,
  type ProductHit,
} from "@/lib/crm.image-search.functions";
import { recordNewsletterSignup } from "@/lib/crm.contacts.functions";

const NAV = [
  { label: "Masculino", href: "/masculino" },
  { label: "Feminino", href: "/feminino" },
  { label: "Infantil", href: "/infantil" },
  { label: "Marcas", href: "/marcas" },
  { label: "Roupas", href: "/roupas" },
  { label: "Ofertas", href: "/ofertas" },
];

const WHATSAPP_NUMBER = "5577999599009";
const WHATSAPP_DISPLAY = "(77) 99959-9009";
const COMPANY_EMAIL = "maxortecnologia@gmail.com";
const COMPANY_CNPJ = "68.105.594/0001-39";
const COMPANY_NAME = "Maxor Importação LTDA";
const TRACKING_URL = "https://rastreamento.correios.com.br/app/index.php";
const WHATSAPP_MSG =
  "Olá Maxor! Não encontrei o modelo que procuro no site, podem me ajudar?";

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .17 5.33.17 11.9c0 2.1.55 4.15 1.6 5.96L0 24l6.32-1.66a11.87 11.87 0 0 0 5.74 1.46h.01c6.55 0 11.88-5.33 11.88-11.9 0-3.18-1.24-6.17-3.43-8.42ZM12.07 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.75.98 1-3.65-.24-.38a9.86 9.86 0 0 1-1.52-5.26c0-5.46 4.45-9.9 9.92-9.9 2.65 0 5.14 1.03 7.02 2.9a9.85 9.85 0 0 1 2.91 7 9.92 9.92 0 0 1-9.93 9.9Zm5.44-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.42.25-.7.25-1.29.18-1.42-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

export function Shell({ children, active }: { children: ReactNode; active?: string }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <Header />
      <MegaNav active={active} />
      {children}
      <Newsletter />
      <Footer />
    </div>
  );
}

function TopBar() {
  return (
    <div className="bg-navy text-offwhite text-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-[color:var(--lime-brand)]" />
          <span className="font-display uppercase tracking-widest">Performance com seu estilo e personalidade</span>
        </div>
        <div className="hidden items-center gap-5 md:flex">
          <span className="flex items-center gap-1 text-offwhite/70"><MapPin className="h-3.5 w-3.5" />Envio para todo Brasil</span>
          <a href={`tel:+${WHATSAPP_NUMBER}`} className="flex items-center gap-1 hover:text-[color:var(--cyan-brand)]">
            <Phone className="h-3.5 w-3.5" />Atendimento {WHATSAPP_DISPLAY}
          </a>
          <a href={TRACKING_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[color:var(--cyan-brand)]">
            <Truck className="h-3.5 w-3.5" />Rastreie seu pedido
          </a>
        </div>
      </div>
    </div>
  );
}

type SearchState =
  | { kind: "idle" }
  | { kind: "loading"; label: string }
  | { kind: "results"; term: string; hits: ProductHit[] }
  | { kind: "empty"; term: string }
  | { kind: "error"; term: string; message: string };

function Header() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>({ kind: "idle" });

  const runName = useServerFn(searchByName);
  const runImage = useServerFn(searchByImage);

  const submitName = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setState({ kind: "loading", label: `Buscando "${q}"…` });
    try {
      const r = await runName({ data: { query: q } });
      if (r.count === 0) setState({ kind: "empty", term: q });
      else setState({ kind: "results", term: q, hits: r.results });
    } catch (err) {
      setState({ kind: "error", term: q, message: (err as Error).message });
    }
  };

  const submitImage = async (dataUrl: string, fileName: string) => {
    setState({ kind: "loading", label: "Analisando imagem…" });
    try {
      const r = await runImage({ data: { imageDataUrl: dataUrl } });
      const term =
        [r.vision.brand, r.vision.model].filter(Boolean).join(" ") || fileName;
      if (r.count === 0) setState({ kind: "empty", term });
      else setState({ kind: "results", term, hits: r.results });
    } catch (err) {
      setState({ kind: "error", term: fileName, message: (err as Error).message });
    }
  };

  const close = () => setState({ kind: "idle" });

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy text-offwhite backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 md:gap-4">
        <button className="md:hidden" aria-label="menu"><Menu className="h-6 w-6" /></button>
        <a href="/" className="flex shrink-0 items-center gap-2">
          <img src={monogram.url} alt="Maxor Sports" className="h-10 w-auto" />
          <div className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-xl font-bold tracking-wider">MAXOR</span>
            <span className="text-[10px] font-medium tracking-[0.3em] text-offwhite/60">SPORTS</span>
          </div>
        </a>

        {/* SEARCH BAR — sempre visível (nome + imagem), fica logo depois da logo */}
        <form
          onSubmit={submitName}
          className="flex flex-1 items-stretch overflow-hidden rounded-full border border-white/10 bg-white/5 focus-within:border-[color:var(--cyan-brand)]"
        >
          <ImageSearch onImage={submitImage} />
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-offwhite/60" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome, marca ou modelo…"
              className="w-full bg-transparent py-2.5 pl-9 pr-3 text-sm text-offwhite placeholder:text-offwhite/50 outline-none md:py-3"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 bg-[color:var(--cyan-brand)] px-4 text-xs font-semibold uppercase tracking-wider text-navy hover:brightness-110 md:px-6"
            aria-label="Buscar"
          >
            <span className="hidden sm:inline">Buscar</span>
            <Search className="h-4 w-4 sm:hidden" />
          </button>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-3 text-sm md:gap-5">
          <a href="#" className="hidden items-center gap-2 hover:text-[color:var(--cyan-brand)] lg:flex">
            <User className="h-5 w-5" />
            <div className="leading-tight">
              <div className="text-[10px] uppercase text-offwhite/60">Olá, Franklin</div>
              <div className="font-semibold">Minha Conta</div>
            </div>
          </a>
          <a href="#" className="hidden hover:text-[color:var(--cyan-brand)] md:block"><Heart className="h-5 w-5" /></a>
          <a href="#" className="relative flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-offwhite hover:bg-white/15 md:px-4">
            <ShoppingBag className="h-5 w-5" />
            <span className="hidden text-xs font-semibold uppercase tracking-wider md:inline">Sacola</span>
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[color:var(--cyan-brand)] text-[10px] font-bold text-navy">2</span>
          </a>
        </div>
      </div>

      <SearchDropdown state={state} onClose={close} />
    </header>
  );
}

function SearchDropdown({ state, onClose }: { state: SearchState; onClose: () => void }) {
  if (state.kind === "idle") return null;
  return (
    <div className="border-t border-white/5 bg-navy/95">
      <div className="mx-auto max-w-7xl px-4 py-3">
        {state.kind === "loading" && (
          <div className="flex items-center gap-2 text-xs text-offwhite/80">
            <Loader2 className="h-4 w-4 animate-spin text-[color:var(--cyan-brand)]" />
            {state.label}
          </div>
        )}
        {state.kind === "results" && (
          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-offwhite/70">
              <span>
                {state.hits.length} resultado(s) para{" "}
                <span className="text-[color:var(--lime-brand)]">{state.term}</span>
              </span>
              <button onClick={onClose} className="text-offwhite/60 hover:text-offwhite">
                fechar
              </button>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
              {state.hits.slice(0, 12).map((p) => (
                <li key={p.id}>
                  <a href={`/marcas/${p.brand.toLowerCase().replace(/\s+/g, "-")}`} className="group block rounded-xl bg-white/5 p-2 hover:bg-white/10">
                    <div className="aspect-square overflow-hidden rounded-lg bg-white">
                      <img src={p.img} alt={p.name} className="h-full w-full object-contain p-2 transition group-hover:scale-105" />
                    </div>
                    <div className="mt-2 truncate text-[11px] font-semibold text-offwhite">{p.name}</div>
                    <div className="text-[10px] text-offwhite/60">{p.brand}</div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {(state.kind === "empty" || state.kind === "error") && (
          <NotFoundBalloon
            term={state.term}
            error={state.kind === "error" ? state.message : undefined}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

function NotFoundBalloon({
  term,
  error,
  onClose,
}: {
  term: string;
  error?: string;
  onClose: () => void;
}) {
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `${WHATSAPP_MSG} (Referência: ${term})`,
  )}`;
  const mailHref = `mailto:contato@maxorsports.com.br?subject=${encodeURIComponent(
    "Busca de modelo — Maxor Sports",
  )}&body=${encodeURIComponent(
    `Olá! Não encontrei este modelo no site: ${term}. Podem verificar disponibilidade?`,
  )}`;
  return (
    <div className="flex items-start gap-3">
      <div className="relative flex-1 rounded-2xl border border-[color:var(--cyan-brand)]/30 bg-white/5 px-4 py-3 text-xs text-offwhite/90">
        <span
          aria-hidden
          className="absolute -top-1.5 left-6 h-3 w-3 rotate-45 border-l border-t border-[color:var(--cyan-brand)]/30 bg-navy"
        />
        {error ? (
          <span>Não deu pra buscar agora ({error}). </span>
        ) : (
          <>
            Não encontramos <span className="font-semibold text-[color:var(--lime-brand)]">{term}</span> no nosso site.{" "}
          </>
        )}
        Mande uma imagem ou nome do modelo para nosso email ou clica no botão do WhatsApp que vamos buscar e retornar pra você se teremos ou não o item procurado.
      </div>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        title="Falar no WhatsApp"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#25D366] text-white shadow-md transition hover:brightness-110"
      >
        <WhatsAppIcon className="h-5 w-5" />
      </a>
      <a
        href={mailHref}
        aria-label="Enviar por e-mail"
        title="Enviar por e-mail"
        className="hidden h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-offwhite/80 hover:border-[color:var(--cyan-brand)] hover:text-[color:var(--cyan-brand)] sm:grid"
      >
        <Search className="h-4 w-4" />
      </a>
      <button
        onClick={onClose}
        aria-label="Fechar"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-offwhite/60 hover:bg-white/10 hover:text-offwhite"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * ImageSearch — botão de câmera embutido na barra de busca.
 * Ao escolher a imagem, converte pra data URL e dispara a busca visual
 * (Gemini vision + rank no catálogo). Ver `crm.image-search.functions.ts`.
 */
function ImageSearch({ onImage }: { onImage: (dataUrl: string, fileName: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // limita a 5MB pra não estourar payload da server fn
    if (f.size > 5 * 1024 * 1024) {
      alert("Imagem muito grande (máx. 5MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      if (dataUrl.startsWith("data:image/")) onImage(dataUrl, f.name);
    };
    reader.readAsDataURL(f);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex shrink-0 items-center gap-2 border-r border-white/10 px-3 text-[color:var(--lime-brand)] hover:bg-white/5"
        title="Pesquisar por imagem"
        aria-label="Pesquisar por imagem"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-[color:var(--lime-brand)] text-navy">
          <Camera className="h-3.5 w-3.5" />
        </span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onPick}
      />
    </>
  );
}

function MegaNav({ active }: { active?: string }) {
  return (
    <nav className="border-b border-white/10 bg-navy text-offwhite">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4">
        {NAV.map((item) => {
          const isActive = active === item.label;
          const isOffer = item.label === "Ofertas";
          return (
            <a
              key={item.label}
              href={item.href}
              className={`whitespace-nowrap px-4 py-3 text-sm font-display font-semibold uppercase tracking-wider transition ${
                isActive
                  ? "text-[color:var(--cyan-brand)] border-b-2 border-[color:var(--cyan-brand)]"
                  : "text-offwhite/80 hover:text-[color:var(--cyan-brand)]"
              } ${isOffer ? "text-[color:var(--lime-brand)] font-bold" : ""}`}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

function Newsletter() {
  const signup = useServerFn(recordNewsletterSignup);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState<string>("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const r = await signup({ data: { email } });
      if (r.ok) {
        setStatus("ok");
        setMsg("Pronto! Você entrou na tribo MX. Em breve retornaremos.");
        setEmail("");
      } else {
        setStatus("error");
        setMsg("Não conseguimos cadastrar agora. Tente novamente em instantes.");
      }
    } catch (err) {
      setStatus("error");
      setMsg((err as Error).message || "Erro ao cadastrar.");
    }
  };

  return (
    <section className="bg-navy text-offwhite">
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-14 md:grid-cols-2">
        <div>
          <div className="font-display text-xs uppercase tracking-[0.3em] text-[color:var(--lime-brand)]">Newsletter</div>
          <h3 className="mt-2 font-display text-3xl font-bold uppercase md:text-4xl">
            Entre na tribo <span className="text-gradient-brand">MX</span>
          </h3>
          <p className="mt-2 text-sm text-offwhite/70">Receba lançamentos, drops e ofertas exclusivas Maxor Sports.</p>
        </div>
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu melhor e-mail"
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-offwhite placeholder:text-offwhite/40 outline-none focus:border-[color:var(--cyan-brand)]"
          />
          <button
            disabled={status === "loading"}
            className="rounded-full bg-[color:var(--lime-brand)] px-7 py-3 text-sm font-bold uppercase tracking-widest text-navy hover:brightness-110 disabled:opacity-60"
          >
            {status === "loading" ? "Enviando…" : "Cadastrar"}
          </button>
        </form>
        {status !== "idle" && status !== "loading" && (
          <p className={`text-xs md:col-span-2 ${status === "ok" ? "text-[color:var(--lime-brand)]" : "text-red-300"}`}>
            {msg}
          </p>
        )}
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    {
      title: "Institucional",
      links: [
        { label: "Sobre a Maxor", href: "#" },
        { label: "Nossa curadoria", href: "#" },
        { label: "Trabalhe conosco", href: `mailto:${COMPANY_EMAIL}` },
      ],
    },
    {
      title: "Ajuda",
      links: [
        { label: `Central de atendimento ${WHATSAPP_DISPLAY}`, href: `tel:+${WHATSAPP_NUMBER}` },
        { label: `WhatsApp ${WHATSAPP_DISPLAY}`, href: `https://wa.me/${WHATSAPP_NUMBER}`, external: true },
        { label: "Rastrear pedido", href: TRACKING_URL, external: true },
      ],
    },
    {
      title: "Categorias",
      links: [
        { label: "Masculino", href: "/masculino" },
        { label: "Feminino", href: "/feminino" },
        { label: "Infantil", href: "/infantil" },
        { label: "Marcas", href: "/marcas" },
        { label: "Chuteiras", href: "/marcas/chuteiras" },
        { label: "Roupas", href: "/roupas" },
        { label: "Ofertas", href: "/ofertas" },
      ],
    },
  ];
  return (
    <footer className="bg-[#050b13] text-offwhite">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src={monogram.url} alt="Maxor Sports" className="h-10 w-auto" />
            <div>
              <div className="font-display text-lg font-bold tracking-wider">MAXOR SPORTS</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-offwhite/60">Seu esporte. Seu máximo.</div>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm text-offwhite/60">
            Curadoria de tênis e artigos esportivos com performance, estilo e personalidade. Atendimento próximo — do primeiro clique à entrega.
          </p>
          <ul className="mt-5 space-y-1.5 text-xs text-offwhite/70">
            <li>{COMPANY_NAME}</li>
            <li>CNPJ {COMPANY_CNPJ}</li>
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-[color:var(--cyan-brand)]" />
              <a href={`mailto:${COMPANY_EMAIL}`} className="hover:text-offwhite">{COMPANY_EMAIL}</a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-[color:var(--cyan-brand)]" />
              <a href={`tel:+${WHATSAPP_NUMBER}`} className="hover:text-offwhite">{WHATSAPP_DISPLAY}</a>
            </li>
            <li className="flex items-center gap-2">
              <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366]" />
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hover:text-offwhite">
                WhatsApp {WHATSAPP_DISPLAY}
              </a>
            </li>
          </ul>
          <div className="mt-5 flex gap-3">
            {[Instagram, Facebook, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 hover:border-[color:var(--cyan-brand)] hover:text-[color:var(--cyan-brand)]">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div className="font-display text-sm font-bold uppercase tracking-widest text-[color:var(--cyan-brand)]">{c.title}</div>
            <ul className="mt-4 space-y-2 text-sm text-offwhite/70">
              {c.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    {...("external" in l && l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="hover:text-offwhite"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-offwhite/50 md:flex-row">
          <span>© {new Date().getFullYear()} {COMPANY_NAME} — CNPJ {COMPANY_CNPJ}. Todos os direitos reservados.</span>
          <span className="font-display uppercase tracking-widest">Performance com seu estilo e personalidade</span>
        </div>
      </div>
    </footer>
  );
}
