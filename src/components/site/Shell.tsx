import { ReactNode } from "react";
import {
  Search, User, Heart, ShoppingBag, MapPin, Menu, Zap,
  Instagram, Facebook, Youtube,
} from "lucide-react";
import monogram from "@/assets/maxor-monogram.png.asset.json";

const NAV = [
  { label: "Masculino", href: "/masculino" },
  { label: "Feminino", href: "/feminino" },
  { label: "Infantil", href: "/infantil" },
  { label: "Marcas", href: "/marcas" },
  { label: "Roupas", href: "/roupas" },
  { label: "Ofertas", href: "#" },
];

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
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy text-offwhite backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4">
        <button className="md:hidden" aria-label="menu"><Menu className="h-6 w-6" /></button>
        <a href="/" className="flex items-center gap-2">
          <img src={monogram.url} alt="Maxor Sports" className="h-10 w-auto" />
          <div className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-xl font-bold tracking-wider">MAXOR</span>
            <span className="text-[10px] font-medium tracking-[0.3em] text-offwhite/60">SPORTS</span>
          </div>
        </a>
        <div className="hidden flex-1 md:block">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-offwhite/60" />
            <input
              type="search"
              placeholder="Buscar por tênis, marca ou modelo…"
              className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-11 pr-28 text-sm text-offwhite placeholder:text-offwhite/50 outline-none transition focus:border-[color:var(--cyan-brand)] focus:bg-white/10"
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-[color:var(--cyan-brand)] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-navy hover:brightness-110">
              Buscar
            </button>
          </label>
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
    </header>
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
