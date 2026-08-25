import { createFileRoute, Link } from "@tanstack/react-router";
import atletasVideo from "@/assets/atletas-correndo.mp4.asset.json";

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
import monogram from "@/assets/opt/maxor-monogram.png";
import { Shell } from "@/components/site/Shell";
import { LogoLoop } from "@/components/site/LogoLoop";
import { getBrandVisual } from "@/components/site/brands-data";

import { useMemo } from "react";
import { ALL_PRODUCTS, getBrandDirectory } from "@/lib/catalog";
import { useCatalogVersion } from "@/hooks/use-crm-sync";
import catFem from "@/assets/cat-feminino.jpg";
import catMasc from "@/assets/cat-masculino.jpg";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Maxor Sports | Tênis Nike, Adidas, New Balance e mais" },
      {
        name: "description",
        content:
          "Compre tênis de corrida, casual, trail e chuteiras das principais marcas na Maxor Sports. Lançamentos, ofertas da semana e atendimento direto no WhatsApp.",
      },
      { property: "og:title", content: "Maxor Sports | Tênis Nike, Adidas, New Balance e mais" },
      {
        property: "og:description",
        content:
          "Tênis masculinos, femininos e infantis com curadoria Maxor Sports: lançamentos, ofertas e atendimento no WhatsApp.",
      },
      { property: "og:url", content: "https://maxorsports.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://maxorsports.lovable.app/" }],
  }),
});

const NAV = [
  "Masculino",
  "Feminino",
  "Infantil",
  "Marcas",
  "Roupas",
  "Ofertas",
];

function Home() {
  // Tudo abaixo vem do CRM (products.site_visible = true). Sem CRM, sem vitrine.
  const version = useCatalogVersion();
  const { categories, launches, offers, bestSellers, highlights } = useMemo(() => {
    const cats: { label: string; img: string }[] = [];
    for (const p of ALL_PRODUCTS) {
      if (!p.category || cats.some((c) => c.label === p.category)) continue;
      cats.push({ label: p.category, img: p.img });
      if (cats.length === 6) break;
    }
    return {
      categories: cats,
      launches: ALL_PRODUCTS.filter((p) => p.selo === "lancamento").slice(0, 4),
      offers: ALL_PRODUCTS.filter((p) => p.selo === "oferta").slice(0, 4),
      bestSellers: ALL_PRODUCTS.filter((p) => p.selo === "mais-vendido").slice(0, 4),
      highlights: ALL_PRODUCTS.filter((p) => p.selo === "destaque").slice(0, 4),
    };
  }, [version]);

  return (
    <Shell>
      <Hero />
      <BenefitsStrip />
      <CategoryCircles categories={categories} />
      {launches.length > 0 && (
        <ProductCarousel title="Lançamentos" subtitle="A curadoria mais fresca da Maxor" items={launches} to="/lancamentos" />
      )}
      {highlights.length > 0 && (
        <ProductCarousel title="Destaques" subtitle="Modelos selecionados pela curadoria" items={highlights} accent to="/destaques" />
      )}
      <BrandBanner />
      {bestSellers.length > 0 && (
        <ProductCarousel title="Mais Vendidos" subtitle="Os preferidos da galera" items={bestSellers} to="/mais-vendidos" />
      )}
      {offers.length > 0 && (
        <ProductCarousel title="Ofertas da semana" subtitle="Preços com desconto para levar hoje" items={offers} accent to="/ofertas" />
      )}

      <CategoryBanners />
      <BrandStrip />
    </Shell>
  );
}

// Header/TopBar/MegaNav/Newsletter/Footer legados abaixo ficam apenas
// como referência histórica — não são mais renderizados; o Shell cuida disso.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _LegacyBits() { return null; }

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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy text-offwhite backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
        <button className="md:hidden" aria-label="menu"><Menu className="h-6 w-6" /></button>
        <a href="/" className="flex items-center gap-2">
          <img src={monogram} alt="Maxor Sports" className="h-10 w-auto" />
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

function MegaNav() {
  return (
    <nav className="border-b border-white/10 bg-navy text-offwhite">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4">
        {NAV.map((item, i) => {
          const hrefMap: Record<string, string> = {
            Masculino: "/masculino",
            Feminino: "/feminino",
            Infantil: "/infantil",
            Marcas: "/marcas",
            Roupas: "/roupas",
            Ofertas: "/ofertas",
          };
          const href = hrefMap[item] ?? "#";
          return (
            <a
              key={item}
              href={href}
              className={`whitespace-nowrap px-4 py-3 text-sm font-display font-semibold uppercase tracking-wider transition text-offwhite/80 hover:text-[color:var(--cyan-brand)] ${
                i >= NAV.length - 1 ? "text-[color:var(--lime-brand)] font-bold" : ""
              }`}
            >
              {item}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy text-offwhite">
      <video
        src={atletasVideo.url}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-45"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy/85 via-navy/70 to-navy/95" />
      <div className="relative mx-auto grid max-w-7xl place-items-center gap-10 px-4 py-14 text-center md:py-20">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--cyan-brand)]/40 bg-[color:var(--cyan-brand)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[color:var(--cyan-brand)]">
            <Zap className="h-3.5 w-3.5" /> Nova coleção MX
          </span>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] md:text-7xl">
            SEU ESPORTE. <br />
            <span className="text-gradient-brand">SEU MÁXIMO.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base text-offwhite/70">
            Tênis e artigos esportivos com curadoria Maxor. Escolha entre dezenas de cores e variações — todas com a performance que você merece.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-xs uppercase tracking-widest text-offwhite/60">
            <span>+ 500 modelos</span>
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
    { icon: CreditCard, title: "Aceitamos cartão de crédito", sub: "Nos principais cartões" },
    { icon: RotateCcw, title: "Troca até 7 dias", sub: "Após a compra" },
    { icon: ShieldCheck, title: "Qualidade garantida", sub: "Curadoria Maxor" },
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

function CategoryCircles({ categories }: { categories: { label: string; img: string }[] }) {
  if (categories.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <SectionHeader title="Compre por categoria" subtitle="Escolha seu esporte e vá além" to="/categorias" />
      <div className="mt-8 grid grid-cols-3 gap-6 md:grid-cols-6">
        {categories.map((c) => (
          <Link key={c.label} to="/categorias" className="group flex flex-col items-center gap-3">
            <div className="relative aspect-square w-full overflow-hidden rounded-full border border-border bg-secondary transition group-hover:border-[color:var(--cyan-brand)]">
              <img src={c.img} alt={c.label} loading="lazy" className="h-full w-full scale-[1.15] object-contain object-center transition duration-500 group-hover:scale-[1.25]" />
            </div>
            <span className="font-display text-sm font-semibold uppercase tracking-wider">{c.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({
  title,
  subtitle,
  cta = "Ver todos",
  to,
}: {
  title: string;
  subtitle?: string;
  cta?: string;
  to?: "/categorias" | "/lancamentos" | "/ofertas" | "/catalogo" | "/mais-vendidos" | "/destaques";
}) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide md:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {to && (
        <Link to={to} className="hidden items-center gap-1 text-sm font-semibold text-[color:var(--cyan-brand)] hover:underline md:flex">
          {cta} <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

type Product = {
  id: string;
  name: string;
  price: number;
  old?: number;
  tag?: string;
  img: string;
  colors?: string[];
};

function ProductCarousel({
  title,
  subtitle,
  items,
  accent,
  to,
}: {
  title: string;
  subtitle?: string;
  items: Product[];
  accent?: boolean;
  to?: "/categorias" | "/lancamentos" | "/ofertas" | "/catalogo" | "/mais-vendidos" | "/destaques";
}) {
  return (
    <section className={`${accent ? "bg-navy text-offwhite" : ""}`}>
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className={accent ? "[&_h2]:text-offwhite [&_p]:text-offwhite/60" : ""}>
          <SectionHeader title={title} subtitle={subtitle} to={to} />
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
    <Link
      to="/produto/$id"
      params={{ id: product.id }}
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
        <img src={product.img} alt={product.name} loading="lazy" className="h-full w-full scale-[1.05] object-contain object-center transition duration-500 group-hover:scale-[1.15]" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="font-display text-sm font-bold uppercase tracking-wide">{product.name}</div>
        {product.colors && (
          <div className="flex gap-1.5">
            {product.colors.map((c) => (
              <span key={c} className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: c }} />
            ))}
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
    </Link>
  );
}

function BrandBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="relative overflow-hidden rounded-3xl bg-navy p-10 md:p-16">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[color:var(--cyan-brand)]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[color:var(--lime-brand)]/20 blur-3xl" />
        <div className="relative flex flex-col items-center text-center">
          <div className="font-display text-xs uppercase tracking-[0.3em] text-[color:var(--cyan-brand)]">Maxor Sports</div>
          <h3 className="mt-3 font-display text-3xl font-bold uppercase leading-tight text-offwhite md:text-5xl">
            Performance com seu <span className="text-gradient-brand">estilo</span> e <span className="text-gradient-brand">personalidade</span>
          </h3>
          <Link to="/catalogo" className="mt-8 inline-flex rounded-full bg-[color:var(--lime-brand)] px-8 py-3 text-sm font-bold uppercase tracking-widest text-navy hover:brightness-110">
            Explorar catálogo
          </Link>

        </div>
      </div>
    </section>
  );
}

function CategoryBanners() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid gap-6 md:grid-cols-2">
        {([
          { title: "Masculino", copy: "A força do movimento", img: catMasc, color: "var(--lime-brand)", to: "/colecao/masculino" as const },
          { title: "Feminino", copy: "Potência com atitude", img: catFem, color: "var(--cyan-brand)", to: "/colecao/feminino" as const },
        ]).map((b) => (
          <Link key={b.title} to={b.to} className="group relative aspect-[4/3] overflow-hidden rounded-3xl bg-navy md:aspect-[16/10]">
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
          </Link>
        ))}

      </div>
    </section>
  );
}

function BrandStrip() {
  // Re-renderiza quando o CRM sincroniza (realtime) para refletir o catálogo.
  useCatalogVersion();
  // Diretório vivo completo: mantém a esteira estável antes/depois da hidratação.
  // Produtos publicados sobem para o início, mas marcas "em breve" continuam na
  // lista para evitar o colapso em uma única logo repetida após o sync do CRM.
  const source = [...getBrandDirectory()].sort((a, b) => {
    const activeDelta = Number(b.count > 0) - Number(a.count > 0);
    if (activeDelta !== 0) return activeDelta;
    return a.name.localeCompare(b.name, "pt-BR");
  });
  const logos = source
    .map(getBrandVisual)
    .map((b) => ({
      src: b.logo,
      node: b.logo ? undefined : (
        <span className="grid h-9 min-w-14 place-items-center rounded-xl bg-[color:var(--cream)] px-3 font-display text-base font-black uppercase text-navy">
          {b.mark}
        </span>
      ),
      alt: b.name,
      title: b.name,
      href: `/marcas/${b.slug}`,
    }));

  return (
    <section className="border-y border-border bg-secondary/60">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <LogoLoop
          logos={logos}
          speed={28}
          pauseOnHover
          direction="left"
          logoHeight={36}
          gap={56}
          fadeOut
          fadeOutColor="#0F1720"
          scaleOnHover
          draggable
          ariaLabel="Marcas Maxor Sports"
          className="[&_img]:bg-[color:var(--cream)] [&_img]:rounded-xl [&_img]:p-2 [&_img]:box-content"
        />
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
            <img src={monogram} alt="Maxor Sports" className="h-10 w-auto" />
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
