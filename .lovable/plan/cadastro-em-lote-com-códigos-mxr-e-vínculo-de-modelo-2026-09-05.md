# Cadastro em lote com códigos MXR e vínculo de modelo

Ajustar o Cadastro em Lote da Fase 1 do MaxorCRM para acelerar o cadastro de muitos tênis: o cabeçalho (dados, custos, preço, estoque, descrição) continua exatamente como está e serve para todas as cores; embaixo você adiciona quantas cores quiser, cada uma vira um produto próprio.

## O que muda

1. **Código no padrão MXR-####, sempre único**
   - Cada cor recebe um código gerado automaticamente no formato `MXR-2725`.
   - Antes de gravar, o sistema confere quais códigos já existem e sorteia outro se houver repetição — nunca mais aparece erro de "código duplicado" ao adicionar cores de um tênis já cadastrado.
   - O código gerado fica visível no bloco da cor antes de salvar.

2. **Vínculo com um tênis já cadastrado**
   - Em cada cor, um campo de busca opcional permite escolher um tênis já existente no catálogo.
   - O vínculo é apenas referência interna (mesmo modelo no CRM): no site cada cor continua sendo um card separado, como hoje.
   - Ao vincular, marca, categoria, tipo e nome do modelo do produto escolhido são sugeridos para manter o padrão.

3. **Numeração automática por gênero** (confirmando o comportamento atual)
   - Masculino 38–44, Feminino 34–39, Unissex 34–44, Infantil manual.
   - Sempre editável em cada cor.

4. **Etiqueta e exibição fixas**
   - Todo produto criado em lote nasce com selo **Normal** e **visível no site**, sem seletor no formulário. Depois é só editar individualmente se quiser mudar.

## Detalhes técnicos

- `src/components/maxorcrm/Fase1BatchCreate.tsx`:
  - Nova geração de SKU: `MXR-` + 4 dígitos aleatórios; antes do insert, consulta `products.sku` com `in`/`like 'MXR-%'` e regenera colisões; substitui o atual `${prefix}-${index + 1}`.
  - Campo `linkedProductId`/`linkedSku` por variação, alimentado por uma busca em `products` (nome/sku, escopo da org); gravado em `model_group` do produto vinculado? Não — mantém `deriveModelGroup` por cor (card separado) e guarda a referência no texto do modelo/`model_group` interno do CRM sem alterar a lógica de vitrine em `src/lib/catalog.ts`.
  - `tag`/`badge_text` fixos em `Normal`, `site_visible = true`, `status = "published"`; remove o controle correspondente do cabeçalho se ainda existir.
- Sem alterações no site público nem no banco de dados.
- Verificação: `bunx tsgo --noEmit` e os testes de catálogo existentes.
