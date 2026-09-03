# Cadastro em lote: um produto por cor, sem agrupar

Ajustar o Cadastro em Lote da Fase 1 para que ele funcione como um acelerador de digitação: os dados comuns (nome, custos, margem, estoque, descrição) são digitados uma vez e cada cor enviada vira um produto independente, com suas próprias imagens e gênero.

## O que muda

1. **Cada cor vira um card separado no site**
   - Hoje o lote vincula todas as cores no mesmo modelo, e a vitrine mostra um card só.
   - Passa a gerar um agrupamento próprio por cor (ex.: "Air Max Liquid Cinza Masculino"), então "Cinza Masculino" e "Pink Feminino" aparecem como dois produtos distintos em todas as vitrines.

2. **Numeração automática por gênero**
   - Masculino: 38 a 44
   - Feminino: 34 a 39
   - Unissex: 34 a 44
   - Infantil: campos manuais (o valor digitado no bloco comum é usado)
   - Cada bloco de cor mostra a grade aplicada e permite sobrescrever manualmente quando necessário.

3. **Selo sempre "Normal" no lote**
   - O seletor de selo sai do formulário em lote; todo produto criado nasce como Normal e pode ser trocado depois na edição individual.

4. **Vale para qualquer tipo de produto** — tênis, blusas, camisas, chuteiras: a regra é a mesma, o que muda é só a grade quando o gênero é infantil ou quando você digita manualmente.

## Nome e código gerados

Para cada cor: nome `Modelo - Cor` (ex.: "Air Max Liquid - Cinza"), SKU `prefixo-cor`, gênero e seção conforme o bloco da cor, imagens só daquela cor, e todos os custos/preço herdados do bloco comum.

## Detalhes técnicos

- `src/components/maxorcrm/Fase1BatchCreate.tsx`:
  - `model_group` deixa de ser compartilhado: passa a ser derivado por variação (`deriveModelGroup(nome + cor + gênero)`), garantindo `productModelKey` distinto por cor em `src/lib/catalog.ts` sem tocar na lógica do site.
  - Nova constante `GRADE_POR_GENERO` (masculino 38-44, feminino 34-39, unissex 34-44) aplicada em `num_cal_min`/`num_cal_max` por variação; infantil e sobrescritas usam os campos manuais.
  - Campo de selo removido do bloco comum; `tag` fixo em `Normal` no insert.
  - Campos de numeração por variação (pré-preenchidos pela grade, editáveis).
- Verificação: `bunx tsgo --noEmit` e os testes de catálogo existentes.
