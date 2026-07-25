import { ReactNode, useRef, useState } from "react";
import {
  Search, User, Heart, ShoppingBag, MapPin, Menu, Zap, Camera, X,
  Instagram, Facebook, Youtube,
} from "lucide-react";
import monogram from "@/assets/maxor-monogram.png.asset.json";

const NAV = [
  { label: "Masculino", href: "/masculino" },
  { label: "Feminino", href: "/feminino" },
  { label: "Infantil", href: "/infantil" },
  { label: "Marcas", href: "/marcas" },
  { label: "Roupas", href: "/roupas" },
  { label: "Ofertas", href: "/ofertas" },
];

const WHATSAPP_NUMBER = "5577999599009";
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
          <a href="#" className="flex items-center gap-1 hover:text-[color:var(--cyan-brand)]"><MapPin className="h-3.5 w-3.5" />Encontre uma loja</a>
          <a href="#" className="hover:text-[color:var(--cyan-brand)]">Atendimento</a>
          <a href="#" className="hover:text-[color:var(--cyan-brand)]">Rastreie seu pedido</a>
        </div>
      </div>
    </div>
  );
}

function Header() {
  // Estado "não encontrado" compartilhado entre busca por nome e por imagem.
  // TODO(CRM/AI): quando a server fn de busca (texto/imagem) retornar 0
  // resultados, chamar setNotFound(true) com o termo pesquisado.
  const [notFound, setNotFound] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const submitTextSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    // Placeholder: sem backend de busca ainda → sempre "não encontrado".
    console.log("[search] termo:", q);
    setNotFound(q);
  };

  const onImageAnalyzed = (fileName: string) => {
    // Placeholder: sem backend de imagem ainda → sempre "não encontrado".
    setNotFound(fileName);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy text-offwhite backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
        <button className="md:hidden" aria-label="menu"><Menu className="h-6 w-6" /></button>
        <a href="/" className="flex items-center gap-2">
          <img src={monogram.url} alt="Maxor Sports" className="h-10 w-auto" />
          <div className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-xl font-bold tracking-wider">MAXOR</span>
            <span className="text-[10px] font-medium tracking-[0.3em] text-offwhite/60">SPORTS</span>
          </div>
        </a>
        <ImageSearch onAnalyzed={onImageAnalyzed} />
        <div className="hidden flex-1 md:block">
          <form onSubmit={submitTextSearch} className="relative block">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-offwhite/60" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por tênis, marca ou modelo…"
              className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-11 pr-28 text-sm text-offwhite placeholder:text-offwhite/50 outline-none transition focus:border-[color:var(--cyan-brand)] focus:bg-white/10"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-[color:var(--cyan-brand)] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-navy hover:brightness-110"
            >
              Buscar
            </button>
          </form>
        </div>
        <div className="ml-auto flex items-center gap-5 text-sm">
          <a href="#" className="hidden items-center gap-2 hover:text-[color:var(--cyan-brand)] md:flex">
            <User className="h-5 w-5" />
            <div className="leading-tight">
              <div className="text-[10px] uppercase text-offwhite/60">Olá, Franklin</div>
              <div className="font-semibold">Minha Conta</div>
            </div>
          </a>
          <a href="#" className="hidden hover:text-[color:var(--cyan-brand)] md:block"><Heart className="h-5 w-5" /></a>
          <a href="#" className="relative flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-offwhite hover:bg-white/15">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Sacola</span>
            <span className="ml-1 grid h-5 w-5 place-items-center rounded-full bg-[color:var(--cyan-brand)] text-[10px] font-bold text-navy">2</span>
          </a>
        </div>
      </div>

      {/* Mobile search row — busca por nome sempre visível */}
      <div className="border-t border-white/5 px-4 py-3 md:hidden">
        <form onSubmit={submitTextSearch} className="relative block">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-offwhite/60" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por tênis, marca ou modelo…"
            className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-11 pr-24 text-sm text-offwhite placeholder:text-offwhite/50 outline-none focus:border-[color:var(--cyan-brand)]"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-[color:var(--cyan-brand)] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-navy"
          >
            Buscar
          </button>
        </form>
      </div>

      {notFound && (
        <NotFoundBalloon term={notFound} onClose={() => setNotFound(null)} />
      )}
    </header>
  );
}

function NotFoundBalloon({ term, onClose }: { term: string; onClose: () => void }) {
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `${WHATSAPP_MSG} (Referência: ${term})`,
  )}`;
  const mailHref = `mailto:contato@maxorsports.com.br?subject=${encodeURIComponent(
    "Busca de modelo — Maxor Sports",
  )}&body=${encodeURIComponent(
    `Olá! Não encontrei este modelo no site: ${term}. Podem verificar disponibilidade?`,
  )}`;
  return (
    <div className="border-t border-white/5 bg-navy/95">
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-3">
        <div className="relative flex-1 rounded-2xl border border-[color:var(--cyan-brand)]/30 bg-white/5 px-4 py-3 text-xs text-offwhite/90">
          <span
            aria-hidden
            className="absolute -top-1.5 left-6 h-3 w-3 rotate-45 border-l border-t border-[color:var(--cyan-brand)]/30 bg-navy"
          />
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
    </div>
  );
}

/**
 * ImageSearch — barra de pesquisa por imagem no topo do site.
 * TODO(CRM/AI): trocar o console.log por server function que envia a
 * imagem pra um modelo multimodal (ex.: google/gemini-3.1-flash) via
 * AI Gateway e retorna candidatos do catálogo. Se retornar vazio,
 * manter o comportamento atual de acionar onAnalyzed(fileName).
 */
export function ImageSearch({ onAnalyzed }: { onAnalyzed?: (fileName: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending">("idle");

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPreview(url);
    setStatus("sending");
    console.log("[image-search] arquivo recebido:", f.name, f.size, f.type);
    setTimeout(() => {
      setStatus("idle");
      onAnalyzed?.(f.name);
    }, 800);
  };

  const clear = () => {
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="group flex items-center gap-2 rounded-full border border-[color:var(--lime-brand)]/40 bg-white/5 py-2.5 pl-3 pr-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--lime-brand)] transition hover:border-[color:var(--lime-brand)] hover:bg-white/10 md:pr-4"
        title="Pesquisar por imagem"
        aria-label="Pesquisar por imagem"
      >
        {preview ? (
          <img src={preview} alt="preview" className="h-6 w-6 rounded-full object-cover" />
        ) : (
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[color:var(--lime-brand)] text-navy">
            <Camera className="h-3.5 w-3.5" />
          </span>
        )}
        <span className="hidden lg:inline">
          {status === "sending" ? "Analisando…" : preview ? "Nova foto" : "Buscar por imagem"}
        </span>
      </button>
      {preview && (
        <button
          type="button"
          onClick={clear}
          className="ml-1 grid h-8 w-8 place-items-center rounded-full text-offwhite/60 hover:bg-white/10 hover:text-[color:var(--lime-brand)]"
          aria-label="Limpar imagem"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onPick}
      />
    </div>
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
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            required
            placeholder="Seu melhor e-mail"
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-offwhite placeholder:text-offwhite/40 outline-none focus:border-[color:var(--cyan-brand)]"
          />
          <button className="rounded-full bg-[color:var(--lime-brand)] px-7 py-3 text-sm font-bold uppercase tracking-widest text-navy hover:brightness-110">
            Cadastrar
          </button>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    { title: "Institucional", links: ["Sobre a Maxor", "Nossa curadoria", "Trabalhe conosco", "Blog"] },
    { title: "Ajuda", links: ["Central de atendimento", "Como comprar", "Trocas e devoluções", "Rastrear pedido"] },
    { title: "Categorias", links: ["Tênis", "Roupas", "Acessórios", "Ofertas"] },
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
                <li key={l}><a href="#" className="hover:text-offwhite">{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-offwhite/50 md:flex-row">
          <span>© {new Date().getFullYear()} Maxor Sports. Todos os direitos reservados.</span>
          <span className="font-display uppercase tracking-widest">Performance com seu estilo e personalidade</span>
        </div>
      </div>
    </footer>
  );
}
