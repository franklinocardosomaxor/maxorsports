# Corrigir as bolinhas de cor dos produtos

## O que está errado (verificado no banco)

- Em **todos** os produtos visíveis a coluna de cores guarda só o placeholder `#0F1720`. Ou seja, nenhuma bolinha vem de cor cadastrada — todas são adivinhadas a partir do texto da variação (`color_variant`).
- O dicionário atual não conhece boa parte dos termos usados: Ruby, Burgundy, Sage, Cinder, Glacier, Flax, Phantom, Alloy, Obsidian, Crimson, Fuchsia, Maize, Indigo, Ivory, Rose, Mauve, Stucco, Ash, Gunmetal, Anthracite, Flame, Jade, Carmesim, Lima, etc. Esses termos somem, então sobram só 1–2 bolinhas — e as erradas.
  - Exemplo real do print: `White / Burgundy / Gold` → Burgundy é ignorado, restam branco + dourado.
- Frases descritivas quebram o leitor: `Branco com detalhes Azul-Lápis + Pontos Limão` vira apenas branco + limão (o azul se perde) — é exatamente o card "Monstro das Nuvens 2" do print.
- Os cards agrupam variações do mesmo modelo e **misturam as cores de variações diferentes**, então a bolinha pode nem pertencer à foto exibida.

## O que será feito

1. **Bolinhas só da variação exibida.** O card deixa de somar as cores das outras variações do modelo; mostra as cores da variação da foto. As demais continuam acessíveis na página do produto.
2. **Dicionário ampliado** com os termos que realmente aparecem no catálogo (lista acima, em inglês e português, incluindo tons como Ruby, Burgundy, Sage, Cinder, Glacier, Flax, Anthracite, Ivory, Crimson, Fuchsia, Indigo, Jade, Carmesim, Lima, Volt).
3. **Leitura melhor da frase**: separar também por `+`, `com`, `e`, `detalhes`, `pontos`, `sola`, parênteses; ignorar palavras de ligação; manter a ordem das cores como escritas.
4. **Ordem e limite**: a primeira cor citada é a dominante (bolinha maior/primeira), até 4 bolinhas.
5. **Se nenhum termo for reconhecido, nenhuma bolinha aparece** — nunca cor inventada. Tooltip continua mostrando o texto completo da variação.

## Como garantir que fique certo

Depois do ajuste, roda-se uma checagem sobre as ~95 variações existentes listando quais ainda não geram cor; os termos faltantes entram no dicionário até a lista zerar (ou sobrarem só nomes que não são cor, como "Nike Air Zoom G.T. Cut EP", que corretamente não geram bolinha).

## Opcional (recomendado depois)

Campo no cadastro do MaxorCRM para escolher as cores reais da variação (paleta clicável), gravando na coluna `colors`. Aí a bolinha passa a vir do CRM e o dicionário vira só fallback. Faço em seguida, se você quiser.

## Detalhes técnicos

- `src/lib/color-swatches.ts`: ampliar `BASE`, melhorar `strip`/tokenização em `parseColorSwatches` (novos separadores e stopwords), preservar ordem.
- `src/lib/catalog.ts`: em `deriveSwatches`, ignorar `colors` quando só houver placeholder; no agrupamento por modelo (~linha 480) parar de unir `colors` das variações e usar as do representante exibido.
- Consumidores (`view-mode.tsx`, `CatalogPage.tsx`, `ProductMiniCard.tsx`, `produto.$id.tsx`) só recebem a lista já correta — sem mudança de layout.
- Sem migration e sem alteração de dados nesta etapa.
