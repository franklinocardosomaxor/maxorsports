# Plano cirúrgico — corrigir agrupamento de modelos sem quebrar outras áreas

## Diagnóstico confirmado

- A página de produto busca as variantes no servidor e só agrupa quando `productModelKey(product)` é exatamente igual.
- Hoje a chave é `marca + model_group` normalizado. Se o CRM salvar `model_group` levemente diferente, o mesmo tênis vira grupos separados.
- No banco atual isso já acontece: os produtos Nike Air Zoom G.T. Cut aparecem divididos entre `Nike Air Zoom G.T. Cut` e `Nike Air Zoom G.T`, então uma variação fica fora do grupo.
- O Nike Air Zoom Vomero 17 está com 3 linhas no mesmo `model_group`, então esse caso deve continuar funcionando.

## O que vou corrigir

1. **Criar uma chave canônica de agrupamento no catálogo**
   - Centralizar em uma função única a lógica de “qual é o mesmo modelo”.
   - Usar `model_group` quando ele for confiável.
   - Quando o `model_group` vier curto, genérico ou inconsistente, derivar a chave pelo nome do produto e pela cor.
   - Normalizar diferenças comuns sem colapsar modelos diferentes:
     - marca no começo do nome;
     - pontuação e espaços;
     - sufixos de versão/canal como `EP`, `W`, `Premium` quando forem acessórios do mesmo modelo;
     - cores no final do nome;
     - variações como `VI` e `6` quando forem o mesmo número de modelo.

2. **Aplicar a mesma chave em todos os pontos de exibição**
   - Cards das vitrines/listagens continuarão mostrando 1 card por modelo.
   - Página do produto passará a buscar as variantes pela mesma chave canônica.
   - `getVariants`, `groupProductsByModel` e o loader server-side da PDP usarão a mesma regra, sem duplicar lógica.

3. **Preservar o cadastro e a foto principal**
   - Não vou mexer em acessos, senhas, permissões, financeiro ou navegação do CRM.
   - Não vou remover nem alterar o botão/fluxo de “Marcar principal”.
   - O campo “Modelo Agrupado” continuará existindo, mas a vitrine não ficará refém de pequenas diferenças digitadas nele.

4. **Adicionar proteção contra regressão**
   - Criar/ajustar testes com os casos reais encontrados:
     - Vomero 17 agrupa 3 variações.
     - Air Zoom G.T. Cut agrupa mesmo quando uma linha veio como `Nike Air Zoom G.T`.
     - Vomero 17 não agrupa com Vomero 19.
     - Kobe/Zoom Fly/Mind não colapsam tudo em “Nike”.

5. **Validar visualmente depois**
   - Abrir uma PDP real, como `/produto/MXR-2722`, e confirmar que as cores aparecem juntas.
   - Abrir uma listagem, como `/catalogo` ou `/masculino`, e confirmar que o card agrupado não duplica o mesmo modelo.
   - Verificar console para garantir que a correção não introduziu erro de renderização.

## Arquivos previstos

- `src/lib/catalog.ts` — regra única/canônica de agrupamento.
- `src/lib/product-page.server.ts` — usar a mesma regra da vitrine na busca server-side.
- `src/lib/catalog.brand-visibility.test.ts` ou novo teste de catálogo — cobrir os casos reais de agrupamento.

## Fora do escopo desta correção

- Não alterar layout geral do site.
- Não alterar senha, acesso, painel, financeiro ou permissões do CRM.
- Não limpar, recriar ou inventar produtos.
- Não alterar checkout, PIX, WhatsApp ou favoritos.
