import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  MapPin,
  Truck,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  Instagram,
  Facebook,
  Youtube,
  ChevronRight,
  Menu,
  Zap,
} from "lucide-react";
import monogram from "@/assets/maxor-monogram.png.asset.json";
import identity from "@/assets/maxor-identity.png.asset.json";
import heroRunner from "@/assets/hero-runner.jpg";
import shoeBostonPink from "@/assets/shoe-boston-pink.jpg.asset.json";
import shoeTerrexSpeed from "@/assets/shoe-terrex-speed.jpg.asset.json";
import shoeUltraboost5 from "@/assets/shoe-ultraboost5.jpg.asset.json";
import shoeUltraboost22 from "@/assets/shoe-ultraboost22.jpg.asset.json";
import shoeUb20Osaka from "@/assets/shoe-ub20-osaka.jpg.asset.json";
import shoeGazelleRed from "@/assets/shoe-gazelle-red.jpg.asset.json";
import shoeSupernova from "@/assets/shoe-supernova.jpg.asset.json";
import shoeTerrexDaroga from "@/assets/shoe-terrex-daroga.jpg.asset.json";
import shoeAf1Grey from "@/assets/shoe-af1-grey.jpg.asset.json";
import shoeAf1Cpfm from "@/assets/shoe-af1-cpfm.jpg.asset.json";
import catFem from "@/assets/cat-feminino.jpg";
import catMasc from "@/assets/cat-masculino.jpg";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Maxor Sports — Tênis e artigos esportivos" },
      { name: "description", content: "Curadoria Maxor Sports: tênis, roupas e acessórios esportivos com performance, estilo e personalidade." },
      { property: "og:title", content: "Maxor Sports — Seu esporte. Seu máximo." },
      { property: "og:description", content: "Tênis e artigos esportivos com estilo e performance." },
    ],
  }),
});

const NAV = [
  "Masculino",
  "Feminino",
  "Infantil",
  "Tênis",
  "Roupas",
  "Acessórios",
  "Marcas",
  "Ofertas",
];

const CATEGORIES = [
  { label: "Corrida", img: shoeCyan },
  { label: "Basquete", img: shoeBball },
  { label: "Casual", img: shoeWhite },
  { label: "Training", img: shoeLime },
  { label: "Feminino", img: catFem },
  { label: "Masculino", img: catMasc },
];

const PRODUCTS = [
  { name: "MX Runner Pro Cyan", price: 499.9, old: 649.9, tag: "Novo", img: shoeCyan, colors: ["#00d4c6", "#0a1420", "#f5f7f8"] },
  { name: "MX Volt Lime", price: 549.9, old: 699.9, tag: "-21%", img: shoeLime, colors: ["#c7f500", "#0a1420"] },
  { name: "MX Cloud White Mint", price: 429.9, old: 519.9, tag: "Top", img: shoeWhite, colors: ["#ffffff", "#6ef0b8"] },
  { name: "MX Court High Cyan", price: 599.9, old: 749.9, tag: "-20%", img: shoeBball, colors: ["#0a1420", "#00d4c6"] },
];

const OFFERS = [
  { name: "MX Runner Pro Cyan", price: 349.9, old: 499.9, tag: "-30%", img: shoeCyan },
  { name: "MX Volt Lime Trainer", price: 379.9, old: 549.9, tag: "-31%", img: shoeLime },
  { name: "MX Cloud White", price: 299.9, old: 429.9, tag: "-30%", img: shoeWhite },
  { name: "MX Court High", price: 419.9, old: 599.9, tag: "-30%", img: shoeBball },
];

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <Header />
      <MegaNav />
      <Hero />
      <BenefitsStrip />
      <CategoryCircles />
      <ProductCarousel title="Lançamentos" subtitle="A curadoria mais fresca da Maxor" items={PRODUCTS} />
      <BrandBanner />
      <ProductCarousel title="Ofertas da semana" subtitle="Preços com desconto para levar hoje" items={OFFERS} accent />
      <CategoryBanners />
      <BrandStrip />
      <Newsletter />
      <Footer />
    </div>
  );
}

/* ---------- Header + Nav ---------- */

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
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4">
        <button className="md:hidden" aria-label="menu"><Menu className="h-6 w-6" /></button>
        <a href="/" className="flex items-center gap-2">
          <img src={monogram.url} alt="Maxor Sports" className="h-10 w-auto" />
          <div className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-xl font-bold tracking-wider">MAXOR</span>
            <span className="text-[10px] font-medium tracking-[0.3em] text-muted-foreground">SPORTS</span>
          </div>
        </a>

        <div className="hidden flex-1 md:block">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar por tênis, marca ou modelo…"
              className="w-full rounded-full border border-border bg-secondary/60 py-3 pl-11 pr-28 text-sm outline-none transition focus:border-[color:var(--cyan-brand)] focus:bg-background"
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-navy px-5 py-2 text-xs font-semibold uppercase tracking-wider text-offwhite hover:opacity-90">
              Buscar
            </button>
          </label>
        </div>

        <div className="ml-auto flex items-center gap-5 text-sm">
          <a href="#" className="hidden items-center gap-2 hover:text-[color:var(--cyan-brand)] md:flex">
            <User className="h-5 w-5" />
            <div className="leading-tight">
              <div className="text-[10px] uppercase text-muted-foreground">Olá, Franklin</div>
              <div className="font-semibold">Minha Conta</div>
            </div>
          </a>
          <a href="#" className="hidden hover:text-[color:var(--cyan-brand)] md:block"><Heart className="h-5 w-5" /></a>
          <a href="#" className="relative flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-offwhite hover:opacity-90">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Sacola</span>
            <span className="ml-1 grid h-5 w-5 place-items-center rounded-full bg-[color:var(--cyan-brand)] text-[10px] font-bold text-navy">2</span>
          </a>
        </div>
      </div>
    </header>
  );
}

function MegaNav() {
  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4">
        {NAV.map((item, i) => (
          <a
            key={item}
            href="#"
            className={`whitespace-nowrap px-4 py-3 text-sm font-display font-semibold uppercase tracking-wider transition hover:text-[color:var(--cyan-brand)] ${
              i >= NAV.length - 1 ? "text-[color:var(--lime-brand)] font-bold" : ""
            }`}
          >
            {item}
          </a>
        ))}
      </div>
    </nav>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy text-offwhite">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-20">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--cyan-brand)]/40 bg-[color:var(--cyan-brand)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[color:var(--cyan-brand)]">
            <Zap className="h-3.5 w-3.5" /> Nova coleção MX
          </span>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] md:text-7xl">
            SEU ESPORTE. <br />
            <span className="text-gradient-brand">SEU MÁXIMO.</span>
          </h1>
          <p className="mt-5 max-w-md text-base text-offwhite/70">
            Tênis e artigos esportivos com curadoria Maxor. Escolha entre dezenas de cores e variações — todas com a performance que você merece.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#" className="rounded-full bg-[color:var(--lime-brand)] px-7 py-3 text-sm font-bold uppercase tracking-widest text-navy hover:brightness-110">
              Compre agora
            </a>
            <a href="#" className="rounded-full border border-offwhite/30 px-7 py-3 text-sm font-bold uppercase tracking-widest hover:border-[color:var(--cyan-brand)] hover:text-[color:var(--cyan-brand)]">
              Ver catálogo
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-xs uppercase tracking-widest text-offwhite/60">
            <span>+ 500 modelos</span>
            <span>+ 30 cores por linha</span>
            <span>Envio para todo Brasil</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 rounded-[40%] bg-[color:var(--cyan-brand)]/20 blur-3xl" aria-hidden />
          <img
            src={heroRunner}
            alt="Atleta em movimento com performance Maxor"
            width={1600}
            height={900}
            className="relative rounded-2xl object-cover"
          />
          <div className="absolute -bottom-4 -left-4 flex items-center gap-3 rounded-2xl border border-offwhite/10 bg-navy/80 px-4 py-3 backdrop-blur">
            <img src={monogram.url} alt="" className="h-8 w-8" />
            <div className="text-xs">
              <div className="font-display font-bold uppercase tracking-widest text-[color:var(--cyan-brand)]">MX Runner Pro</div>
              <div className="text-offwhite/70">A partir de R$ 349,90</div>
            </div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

/* ---------- Sections ---------- */

function BenefitsStrip() {
  const items = [
    { icon: Truck, title: "Frete grátis", sub: "Nas compras acima de R$ 299" },
    { icon: CreditCard, title: "Até 10x sem juros", sub: "Nos principais cartões" },
    { icon: RotateCcw, title: "Troca fácil", sub: "Até 30 dias" },
    { icon: ShieldCheck, title: "Compra segura", sub: "Curadoria Maxor" },
  ];
  return (
    <section className="border-b border-border bg-secondary/60">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4">
        {items.map((it) => (
          <div key={it.title} className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-navy text-[color:var(--cyan-brand)]">
              <it.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-sm font-bold uppercase tracking-wider">{it.title}</div>
              <div className="text-xs text-muted-foreground">{it.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryCircles() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <SectionHeader title="Compre por categoria" subtitle="Escolha seu esporte e vá além" />
      <div className="mt-8 grid grid-cols-3 gap-6 md:grid-cols-6">
        {CATEGORIES.map((c) => (
          <a key={c.label} href="#" className="group flex flex-col items-center gap-3">
            <div className="relative aspect-square w-full overflow-hidden rounded-full border border-border bg-secondary transition group-hover:border-[color:var(--cyan-brand)]">
              <img src={c.img} alt={c.label} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
            </div>
            <span className="font-display text-sm font-semibold uppercase tracking-wider">{c.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ title, subtitle, cta = "Ver todos" }: { title: string; subtitle?: string; cta?: string }) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide md:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <a href="#" className="hidden items-center gap-1 text-sm font-semibold text-[color:var(--cyan-brand)] hover:underline md:flex">
        {cta} <ChevronRight className="h-4 w-4" />
      </a>
    </div>
  );
}

type Product = {
  name: string;
  price: number;
  old?: number;
  tag?: string;
  img: string;
  colors?: string[];
};

function ProductCarousel({ title, subtitle, items, accent }: { title: string; subtitle?: string; items: Product[]; accent?: boolean }) {
  return (
    <section className={`${accent ? "bg-navy text-offwhite" : ""}`}>
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className={accent ? "[&_h2]:text-offwhite [&_p]:text-offwhite/60" : ""}>
          <SectionHeader title={title} subtitle={subtitle} />
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {items.map((p) => (
            <ProductCard key={p.name} product={p} dark={accent} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, dark }: { product: Product; dark?: boolean }) {
  const discount = product.old ? Math.round((1 - product.price / product.old) * 100) : 0;
  return (
    <a
      href="#"
      className={`group flex flex-col overflow-hidden rounded-2xl border transition hover:-translate-y-1 hover:shadow-xl ${
        dark ? "border-white/10 bg-[#0f1c2c]" : "border-border bg-card"
      }`}
    >
      <div className="relative aspect-square overflow-hidden bg-navy">
        {product.tag && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-[color:var(--lime-brand)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-navy">
            {product.tag}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-[color:var(--cyan-brand)] px-2.5 py-1 text-[10px] font-bold text-navy">
            -{discount}%
          </span>
        )}
        <img src={product.img} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="font-display text-sm font-bold uppercase tracking-wide">{product.name}</div>
        {product.colors && (
          <div className="flex gap-1.5">
            {product.colors.map((c) => (
              <span key={c} className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: c }} />
            ))}
            <span className={`text-[10px] font-medium uppercase tracking-wider ${dark ? "text-offwhite/60" : "text-muted-foreground"}`}>
              +12 cores
            </span>
          </div>
        )}
        <div className="mt-auto">
          {product.old && (
            <div className={`text-xs line-through ${dark ? "text-offwhite/40" : "text-muted-foreground"}`}>
              R$ {product.old.toFixed(2).replace(".", ",")}
            </div>
          )}
          <div className="text-lg font-bold text-[color:var(--cyan-brand)]">
            R$ {product.price.toFixed(2).replace(".", ",")}
          </div>
          <div className={`text-[11px] ${dark ? "text-offwhite/60" : "text-muted-foreground"}`}>
            ou 10x de R$ {(product.price / 10).toFixed(2).replace(".", ",")}
          </div>
        </div>
      </div>
    </a>
  );
}

function BrandBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="relative overflow-hidden rounded-3xl bg-navy p-8 md:p-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[color:var(--cyan-brand)]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[color:var(--lime-brand)]/20 blur-3xl" />
        <div className="relative grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <div className="font-display text-xs uppercase tracking-[0.3em] text-[color:var(--cyan-brand)]">Maxor Sports</div>
            <h3 className="mt-3 font-display text-3xl font-bold uppercase leading-tight text-offwhite md:text-5xl">
              Performance com seu <span className="text-gradient-brand">estilo</span> e <span className="text-gradient-brand">personalidade</span>
            </h3>
            <p className="mt-4 max-w-lg text-sm text-offwhite/70">
              Cada modelo com dezenas de variações de cor. Escolha o seu, feche com nosso agente e receba em casa.
            </p>
            <a href="#" className="mt-6 inline-flex rounded-full bg-[color:var(--lime-brand)] px-7 py-3 text-sm font-bold uppercase tracking-widest text-navy hover:brightness-110">
              Explorar catálogo
            </a>
          </div>
          <img src={identity.url} alt="Identidade Maxor Sports" loading="lazy" className="relative rounded-2xl object-cover" />
        </div>
      </div>
    </section>
  );
}

function CategoryBanners() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid gap-6 md:grid-cols-2">
        {[
          { title: "Masculino", copy: "A força do movimento", img: catMasc, color: "var(--lime-brand)" },
          { title: "Feminino", copy: "Potência com atitude", img: catFem, color: "var(--cyan-brand)" },
        ].map((b) => (
          <a key={b.title} href="#" className="group relative aspect-[4/3] overflow-hidden rounded-3xl bg-navy md:aspect-[16/10]">
            <img src={b.img} alt={b.title} loading="lazy" className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-tr from-navy via-navy/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <div className="font-display text-xs uppercase tracking-[0.3em]" style={{ color: `oklch(from ${b.color} l c h)` }}>
                <span style={{ color: `var(${b.color === "var(--lime-brand)" ? "--lime-brand" : "--cyan-brand"})` }}>Maxor</span>
              </div>
              <h3 className="mt-1 font-display text-4xl font-bold uppercase text-offwhite md:text-5xl">{b.title}</h3>
              <p className="mt-1 text-sm text-offwhite/80">{b.copy}</p>
              <span className="mt-4 inline-flex w-max items-center gap-2 border-b-2 border-[color:var(--cyan-brand)] pb-1 text-xs font-bold uppercase tracking-widest text-offwhite">
                Ver coleção <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function BrandStrip() {
  const brands = ["Nike", "Adidas", "Puma", "New Balance", "Asics", "Mizuno", "Under Armour", "Fila"];
  return (
    <section className="border-y border-border bg-secondary/60">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-around gap-6 px-4 py-8">
        {brands.map((b) => (
          <span key={b} className="font-display text-lg font-bold uppercase tracking-widest text-muted-foreground/70 hover:text-navy">
            {b}
          </span>
        ))}
      </div>
    </section>
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
