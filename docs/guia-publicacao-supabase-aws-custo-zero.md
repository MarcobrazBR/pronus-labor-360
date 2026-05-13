# Guia minucioso para publicar o PRONUS LABOR 360

Data: 2026-05-13

Este guia foi reescrito para uma pessoa que nunca publicou um sistema no Supabase nem na AWS. Ele usa nomes em portugues do Brasil quando a plataforma mostrar traducao. Quando a tela aparecer em ingles, deixei tambem o nome original entre parenteses.

## Leia isto antes de tentar publicar

O PRONUS LABOR 360 tem 5 partes:

| Parte               | Pasta                | Porta local | Funcao                                                               |
| ------------------- | -------------------- | ----------- | -------------------------------------------------------------------- |
| API                 | `apps/api`           | `3333`      | Regras de negocio, login, empresas, agenda, prontuario, psicossocial |
| Portal PRONUS       | `apps/web-pronus`    | `3000`      | Operacoes administrativas                                            |
| Portal RH           | `apps/web-client`    | `3001`      | RH da empresa cliente                                                |
| Portal Cliente      | `apps/web-employee`  | `3002`      | Colaborador da empresa cliente                                       |
| Portal Profissional | `apps/web-clinician` | `3003`      | Medico, psicologo, nutricionista                                     |

Ponto mais importante:

O Supabase nao roda a API NestJS atual. Ele serve como banco PostgreSQL, storage, autenticacao, RLS e possiveis Edge Functions. Para o sistema funcionar 100% fora do seu computador, a API `apps/api` tambem precisa ficar publicada em algum lugar.

Por isso existem 3 niveis de publicacao:

| Nivel                              | O que voce consegue fazer                                               | Dificuldade | Custo esperado                         |
| ---------------------------------- | ----------------------------------------------------------------------- | ----------- | -------------------------------------- |
| 1 - Local para apresentacao        | Rodar tudo no seu computador com `.bat`                                 | Baixa       | Zero                                   |
| 2 - Front AWS + Supabase preparado | Publicar portais na AWS e banco no Supabase, mas API ainda local/tunnel | Media       | Pode ficar zero se respeitar limites   |
| 3 - Homologacao real               | Portais AWS + Supabase + API publicada                                  | Alta        | Pode gerar custo se errar configuracao |

Minha recomendacao: primeiro deixe o Nivel 1 funcionando, depois crie o Supabase, depois publique apenas o Portal Profissional na AWS para aprender o caminho, e so depois replique para os outros portais.

## Fontes oficiais usadas

- Supabase Pricing: https://supabase.com/pricing
- Supabase Connection Strings: https://supabase.com/docs/guides/database/connecting-to-postgres
- Supabase Prisma: https://supabase.com/docs/guides/database/prisma
- Supabase Storage: https://supabase.com/docs/guides/storage
- AWS Amplify Pricing: https://aws.amazon.com/amplify/pricing/
- AWS Amplify Monorepo: https://docs.aws.amazon.com/amplify/latest/userguide/monorepo-configuration.html
- AWS Amplify variaveis de ambiente: https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html
- AWS Amplify variaveis para Next.js SSR: https://docs.aws.amazon.com/amplify/latest/userguide/ssr-environment-variables.html
- AWS Free Tier: https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-plans.html
- AWS Budgets: https://aws.amazon.com/aws-cost-management/aws-budgets/pricing/

## Parte 0 - Preparar sua maquina

Antes de abrir Supabase ou AWS, confirme que o sistema sobe localmente.

1. Abra a pasta do projeto no Windows Explorer:

```text
C:\Users\Marco\Documents\GitHub\Pronus Labor 360
```

2. Dê dois cliques em:

```text
iniciar-pronus-local.bat
```

3. Escolha:

```text
1 - Iniciar sistema local
```

4. Aguarde de 30 a 60 segundos.

5. Abra no navegador:

```text
http://localhost:3333/health
```

6. Se aparecer um texto JSON com `"status":"ok"`, a API esta de pe.

7. Teste os portais:

```text
Operacoes:    http://localhost:3000/login
RH:           http://localhost:3001/login
Cliente:      http://localhost:3002/login
Profissional: http://localhost:3003/login
```

8. Se precisar desligar:

```text
iniciar-pronus-local.bat parar
```

Se o Nivel 1 nao funcionar, nao avance para AWS. Primeiro precisamos corrigir localmente.

## Parte 1 - Criar o Supabase do zero

### 1.1 Entrar no Supabase

1. Acesse:

```text
https://supabase.com
```

2. Clique em `Sign in` ou `Entrar`.
3. Entre com sua conta.
4. Se aparecer uma tela perguntando por organizacao, crie uma organizacao chamada:

```text
Pronus Labor
```

### 1.2 Criar um projeto

1. No painel do Supabase, clique em:

```text
New project
```

ou, se estiver traduzido:

```text
Novo projeto
```

2. Preencha:

| Campo na tela                      | O que colocar                     |
| ---------------------------------- | --------------------------------- |
| Organization / Organizacao         | `Pronus Labor`                    |
| Project name / Nome do projeto     | `pronus-labor-homolog`            |
| Database Password / Senha do banco | Crie uma senha forte              |
| Region / Regiao                    | Escolha a mais proxima disponivel |
| Pricing plan / Plano               | Free                              |

3. Guarde a senha do banco em um lugar seguro.
4. Clique em `Create new project` ou `Criar novo projeto`.
5. Aguarde o Supabase finalizar. Pode levar alguns minutos.

### 1.3 Copiar as chaves publicas

1. Dentro do projeto Supabase, procure o menu lateral.
2. Clique em:

```text
Project Settings
```

ou:

```text
Configuracoes do projeto
```

3. Clique em:

```text
API
```

4. Copie estes valores para um bloco de notas temporario:

| Nome na tela | Para que serve                           |
| ------------ | ---------------------------------------- |
| Project URL  | URL publica do Supabase                  |
| anon public  | Chave publica que pode ir para frontend  |
| service_role | Chave secreta, nunca colocar no frontend |

Atencao:

- `anon public` pode ir para AWS Amplify.
- `service_role` nao pode aparecer em tela, frontend, GitHub ou print publico.

### 1.4 Copiar as URLs de banco

1. Ainda no Supabase, clique em:

```text
Project Settings > Database
```

ou:

```text
Configuracoes do projeto > Banco de dados
```

2. Procure um botao chamado:

```text
Connect
```

ou:

```text
Conectar
```

3. Procure `Connection string`.
4. Para `DATABASE_URL`, use preferencialmente:

```text
Session pooler
```

ou algo parecido com:

```text
postgresql://postgres.xxxxx:SUA-SENHA@aws-0-REGIAO.pooler.supabase.com:5432/postgres
```

5. Para `DIRECT_URL`, use:

```text
Direct connection
```

ou algo parecido com:

```text
postgresql://postgres:SUA-SENHA@db.xxxxx.supabase.co:5432/postgres
```

Importante:

- A senha precisa ficar dentro da URL.
- Se sua senha tiver `@`, `#`, `%`, `/` ou espaco, pode dar erro. Para facilitar, no ambiente de homologacao use uma senha forte, mas sem caracteres estranhos, por exemplo misturando letras, numeros e `!`.
- Se `DIRECT_URL` falhar por IPv6 ou timeout, me avise. Isso e comum em algumas redes.

## Parte 2 - Configurar o projeto local para falar com Supabase

1. Abra o PowerShell.
2. Entre na pasta do projeto:

```powershell
cd "C:\Users\Marco\Documents\GitHub\Pronus Labor 360"
```

3. Crie o arquivo `.env` copiando o exemplo:

```powershell
Copy-Item .env.example .env
```

4. Abra o arquivo:

```powershell
notepad .env
```

5. Preencha assim, trocando os valores pelos seus:

```text
NODE_ENV=development

NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLIC
NEXT_PUBLIC_ENABLE_DEMO_FALLBACK=true

API_PORT=3333
API_PUBLIC_URL=http://localhost:3333
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_SERVICE_ROLE
SUPABASE_STORAGE_BUCKET_DOCUMENTS=documents
SUPABASE_STORAGE_BUCKET_CLINICAL=clinical-records

DATABASE_URL=postgresql://postgres.xxxxx:SUA-SENHA@aws-0-REGIAO.pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres:SUA-SENHA@db.xxxxx.supabase.co:5432/postgres

OPENAI_API_KEY=
```

6. Salve e feche o bloco de notas.

7. Rode:

```powershell
pnpm db:generate
```

8. Depois rode:

```powershell
pnpm db:migrate
```

9. Se a migracao funcionar, volte ao Supabase.
10. Clique em:

```text
Table Editor
```

ou:

```text
Editor de tabelas
```

11. Confirme se apareceram tabelas do sistema.

Se `pnpm db:migrate` der erro:

| Erro comum                               | O que fazer                                                                  |
| ---------------------------------------- | ---------------------------------------------------------------------------- |
| `P1001` ou `Can't reach database server` | Revise `DATABASE_URL` e `DIRECT_URL`; pode ser URL errada ou rede bloqueando |
| `password authentication failed`         | Senha errada dentro da URL                                                   |
| `Invalid database URL`                   | A URL ficou incompleta ou com caractere especial sem tratamento              |
| Timeout                                  | Teste outra rede ou me envie o erro exato                                    |

## Parte 3 - Criar os buckets de arquivos no Supabase

1. No Supabase, clique em:

```text
Storage
```

ou:

```text
Armazenamento
```

2. Clique em:

```text
New bucket
```

ou:

```text
Novo bucket
```

3. Crie o primeiro bucket:

```text
documents
```

4. Deixe como privado.
5. Crie o segundo bucket:

```text
clinical-records
```

6. Deixe como privado.

Nunca deixe `clinical-records` publico. Ele tera dados sensiveis de prontuario.

## Parte 4 - Preparar a AWS para nao gerar susto de custo

Antes de publicar qualquer portal:

1. Acesse:

```text
https://aws.amazon.com/console/
```

2. Entre na sua conta AWS.
3. No campo de busca superior, procure:

```text
Billing
```

ou:

```text
Faturamento
```

4. Abra:

```text
Billing and Cost Management
```

ou:

```text
Faturamento e gerenciamento de custos
```

5. No menu lateral, procure:

```text
Budgets
```

ou:

```text
Orcamentos
```

6. Clique em:

```text
Create budget
```

ou:

```text
Criar orcamento
```

7. Escolha:

```text
Cost budget
```

ou:

```text
Orcamento de custo
```

8. Configure:

| Campo   | Valor recomendado   |
| ------- | ------------------- |
| Nome    | `Alerta PRONUS MVP` |
| Periodo | Mensal              |
| Valor   | `1 USD`             |
| E-mail  | Seu e-mail          |

9. Salve.

Se voce nao criar budget, pare aqui. AWS pode gerar custo se algum recurso pago for criado por engano.

## Parte 5 - Entender o problema da API antes do Amplify

Quando voce publica um portal na AWS, o navegador do usuario nao consegue acessar:

```text
http://localhost:3333
```

Porque `localhost` significa "a propria maquina do usuario", nao o seu computador.

Para o portal publicado funcionar, `NEXT_PUBLIC_API_URL` precisa apontar para uma API publica, por exemplo:

```text
https://api.pronuslabor.com.br
```

Hoje a API ainda nao esta publicada em nuvem. Entao, para teste, existem 3 opcoes:

| Opcao                  | Quando usar                    | Observacao                                         |
| ---------------------- | ------------------------------ | -------------------------------------------------- |
| Local com `.bat`       | Apresentacao no seu computador | Mais facil e zero custo                            |
| Tunnel temporario      | Apresentacao externa curta     | A API roda no seu PC, mas ganha uma URL temporaria |
| API em runtime publico | Homologacao real               | Ainda precisa ser implementado/publicado           |

Se voce tentar subir so os portais na AWS usando `NEXT_PUBLIC_API_URL=http://localhost:3333`, a tela abre, mas login e dados podem falhar.

## Parte 6 - Publicar o primeiro portal na AWS Amplify

Comece pelo Portal Profissional, porque ele e o mais simples para validar o caminho.

### 6.1 Abrir o Amplify

1. No AWS Console, use a busca superior.
2. Digite:

```text
Amplify
```

3. Clique em:

```text
AWS Amplify
```

4. Clique em:

```text
Create new app
```

ou:

```text
Criar novo aplicativo
```

5. Escolha:

```text
Host web app
```

ou:

```text
Hospedar aplicativo da web
```

6. Escolha:

```text
GitHub
```

7. Clique em `Continuar` ou `Next`.

### 6.2 Conectar o GitHub

1. Se a AWS pedir autorizacao, autorize o GitHub.
2. Escolha o repositorio:

```text
MarcobrazBR/pronus-labor-360
```

3. Escolha a branch:

```text
main
```

4. Marque a opcao:

```text
My app is a monorepo
```

ou:

```text
Meu aplicativo e um monorepo
```

5. No campo de caminho do app, coloque:

```text
apps/web-clinician
```

6. Clique em `Next` ou `Proximo`.

### 6.3 Configurar variaveis de ambiente

Na tela de configuracao, procure:

```text
Advanced settings
```

ou:

```text
Configuracoes avancadas
```

Depois procure:

```text
Environment variables
```

ou:

```text
Variaveis de ambiente
```

Adicione:

| Nome                               | Valor                |
| ---------------------------------- | -------------------- |
| `NEXT_PUBLIC_API_URL`              | URL publica da API   |
| `NEXT_PUBLIC_SUPABASE_URL`         | URL do Supabase      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`    | Chave `anon public`  |
| `NEXT_PUBLIC_ENABLE_DEMO_FALLBACK` | `false`              |
| `AMPLIFY_MONOREPO_APP_ROOT`        | `apps/web-clinician` |

Se voce ainda nao tem API publica, use apenas para testar build. Para login real, a API precisa estar publica.

### 6.4 Configurar build do Portal Profissional

Na area de build, cole este conteudo:

```yaml
version: 1
applications:
  - appRoot: apps/web-clinician
    frontend:
      buildPath: /
      phases:
        preBuild:
          commands:
            - nvm install 24
            - nvm use 24
            - corepack enable
            - corepack prepare pnpm@10.33.2 --activate
            - pnpm install --frozen-lockfile
        build:
          commands:
            - echo "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL" >> apps/web-clinician/.env.production
            - echo "NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL" >> apps/web-clinician/.env.production
            - echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY" >> apps/web-clinician/.env.production
            - echo "NEXT_PUBLIC_ENABLE_DEMO_FALLBACK=$NEXT_PUBLIC_ENABLE_DEMO_FALLBACK" >> apps/web-clinician/.env.production
            - pnpm --filter @pronus/web-clinician build
      artifacts:
        baseDirectory: apps/web-clinician/.next
        files:
          - "**/*"
      cache:
        paths:
          - node_modules/**/*
          - apps/web-clinician/.next/cache/**/*
```

Clique em:

```text
Save and deploy
```

ou:

```text
Salvar e implantar
```

### 6.5 Acompanhar o deploy

1. A AWS vai mostrar etapas como:
   - Provision
   - Build
   - Deploy
   - Verify
2. Clique em `Build` para abrir o log.
3. Se aparecer erro, procure a primeira linha vermelha.

Erros comuns:

| Erro                       | Causa provavel             | Correcao                                               |
| -------------------------- | -------------------------- | ------------------------------------------------------ |
| `pnpm: command not found`  | pnpm nao foi ativado       | Confirme `corepack prepare pnpm@10.33.2 --activate`    |
| `Cannot find package`      | instalacao falhou          | Veja se `pnpm install --frozen-lockfile` rodou na raiz |
| `Unsupported Node version` | Node da AWS antigo         | Confirme `nvm install 24` e `.nvmrc`                   |
| `App root mismatch`        | Caminho do monorepo errado | `AMPLIFY_MONOREPO_APP_ROOT` deve bater com `appRoot`   |
| Login nao funciona         | API nao esta publica       | Configure `NEXT_PUBLIC_API_URL` para API publica       |

### 6.6 Abrir o portal publicado

Quando terminar, a AWS mostra uma URL parecida com:

```text
https://main.xxxxx.amplifyapp.com
```

Abra:

```text
https://main.xxxxx.amplifyapp.com/login
```

Se a tela abrir, o frontend foi publicado. Se o login falhar, o problema provavelmente e a API ainda nao publica.

## Parte 7 - Repetir para os outros portais

Depois que o Portal Profissional publicar, crie mais 3 apps no Amplify.

Use esta tabela:

| Portal           | App root             | Variavel `AMPLIFY_MONOREPO_APP_ROOT` | Comando de build                            | Base directory             |
| ---------------- | -------------------- | ------------------------------------ | ------------------------------------------- | -------------------------- |
| PRONUS Operacoes | `apps/web-pronus`    | `apps/web-pronus`                    | `pnpm --filter @pronus/web-pronus build`    | `apps/web-pronus/.next`    |
| RH               | `apps/web-client`    | `apps/web-client`                    | `pnpm --filter @pronus/web-client build`    | `apps/web-client/.next`    |
| Cliente          | `apps/web-employee`  | `apps/web-employee`                  | `pnpm --filter @pronus/web-employee build`  | `apps/web-employee/.next`  |
| Profissional     | `apps/web-clinician` | `apps/web-clinician`                 | `pnpm --filter @pronus/web-clinician build` | `apps/web-clinician/.next` |

Para cada portal, copie o YAML do Portal Profissional e troque:

- `apps/web-clinician`
- `@pronus/web-clinician`

pelos valores da tabela.

## Parte 8 - Como saber se deu certo

### 8.1 Teste local

```text
http://localhost:3333/health
```

Resultado esperado:

```text
"status":"ok"
```

### 8.2 Teste Supabase

No Supabase:

1. Abra `Table Editor`.
2. Veja se as tabelas existem.
3. Abra `Storage`.
4. Veja se existem:

```text
documents
clinical-records
```

### 8.3 Teste AWS

Em cada app Amplify:

1. O deploy precisa estar verde.
2. A URL precisa abrir.
3. A rota `/login` precisa abrir.
4. Se login falhar com erro de conexao, revise `NEXT_PUBLIC_API_URL`.

## Parte 9 - Como desligar tudo

### 9.1 Desligar local

1. Feche as janelas do terminal.
2. Ou rode:

```text
iniciar-pronus-local.bat parar
```

### 9.2 Desligar AWS Amplify

1. AWS Console > Amplify.
2. Clique no app publicado.
3. Abra:

```text
App settings
```

ou:

```text
Configuracoes do aplicativo
```

4. Clique em:

```text
General
```

ou:

```text
Geral
```

5. Procure:

```text
Delete app
```

ou:

```text
Excluir aplicativo
```

6. Confirme.
7. Repita para cada portal.

### 9.3 Desligar Supabase

1. Supabase > escolha o projeto.
2. Abra:

```text
Project Settings > General
```

ou:

```text
Configuracoes do projeto > Geral
```

3. Procure:

```text
Pause project
```

ou:

```text
Pausar projeto
```

4. Se quiser apagar tudo:

```text
Delete project
```

ou:

```text
Excluir projeto
```

Antes de excluir, faca backup se houver dados importantes.

### 9.4 Conferir custo na AWS

1. AWS Console.
2. Pesquise:

```text
Billing
```

3. Abra `Bills` ou `Faturas`.
4. Confira se nao ha custo inesperado.
5. Abra `Cost Explorer` ou `Explorador de custos`.
6. Confira se algum servico ficou ativo.

## Parte 10 - Checklist simples para voce seguir

Use esta ordem:

1. Sistema local abre com `.bat`.
2. Supabase criado no Free.
3. `.env` local preenchido.
4. `pnpm db:generate` rodou.
5. `pnpm db:migrate` rodou.
6. Buckets `documents` e `clinical-records` criados.
7. AWS Budget criado com alerta de 1 USD.
8. Primeiro app Amplify criado para `apps/web-clinician`.
9. Variaveis de ambiente preenchidas.
10. Build do Portal Profissional ficou verde.
11. URL `/login` abriu.
12. Repetir para os outros portais.
13. Resolver API publica antes de chamar terceiros para teste completo.

## Parte 11 - O que ainda falta para uma homologacao real

Para voce conseguir mandar um link para investidores ou terceiros testarem tudo sem depender do seu computador, ainda precisamos executar uma das opcoes abaixo:

### Opcao A - Publicar API NestJS

Publicar `apps/api` em um runtime externo e configurar:

```text
API_PUBLIC_URL=https://api.pronuslabor.com.br
ALLOWED_ORIGINS=https://portal-1,https://portal-2,https://portal-3,https://portal-4
DATABASE_URL=URL_DO_SUPABASE
DIRECT_URL=URL_DO_SUPABASE
SUPABASE_SERVICE_ROLE_KEY=CHAVE_SECRETA
```

Essa e a opcao mais parecida com o sistema atual.

### Opcao B - Migrar parte da API para Supabase Edge Functions

Converter endpoints do MVP para funcoes do Supabase.

Essa opcao pode reduzir custo no futuro, mas exige mais desenvolvimento.

### Opcao C - Tunnel temporario para apresentacao

Rodar a API no seu computador e criar uma URL temporaria publica. Serve para apresentacao curta, mas nao e homologacao real.

## Parte 12 - Quando me pedir ajuda, envie estes dados

Se travar em alguma etapa, me envie:

1. Em qual parte do guia voce parou.
2. Print da tela.
3. Texto completo do erro.
4. Qual portal voce esta tentando publicar.
5. Se a API local esta respondendo em:

```text
http://localhost:3333/health
```

6. Se o app AWS esta tentando usar qual `NEXT_PUBLIC_API_URL`.

Com isso eu consigo corrigir com muito mais precisao.
