# Deixar o site mais leve — sem tirar nada nem perder qualidade

Nada é removido: mesmos produtos, mesmas cores, mesmo visual e mesmos efeitos.
O que muda é **como** as fotos e os dados chegam ao navegador.

## O que a auditoria mostrou

- Há **2.722 fotos** guardadas, somando **1,19 GB**. A média é de **449 KB por foto**
  e a maior tem **1,7 MB**. O site entrega a foto original em tamanho cheio até
  numa listinha de 200 pixels — é daqui que vem quase todo o peso.
- Toda foto passa pelo nosso servidor antes de chegar ao cliente, o que adiciona
  atraso em cada imagem da página.
- Ao abrir qualquer página, o site baixa de uma vez a ficha completa de **todos**
  os produtos publicados (incluindo descrição e a lista inteira de fotos de cada
  um). Hoje com 20% do catálogo já pesa; com 100% fica cinco vezes maior.
- O efeito de fundo animado do cursor é o maior arquivo de código do site (36 KB)
  e roda animação contínua — pesa mais no celular.

## Opções (da que mais alivia para a que menos alivia)

**1. Fotos redimensionadas sob medida (maior ganho, recomendada)**
O mesmo arquivo passa a ser entregue no tamanho certo para cada lugar: miniatura
na vitrine, média na listagem, grande só quando a pessoa abre a foto do produto.
Formato moderno (WebP/AVIF) com qualidade visualmente idêntica.
Ganho esperado: **70% a 85% menos peso** nas páginas de vitrine.

**2. Carregar a vitrine em partes**
A página mostra os primeiros cards imediatamente e vai carregando o restante
conforme a pessoa rola. Nenhum produto some — só deixa de vir tudo de uma vez.

**3. Buscar do banco só o que a vitrine precisa**
A lista pede apenas nome, preço, marca, cor e a foto de capa. Descrição e galeria
completa só são buscadas ao abrir o produto.

**4. Prioridade e reserva de espaço nas imagens**
A primeira imagem visível carrega com prioridade; as demais só quando se aproximam
da tela, com o espaço já reservado (acaba o "pulo" do layout).

**5. Efeitos visuais mais leves no celular**
Mantém o cursor animado e a aurora no computador; no celular eles entram só depois
que a página já está pronta (ou ficam desligados em aparelhos fracos). Visual
idêntico onde importa.

**6. Cache de verdade**
Fotos e catálogo passam a ficar guardados no navegador e na borda da rede, então a
segunda visita (e a navegação entre páginas) fica quase instantânea.

**7. Compressão na entrada do cadastro**
Foto enviada pelo CRM já é padronizada num teto de tamanho, para o acervo não
crescer mais 1 GB a cada 20% de catálogo novo.

Sugestão de execução: **1 + 4 + 6** primeiro (maior ganho, menor risco), depois
**2 + 3**, e por fim **5 + 7**.

## Detalhes técnicos

- Origem do peso: `storage.objects` do bucket `product-images` (2.722 objetos,
  1,19 GB, média 449 KB) servidos crus por `src/routes/api/public/crm/image.$.ts`,
  que hoje só repassa bytes com `cache-control: immutable`.
- Etapa 1: aceitar parâmetros `?w=` e `?fmt=` no proxy, negociar AVIF/WebP pelo
  header `Accept` e gerar variantes com o redimensionador da borda (a runtime é
  Cloudflare Worker — `sharp` não roda lá). Mantém a URL atual funcionando.
  Cards passam a usar `srcset`/`sizes`.
- Etapa 4: `fetchpriority="high"` + `width`/`height` (ou `aspect-ratio`) nos cards;
  `loading="lazy"`/`decoding="async"` já existem na maioria dos componentes.
- Etapa 3: `fetchDbProducts` em `src/lib/crm-db-catalog.ts` seleciona 26 colunas de
  todos os produtos publicados; separar em consulta de vitrine (colunas enxutas)
  e consulta de detalhe por SKU, mantendo `setCrmProducts` e as regras de gating
  de `src/lib/catalog.ts` intactas.
- Etapa 2: paginação/virtualização incremental em `CatalogPage.tsx` sem mudar as
  regras de exibição (todas as cores continuam listadas).
- Etapa 5: `SplashCursor` (36 KB) e `Aurora` já são `lazy`; adicionar gate por
  largura de tela e `prefers-reduced-motion`, montando após `requestIdleCallback`.
- Etapa 7: teto de dimensão/qualidade no upload em `src/lib/crm-images.server.ts`.
- Regras preservadas: catálogo 100% vindo do CRM, todas as variações de cor
  visíveis, tema Navy, sem mocks.
