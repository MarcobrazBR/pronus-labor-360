# Separacao Backend / Frontend - AWS + Supabase

Data: 2026-05-13

## Decisao Atual

O PRONUS LABOR 360 deve manter separacao clara entre:

- frontends Next.js publicados na AWS;
- API NestJS como camada de regra de negocio;
- Supabase como servico gerenciado para PostgreSQL, Auth e Storage.

Essa decisao evita expor dados sensiveis diretamente no frontend e preserva uma camada central para permissoes, auditoria, regras reguladoras, prontuario, psicossocial e financeiro.

## Papel De Cada Camada

### Frontends Na AWS

Portais:

- `apps/web-pronus`
- `apps/web-client`
- `apps/web-employee`
- `apps/web-clinician`

Os frontends devem receber apenas variaveis publicas:

```text
NEXT_PUBLIC_API_URL=https://api.pronuslabor.com.br
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_ENABLE_DEMO_FALLBACK=false
```

Nenhuma chave `service_role`, URL direta de banco, segredo de IA ou segredo de storage pode ir para os portais.

### API NestJS

Responsabilidades:

- autenticar e autorizar chamadas sensiveis;
- aplicar regras por perfil e empresa;
- registrar auditoria;
- controlar acesso a prontuario, psicossocial individual, anexos e financeiro;
- conversar com Prisma/Supabase usando segredos privados;
- preparar integracoes futuras com eSocial e IA.

Variaveis privadas esperadas:

```text
API_PORT=3333
API_PUBLIC_URL=https://api.pronuslabor.com.br
ALLOWED_ORIGINS=https://operacao.pronuslabor.com.br,https://rh.pronuslabor.com.br,https://cliente.pronuslabor.com.br,https://profissional.pronuslabor.com.br
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET_DOCUMENTS=documents
SUPABASE_STORAGE_BUCKET_CLINICAL=clinical-records
OPENAI_API_KEY=...
```

### Supabase

Responsabilidades:

- banco PostgreSQL;
- storage privado para documentos e anexos clinicos;
- Auth quando a autenticacao real for ativada;
- Row Level Security como camada adicional de defesa;
- tabelas de auditoria e notificacoes persistentes.

## Implementado Nesta Rodada

- `@pronus/config` centraliza `NEXT_PUBLIC_API_URL`, origens locais, regra de fallback demonstrativo e topologia de deploy.
- Os quatro portais passaram a usar `getPublicApiUrl()` em vez de repetir `localhost:3333`.
- API ganhou `DatabaseService`, preparado para usar Prisma quando `DATABASE_URL` estiver definida.
- `GET /health` agora informa se a API esta em modo `demo` ou com conexao Prisma/Supabase ativa.
- `.env.example` foi reorganizado separando variaveis publicas dos portais e segredos privados do backend.

## Proximo Passo Tecnico

1. Criar projeto Supabase de homologacao.
2. Configurar `DATABASE_URL` e `DIRECT_URL`.
3. Rodar `pnpm db:migrate` para criar as tabelas iniciais.
4. Evoluir `StructuralService` para ler/gravar empresas, setores, cargos, colaboradores, auditoria e notificacoes via Prisma quando o banco estiver ativo.
5. Manter fallback demonstrativo apenas para ambiente local sem banco.
