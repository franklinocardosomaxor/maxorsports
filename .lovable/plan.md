# Redefinir e validar acesso dos dois usuários do MaxorCRM

## Objetivo

Garantir que os dois usuários autorizados do sistema tenham uma senha conhecida pelo proprietário e consigam acessar todo o MaxorCRM:

- franklinocardoso@gmail.com
- maxortecnologia@gmail.com

Por segurança, a senha atual não pode ser consultada no backend; sistemas de autenticação armazenam apenas hash. A correção será feita por redefinição de senha.

## O que será feito

1. Redefinir a senha dos dois usuários para a senha que você confirmar.
2. Validar que os dois e-mails continuam com acesso `admin` e `super_admin` no CRM.
3. Fazer teste real de login no `/admin` e redirecionamento para `/maxorcrm`.
4. Confirmar que o painel abre e que os menus principais aparecem para o usuário autenticado.

## Segurança

- Não vou imprimir senha em logs, scripts ou respostas técnicas.
- Não vou tentar ler senha atual, porque isso não é possível nem correto.
- Não vou alterar layout, catálogo, produtos, permissões fora desses dois usuários, nem mexer no painel além do necessário para validar acesso.

## Detalhes técnicos

- Usar API administrativa de autenticação do backend apenas para atualizar a senha dos usuários existentes.
- Conferir os papéis na tabela de permissões do CRM sem remover nem reestruturar acessos.
- Validar login com navegador automatizado, sem expor a senha no terminal.
