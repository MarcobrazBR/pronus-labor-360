# Guia de publicacao - Supabase + AWS Free Tier

Data: 2026-05-13

Este guia foi escrito para publicar o PRONUS LABOR 360 com o menor custo inicial possivel e com controle para desligar tudo depois de uma apresentacao.

## Visao importante antes de comecar

O projeto tem quatro frontends Next.js e uma API NestJS:

- `apps/web-pronus` - Portal PRONUS Operacoes
- `apps/web-client` - Portal RH
- `apps/web-employee` - Portal Cliente
- `apps/web-clinician` - Portal Profissional de Saude
- `apps/api` - API de negocio

Supabase nao hospeda uma API NestJS tradicional. No PRONUS, "subir o backend no Supabase" significa usar o Supabase para PostgreSQL, Auth, Storage, RLS e rotinas pequenas em Edge Functions. Enquanto a API NestJS nao for migrada para Edge Functions, ela ainda precisa de um runtime proprio, como AWS Lambda, AWS App Runner, ECS/Fargate ou outro provedor.

Para custo zero no inicio, a recomendacao e:

1. Supabase Free para banco, storage e auth.
2. AWS Amplify no Free Tier para os quatro frontends.
3. API NestJS local ou em runtime gratuito/creditado durante a fase de demonstracao externa.
4. Migrar gradualmente endpoints criticos para Supabase/Prisma persistente e, se fizer sentido, Edge Functions.

Atencao sobre Next.js:

- Em 13/05/2026, a documentacao da AWS Amplify informa suporte gerenciado a Next.js SSR ate Next.js 15.
- O monorepo PRONUS esta usando Next.js 16.
- Antes de publicar em AWS Amplify, precisamos fazer um teste de deploy real ou fixar os portais em Next.js 15, caso a AWS ainda nao tenha liberado suporte oficial a Next.js 16.
- Se o Amplify recusar Next.js 16, nao force deploy em producao: primeiro ajustamos a versao ou escolhemos outro runtime AWS para os frontends.

Referencias oficiais:

- Supabase Free: https://supabase.com/pricing
- AWS Amplify Pricing: https://aws.amazon.com/amplify/pricing/
- AWS Amplify com Next.js SSR: https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html
- AWS Free Tier: https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-plans.html
- AWS Budgets: https://aws.amazon.com/aws-cost-management/aws-budgets/pricing/

## Parte 1 - Preparar o projeto local

1. Abra o PowerShell.
2. Entre na pasta do projeto:

```powershell
cd "C:\Users\Marco\Documents\GitHub\Pronus Labor 360"
```

3. Confirme que o projeto compila localmente:

```powershell
pnpm -r --workspace-concurrency=1 typecheck
pnpm build
```

4. Confirme que existe `.env.example`.
5. Copie o arquivo para `.env` quando for testar com Supabase:

```powershell
copy .env.example .env
```

6. Nunca envie `.env` para o GitHub. Ele deve ficar apenas na sua maquina ou nos paineis da AWS/Supabase.

## Parte 2 - Criar o backend gerenciado no Supabase

1. Acesse https://supabase.com.
2. Crie sua conta.
3. No painel, clique em `New project`.
4. Escolha o plano Free.
5. Defina:
   - Organization: `Pronus Labor`
   - Project name: `pronus-labor-homolog`
   - Database password: crie uma senha forte e guarde em cofre de senhas.
   - Region: escolha a regiao mais proxima disponivel do publico de teste.
6. Aguarde o projeto finalizar a criacao.
7. No menu `Project Settings > API`, copie:
   - Project URL
   - anon public key
   - service_role key
8. No menu `Project Settings > Database`, copie:
   - Connection string Pooler, para `DATABASE_URL`
   - Connection string Direct, para `DIRECT_URL`

No arquivo `.env`, preencha:

```text
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

Atencao:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` pode ir para os frontends.
- `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` e `DIRECT_URL` nunca podem ir para frontend.

## Parte 3 - Criar buckets privados no Supabase

1. No Supabase, abra `Storage`.
2. Clique em `New bucket`.
3. Crie o bucket `documents`.
4. Deixe como privado.
5. Crie o bucket `clinical-records`.
6. Deixe como privado.

Uso esperado:

- `documents`: documentos ocupacionais, relatorios, PGR, PCMSO, anexos administrativos.
- `clinical-records`: anexos de prontuario, transcricoes, documentos clinicos e materiais sensiveis.

## Parte 4 - Rodar migrations Prisma no Supabase

1. Garanta que `.env` esta preenchido.
2. Rode:

```powershell
pnpm db:generate
pnpm db:migrate
```

3. Se der erro de conexao:
   - revise a senha do banco;
   - confira se `DATABASE_URL` esta usando a URL do pooler;
   - confira se `DIRECT_URL` esta usando a conexao direta;
   - veja se a senha tem caracteres especiais que precisam de URL encode.

4. Abra o Supabase em `Table Editor` e confirme se as tabelas foram criadas.

## Parte 5 - Publicar os frontends na AWS Amplify

Antes de criar qualquer recurso:

1. Crie uma conta AWS escolhendo `Free account plan`, quando disponivel.
2. Acesse `Billing and Cost Management`.
3. Crie um budget em `AWS Budgets` com alerta por e-mail.
4. Evite ativar WAF, bancos AWS, maquinas EC2 ou recursos pagos nesta fase.

Para cada portal, repita o processo abaixo.

### Portal Operacoes

1. Acesse o AWS Console.
2. Abra `AWS Amplify`.
3. Clique em `Create new app`.
4. Escolha GitHub.
5. Conecte o repositorio `Pronus Labor 360`.
6. Escolha branch `main`.
7. Em build settings, use:

```yaml
version: 1
applications:
  - appRoot: apps/web-pronus
    frontend:
      phases:
        preBuild:
          commands:
            - corepack enable
            - pnpm install --frozen-lockfile
        build:
          commands:
            - pnpm --filter @pronus/web-pronus build
      artifacts:
        baseDirectory: .next
        files:
          - "**/*"
      cache:
        paths:
          - ../../node_modules/.pnpm/**/*
          - .next/cache/**/*
```

8. Em environment variables, coloque:

```text
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com.br
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_ENABLE_DEMO_FALLBACK=false
```

9. Clique em `Save and deploy`.

### Portal RH

Repita o processo usando:

- App root: `apps/web-client`
- Build command: `pnpm --filter @pronus/web-client build`

### Portal Cliente

Repita o processo usando:

- App root: `apps/web-employee`
- Build command: `pnpm --filter @pronus/web-employee build`

### Portal Profissional

Repita o processo usando:

- App root: `apps/web-clinician`
- Build command: `pnpm --filter @pronus/web-clinician build`

## Parte 6 - Publicar a API

Estado atual:

- A API `apps/api` roda localmente em `http://localhost:3333`.
- Ela ja esta preparada para ler `DATABASE_URL`, mas parte do MVP ainda usa base demonstrativa em memoria.
- Para acesso externo completo, a API precisa ficar publica.

Opcoes:

1. Mais rapida para apresentacao: manter a API local e usar tunnel temporario, apenas para demos controladas.
2. Mais correta para homologacao: hospedar `apps/api` na AWS com Lambda/App Runner e conectar ao Supabase.
3. Mais economica no longo prazo: migrar endpoints pequenos para Supabase Edge Functions e manter NestJS apenas onde houver regra complexa.

Enquanto a API publica nao estiver implementada, os frontends publicados na AWS nao terao todas as funcoes operacionais fora da rede local.

## Parte 7 - Como desligar para nao gerar custo

### Desligar AWS Amplify

1. Acesse AWS Amplify.
2. Abra cada app publicado.
3. Entre em `App settings`.
4. Desative deploy automatico, se existir.
5. Para desligar totalmente, delete o app:
   - `App settings > General > Delete app`.
6. Depois, abra `Billing > Bills` e confirme se nao ha servicos ativos.
7. Abra `Cost Explorer` e veja se aparecem custos por servico/regiao.

### Desligar Supabase

1. Acesse Supabase.
2. Abra o projeto.
3. Faca backup se houver dados importantes.
4. Para pausar, use a opcao de pause quando disponivel no plano Free.
5. Para apagar totalmente:
   - `Project Settings > General > Delete project`.
6. Confirme que nao ha outro projeto ativo na organizacao.

### Desligar ambiente local

1. Feche as janelas abertas pelo `iniciar-pronus-local.bat`.
2. Ou rode:

```powershell
.\iniciar-pronus-local.bat parar
```

## Parte 8 - Como colocar no ar localmente para apresentacao sem internet

1. Antes da reuniao, com internet, abra o PowerShell.
2. Entre no projeto:

```powershell
cd "C:\Users\Marco\Documents\GitHub\Pronus Labor 360"
```

3. Rode pelo menos uma vez:

```powershell
pnpm install
```

4. No dia da apresentacao, de dois cliques em:

```text
iniciar-pronus-local.bat
```

5. Escolha `1 - Iniciar sistema local`.
6. Aguarde 30 a 60 segundos.
7. Acesse:
   - Operacoes: http://localhost:3000/login
   - RH: http://localhost:3001/login
   - Cliente: http://localhost:3002/login
   - Profissional: http://localhost:3003/login
   - API: http://localhost:3333/health

## Parte 9 - Checklist de seguranca antes de apresentar

- Nao mostrar senhas dentro das telas de login.
- Usar somente acessos do arquivo `docs/acessos-teste-portais.md`.
- Nao colocar `service_role` no AWS Amplify.
- Confirmar que `NEXT_PUBLIC_ENABLE_DEMO_FALLBACK=false` na AWS.
- Conferir AWS Budgets antes e depois da reuniao.
- Conferir Supabase usage depois da reuniao.
- Apagar ou pausar recursos que nao serao usados.

## Proximo passo tecnico recomendado

Para deixar a publicacao externa realmente operacional, a proxima entrega deve ser:

1. Persistir login, usuarios, empresas, clientes, psicossocial, agenda e prontuario no Supabase via Prisma.
2. Publicar `apps/api` em runtime publico.
3. Criar pipeline de deploy separado por portal.
4. Criar ambientes `homolog` e `prod`.
5. Ativar logs, auditoria e politica de backup.
