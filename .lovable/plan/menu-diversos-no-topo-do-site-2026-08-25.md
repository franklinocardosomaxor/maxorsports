# Menu Diversos no topo do site

## Objetivo
Inserir um novo item de navegação **"Diversos"** no menu principal, posicionado **antes de "Maxor CRM"", com submenu contendo **Roupas**, **Acessórios** e **Eletrônico**.

## O que será feito

1. **Atualizar `src/components/site/Shell.tsx`**
   - Adicionar entrada `"Diversos"` no array `NAV`, logo antes de `"Maxor CRM"`.
   - Configurar submenu estático com:
     - Roupas → `/roupas` (rota existente)
     - Acessórios → `/acessorios` (nova rota)
     - Eletrônico → `/eletronicos` (nova rota)
   - O dropdown já existe no `MegaNav`; basta alimentar o novo item com `items`.

2. **Criar rota `/acessorios.tsx`**
   - Página de listagem usando `CatalogPage` ou estrutura equivalente.
   - Filtrar produtos do CRM pela categoria "Acessórios" via `getCategoryProducts`.
   - Head próprio com título, descrição, OG e canonical.
   - Se não houver produtos cadastrados no CRM, exibir mensagem discreta "Em breve".

3. **Criar rota `/eletronicos.tsx`**
   - Mesma estrutura de `/acessorios`, filtrando pela categoria "Eletrônico".
   - Head próprio com metadados únicos.

4. **Atualizar `src/routes/sitemap[.]xml.ts`**
   - Incluir `/acessorios` e `/eletronicos` no sitemap, se a geração for manual.

5. **Ajustar footer em `Shell.tsx`**
   - Adicionar links de "Acessórios" e "Eletrônico" na coluna "Categorias", mantendo consistência.

## Fora de escopo
- Não alterar o painel `/maxorcrm`, regras de acesso, catálogo ou cadastro de produtos.
- Não criar novas tabelas no banco; as páginas usam a categoria já existente em `public.products`.
- Não modificar a rota `/roupas` existente.

## Validação
- Verificar no preview que o menu "Diversos" aparece antes de "Maxor CRM".
- Confirmar que o dropdown exibe Roupas, Acessórios e Eletrônico.
- Confirmar que os links levam às páginas corretas e mantêm o tema Navy sem áreas brancas.
