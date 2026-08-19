# MaxorCRM dentro do site — estrutura base e migração do Antigravity

Criar o diretório `maxorcrm` no site Maxor Sports, com menu de três fases, pronto para
receber os comandos de migração do Antigravity que você vai enviar em seguida.

## Estado atual (verificado)

- Já existe `/admin` (login) e `/admin/crm` (painel resumido com contagem de contatos e negócios).
- O backend já tem todo o schema do CRM: `organizations`, `pipelines`, `stages`, `contacts`,
  `deals`, `activities`, `products`, `user_roles`, com RLS por organização e papel.
- Os super-admins `maxortecnologia@gmail.com` e `franklinocardoso@gmail.com` já recebem o papel
  `super_admin` automaticamente via trigger no banco.
- Nesta sessão já foram criados dois arquivos de esqueleto (`src/routes/maxorcrm/route.tsx` e
  `src/routes/maxorcrm/index.tsx`) com o layout Navy, a trava de acesso e o menu de três fases.
  Eles servem de base e serão ajustados conforme os comandos que você enviar.

## O que fica pronto agora

1. **Rota `/maxorcrm`** com layout próprio em Navy (#0F1720), cabeçalho MaxorCRM, identificação do
   usuário logado e botão sair. Sem SSR, como o restante da área administrativa.
2. **Trava de acesso**: somente os dois e-mails super-admin entram. Qualquer outro usuário vê
   "Acesso negado"; quem não está logado vai para o login administrativo.
3. **Menu de três fases** no topo, com destaque na fase ativa:
   - Fase 1 · Catálogo
   - Fase 2 · Comercial
   - Fase 3 · Operação
   Os nomes são provisórios — você redefine cada fase nos próximos comandos.
4. **Página inicial do MaxorCRM** com três cartões (um por fase) mostrando contadores reais do
   banco: produtos publicados, contatos, negócios e atividades.
5. **Três páginas de fase** criadas vazias, cada uma com seu próprio título e descrição, prontas
   para receber os módulos migrados do Antigravity conforme seus comandos.

## O que fica aguardando seus comandos

A migração completa do Antigravity (telas, regras e fluxos de cada fase) só entra depois que você
enviar o conteúdo de cada fase. Nada do layout ou das regras do site público é alterado.

## Detalhes técnicos

- Arquivos: `src/routes/maxorcrm/route.tsx` (layout + gate), `src/routes/maxorcrm/index.tsx`
  (visão geral), `src/routes/maxorcrm/fase-1.tsx`, `fase-2.tsx`, `fase-3.tsx`.
- Leitura de dados pelo cliente Supabase do browser, com RLS aplicando como o usuário logado —
  nenhuma consulta com chave de serviço no navegador.
- `head()` com `robots: noindex, nofollow` em todas as rotas do MaxorCRM.
- Componentes reutilizáveis que surgirem na migração vão para `src/maxor-kit/`, mantendo a
  sincronia com o CRM.
- Nenhuma mudança de schema é necessária nesta etapa.
