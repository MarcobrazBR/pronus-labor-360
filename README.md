# Pronus Labor 360

ERP para gestao de saude ocupacional, NR-01/GRO/PGR, risco psicossocial, documentos, operacao PRONUS e preparacao futura para eSocial.

## Estrutura

```text
apps/
  web-pronus/      Portal operacional PRONUS
  web-client/      Portal RH Cliente
  web-employee/    Portal Colaborador
  api/             API Node.js/NestJS
packages/
  ui/              Componentes compartilhados
  config/          Configuracoes compartilhadas
  types/           Tipos compartilhados
  validations/     Validacoes compartilhadas
  database/        Prisma, schema e acesso ao banco
docs/              Documentacao do produto e arquitetura
```

## Stack Definida

- Next.js + React + TypeScript + Tailwind nos tres portais.
- NestJS no backend.
- PostgreSQL via Supabase.
- Prisma como ORM.
- pnpm workspaces.

## Primeiros Comandos

Depois de instalar dependencias:

```bash
pnpm install
pnpm dev
```

## Documentacao

A documentacao de produto, arquitetura e dados esta em `docs/`.
