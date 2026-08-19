# Migração da Fase 1 do MaxorCRM (Catálogo e Estoque)

Migrar o módulo de gestão de estoque e produtos do Antigravity para o novo diretório `maxorcrm/fase-1`, adaptando para o Dark Theme Navy do site e atualizando o banco de dados.

## Estado atual (verificado)

- O site público está operacional em `src/routes/index.tsx`.
- O painel `/maxorcrm` já possui rotas base para as três fases, mas a `fase-1.tsx` é apenas um esqueleto.
- A tabela `public.products` no banco de dados ainda não possui colunas específicas do CRM (como `name_prod`, `marca_prod`, `qtde_est`, etc.) exigidas pelo novo módulo.

## O que será feito

### 1. Infraestrutura de Banco de Dados (Supabase)
Criar uma migration para estender a tabela `public.products` com as colunas necessárias para o CRM, garantindo compatibilidade com o script de schema fornecido:
- Adicionar colunas de dados do produto: `id_produto`, `name_prod`, `marca_prod`, `categoria_prod`, `tipo_prod`, `genero`, `valor_dec`, `discount_price`, `num_cal_min`, `num_cal_max`, `qtde_est`, `vender_sem_estoque`, `badge_text`, `status`, `foto_principal`, `imagens` (JSONB), `descricao`, `slug`.
- Garantir que as políticas de RLS e triggers de `updated_at` permaneçam funcionais.

### 2. Implementação da Fase 1 (Catálogo)
Transformar `src/routes/maxorcrm/fase-1.tsx` em um centro de comando completo para produtos:
- **Interface Dark Navy**: Adaptar o componente `StockPageLovable` para usar os tokens de cores do projeto (#0F1720, Cyan, Mint, Lime).
- **Gestão de Produtos**: Implementar a listagem, busca e edição de produtos usando o cliente Supabase integrado do projeto.
- **Formulário Inteligente**: Incluir os blocos A (Dados), B (Preços), C (Estoque) e D (Exposição E-commerce v1.4) com as lógicas de cálculo de margem e preço.
- **Galeria de Mídia**: Suporte para upload de fotos físicas via Base64 (conforme o modelo Antigravity).
- **Visibilidade Independente**: Integrar as regras de `site_visible` e `brand_visible`.

### 3. Integração e Segurança
- Garantir que a `src/maxor-kit/` seja utilizada para componentes compartilhados quando aplicável.
- Reforçar que apenas os super-admins (`maxortecnologia@gmail.com` e `franklinocardoso@gmail.com`) acessem esta fase.

## Detalhes técnicos
- Conversão do código React (.jsx) fornecido para TypeScript (.tsx).
- Uso do hook `useCatalogVersion` para invalidar caches quando o estoque mudar.
- Nenhuma alteração no layout do site público (`/`).
