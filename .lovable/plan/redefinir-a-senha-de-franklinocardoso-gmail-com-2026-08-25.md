# Redefinir a senha de franklinocardoso@gmail.com

## O que vai acontecer

A senha atual não pode ser lida (o backend guarda só o hash). Então vamos **gravar uma nova senha** na conta `franklinocardoso@gmail.com`, que é admin + super_admin do MaxorCRM.

Passos:

1. Gerar uma senha forte e aleatória (16 caracteres, com maiúsculas, minúsculas, números e símbolos).
2. Aplicar essa senha na conta usando a API administrativa de autenticação do backend.
3. Confirmar que o login funciona fazendo um teste real na tela de acesso do CRM (`/maxorcrm`) com o navegador automatizado.
4. Te mostrar a nova senha aqui no chat, uma única vez, para você anotar e trocar depois se quiser.

Nada no site, no layout ou no catálogo é alterado — a mudança afeta apenas a credencial dessa conta.

## Alternativa

Se você preferir escolher a senha em vez de receber uma gerada, é só me dizer qual quer usar (mínimo 8 caracteres) e eu aplico exatamente essa.

## Detalhes técnicos

- Uso de `supabaseAdmin.auth.admin.updateUserById(<uuid>, { password })` executado em contexto de servidor confiável, sem expor a chave de serviço.
- Nenhuma migração de banco, nenhuma alteração de RLS, nenhum papel (`user_roles`) tocado.
- Verificação pós-alteração com Playwright em `http://localhost:8080/maxorcrm`, sem imprimir a senha em logs.
