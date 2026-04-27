# Pronus Labor 360 - Checklist de Ambiente de Desenvolvimento

Versao: 0.1  
Data: 2026-04-26  
Status: Preparacao antes do desenvolvimento

## 1. Objetivo

Este checklist lista o que precisa estar instalado ou criado antes de iniciar o desenvolvimento do Pronus Labor 360.

Ele foi escrito para ser usado por uma pessoa que nao e programadora, entao cada item tem uma explicacao simples.

## 2. O Que Sera Necessario

### 2.1 Git

Para que serve:
Controla versoes do projeto e permite salvar historico das alteracoes.

Por que precisamos:
Todo projeto profissional deve ter historico, ramificacoes e possibilidade de voltar ou comparar mudancas.

Status:
Instalado em 2026-04-27 via winget. Versao verificada: Git 2.54.0.windows.1.

### 2.2 Node.js LTS

Para que serve:
Permite rodar o backend Node.js e as ferramentas de frontend React/Next.js.

Por que precisamos:
O projeto sera feito com Node.js, TypeScript e React.

Versao recomendada:
Node.js LTS atual.

Status:
O unico Node encontrado na verificacao de 2026-04-27 foi o Node interno do aplicativo Codex, em `WindowsApps/OpenAI.Codex`. Ele nao deve ser considerado uma instalacao de desenvolvimento. Instalar Node.js LTS proprio.

Tentativa:
Instalacao via winget do Node.js LTS falhou em 2026-04-27 com codigo MSI 1603. Proximo passo sugerido: tentar instalacao por alternativa como Volta/nvm-windows ou instalador oficial manual.

Resolucao:
Volta instalado em 2026-04-27. Node.js instalado via Volta. Versao verificada: Node v24.15.0.

### 2.3 pnpm

Para que serve:
Gerencia dependencias do projeto.

Por que precisamos:
E rapido e funciona muito bem em monorepo.

Status:
Instalado via Volta em 2026-04-27. Versao verificada: pnpm 10.33.2.

### 2.4 Docker Desktop

Para que serve:
Permite rodar servicos locais em containers, como banco de dados ou Supabase local.

Por que precisamos:
Ajuda a deixar o ambiente de desenvolvimento mais parecido com producao e evita instalacoes manuais complexas.

Status:
Tentativa de instalacao via winget em 2026-04-27 baixou o instalador, mas falhou com codigo 4294967291. Docker continua pendente. Pode exigir WSL, virtualizacao, reinicializacao ou instalacao manual.

### 2.5 VS Code

Para que serve:
Editor de codigo.

Por que precisamos:
Nao e obrigatorio para o Codex trabalhar, mas ajuda voce a abrir arquivos, ver o projeto e acompanhar a evolucao.

Status:
Opcional, mas recomendado.

### 2.6 Conta Supabase

Para que serve:
Hospeda banco PostgreSQL, autenticacao e arquivos.

Por que precisamos:
Vai acelerar o desenvolvimento e reduzir complexidade de infraestrutura inicial.

Status:
Pendente.

### 2.7 Dominio

Para que serve:
Endereco publico do sistema.

Por que precisamos:
Nao e necessario para desenvolver localmente, mas e bom reservar cedo para proteger a marca.

Sugestoes:

- pronuslabor.com.br

Status:
Dominio escolhido: pronuslabor.com.br. Recomendado comprar agora para proteger a marca.

## 3. O Que Nao Precisa Contratar Agora

### 3.1 AWS

Nao recomendo contratar agora.

Motivo:
Ainda estamos antes do scaffold e do prototipo. Contratar AWS neste momento pode gerar custo e complexidade antes da necessidade real.

Quando avaliar:

- Depois do primeiro prototipo funcional.
- Quando precisarmos de ambiente de homologacao mais robusto.
- Quando decidirmos deploy final de backend, observabilidade, backups e seguranca.

### 3.2 Servicos de videochamada

Nao precisa contratar agora.

Motivo:
Teleatendimento esta preparado para futuro, mas nao e o nucleo inicial do MVP.

### 3.3 Servicos de IA/transcricao

Nao precisa contratar agora.

Motivo:
Transcricao e resumo de consulta serao etapa futura.

## 4. Ordem Recomendada

1. Verificar se Git ja esta instalado.
2. Verificar se Node.js ja esta instalado.
3. Instalar pnpm.
4. Instalar Docker Desktop.
5. Criar conta Supabase.
6. Definir se vai comprar dominio agora.
7. Criar scaffold inicial do projeto.

## 5. Comandos de Verificacao Futuros

Quando formos preparar a maquina, usaremos comandos simples para verificar instalacoes:

```bash
git --version
node --version
npm --version
pnpm --version
docker --version
```

Se algum comando nao funcionar, instalaremos o programa correspondente.

## 6. Decisoes Tecnicas Associadas

- Projeto em monorepo.
- Node.js + TypeScript.
- Next.js + React + Tailwind.
- Backend NestJS.
- PostgreSQL via Supabase.
- Prisma como ORM inicial.
- Supabase Auth.
- Supabase Storage.

## 7. Observacao Para o Marco

Voce nao precisa instalar tudo sozinho agora.

Quando chegarmos ao momento de desenvolvimento, a preparacao sera feita passo a passo:

1. Eu verifico o que ja existe na sua maquina.
2. Digo exatamente o que falta.
3. Voce autoriza instalacoes quando necessario.
4. Seguimos para criar o projeto.

## 8. Status do Scaffold

Atualizacao de 2026-04-27:

- Repositorio Git inicializado.
- Monorepo criado com pnpm workspaces.
- Dependencias instaladas com pnpm.
- Prisma Client gerado.
- Typecheck executado com sucesso em todos os pacotes e apps.
- Build completo executado com sucesso.
- Docker Desktop segue pendente para depois de reiniciar/verificar Windows.
