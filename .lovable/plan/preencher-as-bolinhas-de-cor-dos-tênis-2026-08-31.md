# Preencher as bolinhas de cor dos tênis

## O que está acontecendo (verificado no banco)

Dos 81 produtos visíveis, todos têm o campo de cores preenchido — mas o conteúdo não é cor de verdade:

- A maioria guarda o valor genérico `#0F1720` (o próprio Navy do fundo), então a bolinha aparece como um ponto escuro invisível.
- Alguns guardam texto, ex.: `Rosa Claro / Rosa Escuro`, `Verde Claro / Limão / Cinza Escuro`. Como o site usa esse texto direto como cor CSS, a bolinha fica vazia/transparente.
- O campo `color_variant` (nome da cor da variação) está preenchido em 80 de 81 produtos e é confiável.

Ou seja: dá para preencher, sem precisar recadastrar produto nenhum.

## O que será feito

1. **Dicionário de cores em português** — um mapa único (Preto, Branco, Cinza, Prata, Bege, Marrom, Vermelho, Rosa, Laranja, Amarelo, Limão/Volt, Verde, Azul, Azul Marinho, Roxo/Lavanda, Dourado, Gum, Off-White, etc., com variações "claro/escuro") convertendo nome em cor real.
2. **Derivar as bolinhas do `color_variant`** — "Verde Claro / Limão / Cinza Escuro" vira três bolinhas reais. Quando a cor cadastrada já for um hex válido e diferente do placeholder Navy, ele é respeitado.
3. **Bolinhas multicoloridas** — quando a variação tiver 2 ou 3 cores, a bolinha da vitrine mostra as cores em faixas, e no card de produto cada cor aparece como um ponto separado (limite atual de 4–5 pontos mantido).
4. **Sem cor reconhecível → sem bolinha** — se o nome não casar com nada do dicionário, nada é exibido em vez de um ponto vazio. Nada de cor inventada.
5. **Tooltip com o nome** — passar o mouse (ou tocar) mostra o nome da variação, ex. "Rosa Claro / Rosa Escuro".

Aplicado nos mesmos lugares onde as bolinhas já existem hoje: vitrine/cards, catálogo, modos de visualização (lista/ícones) e página do produto.

## Detalhes técnicos

- Novo módulo `src/lib/color-swatches.ts` com `parseColorSwatches(colorVariantOrColors): string[]` (nomes pt-BR → hex, normalização sem acento, tratamento de modificadores claro/escuro).
- `src/lib/catalog.ts`: no mapeamento do produto, quando `colors` for vazio, placeholder `#0F1720` ou texto, derivar de `colorVariant` via `parseColorSwatches`. Agrupamento por modelo continua igual.
- Consumidores ajustados apenas na apresentação: `src/components/site/view-mode.tsx`, `src/components/site/CatalogPage.tsx`, `src/components/site/ProductMiniCard.tsx`, `src/routes/produto.$id.tsx`.
- Sem migration, sem alteração no CRM, sem mudança no fluxo de dados ou no layout.

## Alternativa, se preferir

Remover totalmente as bolinhas de cor dos cards e manter só a lista de variações na página do produto. É uma alteração menor, mas perde a leitura rápida de cores na vitrine.
