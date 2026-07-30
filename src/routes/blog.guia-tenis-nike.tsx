import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/site/Shell";

const URL = "https://maxorsports.lovable.app/blog/guia-tenis-nike";

export const Route = createFileRoute("/blog/guia-tenis-nike")({
  component: GuiaTenisNike,
  head: () => ({
    meta: [
      { title: "Tênis Nike de corrida: guia comparativo 2026 | Maxor Sports" },
      {
        name: "description",
        content:
          "Comparativo dos principais tênis Nike de corrida: amortecimento, peso, tipo de pisada e faixa de preço para escolher o modelo certo.",
      },
      { property: "og:title", content: "Tênis Nike de corrida: guia comparativo" },
      {
        property: "og:description",
        content: "Compare modelos Nike de corrida por amortecimento, peso, uso e preço — guia Maxor Sports.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Tênis Nike de corrida: guia comparativo",
          about: "tenis nike, tenis de corrida",
          publisher: { "@type": "Organization", name: "Maxor Sports" },
          mainEntityOfPage: URL,
        }),
      },
    ],
  }),
});

const MODELOS = [
  {
    nome: "Nike Pegasus",
    uso: "Treino diário",
    amort: "Equilibrado (React + Air Zoom)",
    peso: "~280 g",
    faixa: "R$ 600 – R$ 900",
    para: "Quem corre 3 a 5x por semana e quer um único tênis para tudo.",
  },
  {
    nome: "Nike Invincible",
    uso: "Rodagens longas",
    amort: "Máximo (ZoomX)",
    peso: "~300 g",
    faixa: "R$ 900 – R$ 1.400",
    para: "Longões confortáveis e proteção de articulações.",
  },
  {
    nome: "Nike Vomero",
    uso: "Conforto no dia a dia",
    amort: "Alto e macio",
    peso: "~300 g",
    faixa: "R$ 700 – R$ 1.100",
    para: "Corredores mais pesados ou que priorizam amortecimento.",
  },
  {
    nome: "Nike Vaporfly / Alphafly",
    uso: "Prova e ritmo forte",
    amort: "ZoomX + placa de carbono",
    peso: "~200 g",
    faixa: "R$ 1.800 +",
    para: "Buscar recorde pessoal em 10k, 21k e maratona.",
  },
  {
    nome: "Nike Revolution",
    uso: "Início na corrida",
    amort: "Simples, espuma leve",
    peso: "~250 g",
    faixa: "R$ 300 – R$ 500",
    para: "Quem está começando e quer custo-benefício.",
  },
];

function GuiaTenisNike() {
  return (
    <Shell active="Masculino">
      <article className="mx-auto max-w-4xl px-4 py-12">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-[color:var(--lime-brand)]">
          Guia Maxor
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold uppercase text-offwhite md:text-5xl">
          Tênis Nike de corrida: qual modelo escolher
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-offwhite/70 md:text-base">
          Escolher entre os tênis Nike de corrida fica simples quando você parte de três perguntas: quantos
          quilômetros você roda por semana, qual o seu peso e se o objetivo é conforto ou velocidade. Abaixo
          comparamos os principais modelos por amortecimento, peso, uso e faixa de preço praticada no Brasil.
        </p>

        <h2 className="mt-10 font-display text-2xl font-bold uppercase text-offwhite">Comparativo rápido</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[720px] text-left text-sm text-offwhite/80">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-offwhite">
              <tr>
                <th className="px-4 py-3">Modelo</th>
                <th className="px-4 py-3">Uso ideal</th>
                <th className="px-4 py-3">Amortecimento</th>
                <th className="px-4 py-3">Peso aprox.</th>
                <th className="px-4 py-3">Faixa de preço</th>
              </tr>
            </thead>
            <tbody>
              {MODELOS.map((m) => (
                <tr key={m.nome} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold text-offwhite">{m.nome}</td>
                  <td className="px-4 py-3">{m.uso}</td>
                  <td className="px-4 py-3">{m.amort}</td>
                  <td className="px-4 py-3">{m.peso}</td>
                  <td className="px-4 py-3">{m.faixa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 font-display text-2xl font-bold uppercase text-offwhite">
          Para quem cada tênis faz sentido
        </h2>
        <ul className="mt-4 space-y-3">
          {MODELOS.map((m) => (
            <li key={m.nome} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-offwhite/80">
              <strong className="text-offwhite">{m.nome}:</strong> {m.para}
            </li>
          ))}
        </ul>

        <h2 className="mt-10 font-display text-2xl font-bold uppercase text-offwhite">Como acertar o tamanho</h2>
        <p className="mt-3 text-sm leading-relaxed text-offwhite/70">
          Em corrida, deixe cerca de um centímetro entre o dedo maior e a ponta do tênis — o pé incha ao longo do
          treino. Se você usa 41 no casual Nike, normalmente mantém 41 nos modelos de corrida; nas linhas de prova
          (Vaporfly e Alphafly) o ajuste é mais justo.
        </p>

        <div className="mt-10 rounded-2xl border border-[color:var(--cyan-brand)]/40 bg-white/5 p-6">
          <h2 className="font-display text-xl font-bold uppercase text-offwhite">
            Encontre o seu Nike na Maxor Sports
          </h2>
          <p className="mt-2 text-sm text-offwhite/70">
            Temos curadoria de Nike e outras marcas com atendimento direto no WhatsApp e pagamento via PIX ou cartão.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/marcas/$brand"
              params={{ brand: "nike" }}
              className="rounded-full bg-[color:var(--cyan-brand)] px-6 py-3 text-xs font-bold uppercase tracking-widest text-navy hover:brightness-110"
            >
              Ver tênis Nike
            </Link>
            <Link
              to="/lancamentos"
              className="rounded-full border border-white/20 px-6 py-3 text-xs font-bold uppercase tracking-widest text-offwhite hover:bg-white/10"
            >
              Lançamentos
            </Link>
          </div>
        </div>
      </article>
    </Shell>
  );
}
