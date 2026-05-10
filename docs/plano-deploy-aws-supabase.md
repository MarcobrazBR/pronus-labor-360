# Plano de Deploy - AWS + Supabase

Data: 2026-05-10

## Objetivo

Organizar o PRONUS LABOR 360 para uma primeira publicacao externa, mantendo o monorepo atual e preparando a separacao clara entre frontends, servicos de backend, banco, autenticacao, storage e segredos.

## Decisao de arquitetura para homologacao

### Frontend na AWS

Os quatro portais devem ser publicados separadamente:

- Portal PRONUS Operacoes: `apps/web-pronus`
- Portal RH Cliente: `apps/web-client`
- Portal Colaborador: `apps/web-employee`
- Portal Profissional de Saude: `apps/web-clinician`

Recomendacao inicial:

- usar AWS Amplify Hosting para os quatro apps Next.js, por reduzir esforco de deploy e manter suporte a rotas do Next;
- configurar um app Amplify por portal, todos apontando para o mesmo repositorio e com build filtrado por workspace;
- usar subdominios separados, por exemplo:
  - `operacao.pronuslabor.com.br`
  - `rh.pronuslabor.com.br`
  - `cliente.pronuslabor.com.br`
  - `profissional.pronuslabor.com.br`

Alternativa futura:

- S3 + CloudFront apenas se os portais forem convertidos para export estatico.

### Supabase como backend gerenciado

O Supabase deve concentrar:

- PostgreSQL;
- Auth;
- Storage de documentos, imagens e anexos;
- Row Level Security;
- logs e tabelas de auditoria;
- possiveis Edge Functions para rotinas pequenas.

Ponto tecnico importante:

O Supabase nao hospeda uma API NestJS tradicional como a atual `apps/api`. Se mantivermos NestJS para regras reguladoras, auditoria complexa, integracoes e eSocial, essa API precisa ser hospedada em um runtime proprio, como AWS App Runner, ECS/Fargate ou Lambda. O caminho mais seguro para o MVP e:

- AWS hospeda os quatro frontends;
- Supabase hospeda banco/auth/storage;
- API NestJS continua como camada de negocio e pode ser publicada na AWS App Runner;
- com o amadurecimento, rotinas pequenas podem migrar para Supabase Edge Functions quando fizer sentido.

## Variaveis de ambiente

Cada portal precisa receber apenas variaveis publicas:

```text
NEXT_PUBLIC_API_URL=https://api.pronuslabor.com.br
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

A API deve receber segredos somente no ambiente do backend:

```text
DATABASE_URL=postgresql://...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET_DOCUMENTS=documents
SUPABASE_STORAGE_BUCKET_CLINICAL=clinical-records
OPENAI_API_KEY=...
ALLOWED_ORIGINS=https://operacao.pronuslabor.com.br,https://rh.pronuslabor.com.br,https://cliente.pronuslabor.com.br,https://profissional.pronuslabor.com.br
```

Regras:

- chave `service_role` nunca deve ir para frontend;
- dados clinicos e psicossociais individuais devem passar por API com permissao e auditoria;
- anexos sensiveis devem usar URLs assinadas temporarias;
- ambientes `dev`, `homolog` e `prod` devem ter projetos Supabase separados.

## Organizacao recomendada do monorepo

Manter a estrutura atual:

```text
apps/
  api/
  web-pronus/
  web-client/
  web-employee/
  web-clinician/
packages/
  config/
  database/
  types/
  ui/
  validations/
docs/
```

E evoluir com estes contratos:

- `packages/types`: tipos compartilhados de prontuario, agenda, pagamentos, empresas e usuarios;
- `packages/validations`: CPF, CNPJ, CBO, datas, regras de senha e filtros;
- `packages/config`: URLs, flags de ambiente e nomes de portais;
- `packages/database`: schema Prisma, migrations e seeds;
- `apps/api`: regras de negocio, permissoes, logs e integracoes.

## Modulos sensiveis para preparar antes de producao

### Prontuario Integrado

Separar tabelas e permissoes para:

- dados ocupacionais administrativos;
- registros clinicos medicos;
- registros psicologicos;
- registros nutricionais;
- anexos;
- assinaturas digitais;
- logs de acesso;
- logs de alteracao;
- alertas gerados pelo sistema.

### Audio e IA

Fluxo recomendado:

1. Audio gravado em storage temporario e privado.
2. API registra evento de gravacao.
3. Job de transcricao processa o audio.
4. Transcricao entra como rascunho de anamnese.
5. Profissional revisa e assina/finaliza.
6. Audio pode seguir politica de retencao definida pela PRONUS.

### Resumo GPT 5 horas antes

Fluxo recomendado:

1. Job agenda consultas futuras.
2. Cinco horas antes, busca eventos permitidos do prontuario.
3. Remove dados nao autorizados para o perfil.
4. Gera resumo com IA.
5. Salva resumo, prompt, versao do modelo, data/hora e origem dos dados.
6. Exibe no Portal Profissional com log de acesso.

## Checklist para primeira homologacao externa

- Criar projeto Supabase de homologacao.
- Configurar migrations Prisma.
- Criar buckets privados.
- Definir RLS por empresa e perfil.
- Publicar API em runtime seguro.
- Publicar quatro portais na AWS.
- Configurar dominios e HTTPS.
- Configurar `ALLOWED_ORIGINS`.
- Remover dados demonstrativos sensiveis.
- Criar usuarios de teste por perfil.
- Ativar logs de acesso a prontuario.
- Revisar textos e screenshots antes da apresentacao.

## Risco tecnico a acompanhar

O maior cuidado e nao tratar o Supabase como simples banco aberto para o frontend. Para o PRONUS LABOR 360, dados de prontuario, psicossocial individual, anexos clinicos, reset de senha, pagamentos e auditoria precisam de uma camada de regra de negocio com permissao, log e controle de sigilo.
