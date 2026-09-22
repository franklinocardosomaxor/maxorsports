# Site mais leve — fotos sob medida, prioridade de carregamento e padrão no cadastro

Escopo aprovado: opções **1, 4 e 7**. Nada é removido: mesmos produtos, todas as
cores, mesmo visual e mesmos efeitos. Muda só **como** as fotos chegam ao cliente.

## Por que o site está pesado

- O acervo tem **2.722 fotos**, somando **1,19 GB**: média de **449 KB por foto**,
  maior com **1,7 MB**. O site entrega a foto original em tamanho cheio mesmo num
  card pequeno de vitrine.
- Com 20% do catálogo cadastrado isso já pesa; no ritmo atual o acervo cresceria
  para vários gigabytes.

## O que será feito

**1. Fotos redimensionadas sob medida**
A mesma foto passa a ser entregue no tamanho certo para cada lugar: miniatura na
busca, média nos cards de vitrine, grande só ao abrir o produto. Formato moderno
(AVIF/WebP) com qualidade visualmente idêntica à atual.
Ganho esperado: **70% a 85% menos peso** nas páginas de vitrine.

**4. Prioridade e reserva de espaço nas imagens**
A primeira imagem visível carrega com prioridade; as demais entram conforme a
pessoa se aproxima delas, com o espaço já reservado — acaba o "pulo" do layout
enquanto a página monta.

**7. Padronização na entrada do cadastro**
Toda foto enviada pelo CRM passa a ser gravada já dentro de um teto de tamanho e
qualidade, para o acervo não crescer mais 1 GB a cada 20% de catálogo novo. As
fotos já cadastradas continuam funcionando normalmente.

## Como vamos conferir o resultado

Medição do peso de `/catalogo`, `/masculino` e de uma página de produto antes e
depois, com contagem de cards mantida igual (nenhuma cor deixa de aparecer).

## Detalhes técnicos

- `src/routes/api/public/crm/image.$.ts` passa a aceitar `?w=` (largura) e a
  negociar formato pelo header `Accept`, devolvendo AVIF/WebP quando suportado,
  mantendo `cache-control: immutable`. A URL atual segue válida sem parâmetros.
  A transformação usa o redimensionador de imagem da borda — a runtime é
  Cloudflare Worker, então `sharp` não é opção no proxy.
- Cards e galerias (`CatalogPage.tsx`, `ProductMiniCard.tsx`, `view-mode.tsx`,
  `Shell.tsx`, `produto.$id.tsx`) passam a usar `srcset`/`sizes` com larguras
  fixas (160/320/640/1024/1600).
- Etapa 4: `fetchpriority="high"` no primeiro card/hero, `loading="lazy"` e
  `decoding="async"` nos demais (já presentes na maioria), mais `width`/`height`
  ou `aspect-ratio` no contêiner da imagem para reservar espaço.
- Etapa 7: teto de dimensão e qualidade no upload em `src/lib/crm-images.server.ts`
  (WebP, lado maior limitado), sem alterar o contrato de retorno
  `/api/public/crm/image/<path>` usado pelo CRM.
- Sem mudanças em regras de catálogo: continua 100% do CRM, todas as variações de
  cor visíveis, tema Navy, sem mocks.
