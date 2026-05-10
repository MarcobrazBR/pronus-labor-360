# Avaliacao UX Nielsen - Portal Profissional, Prontuario e Deploy

Data: 2026-05-10

## Escopo revisado

- Portal Profissional de Saude: barra superior de modulos.
- Portal Profissional de Saude: Meu Financeiro do profissional.
- Portal Profissional de Saude: busca de Prontuario Integrado e modal com timeline.
- Organizacao de arquitetura para deploy AWS + Supabase.

## Heuristicas aplicadas

### 1. Visibilidade do status do sistema

- A barra de modulos mostra claramente onde o profissional esta: Atendimento, Meu financeiro ou Prontuario.
- O financeiro indica consultas finalizadas, pendentes de finalizacao e valor previsto.
- A timeline do prontuario exibe status, sigilo, area responsavel e eventos criticos.

### 2. Correspondencia com o mundo real

- O financeiro do profissional so remunera consultas finalizadas, refletindo o fechamento clinico.
- O prontuario une camadas ocupacional, assistencial e gerencial, seguindo a jornada real do trabalhador.
- Eventos trazem conduta e proximo passo, linguagem natural do atendimento em saude.

### 3. Controle e liberdade do usuario

- O profissional pode sair do financeiro e abrir diretamente um atendimento pendente para ajustar a anamnese.
- O prontuario abre em modal e pode ser fechado sem perder a consulta em andamento.
- A busca nao carrega dados automaticamente, reduzindo exposicao desnecessaria.

### 4. Consistencia e padroes

- Os botoes de modulo mantem a mesma paleta, raio e linguagem visual dos demais portais.
- A busca do prontuario segue o padrao de telas que nao listam dados por padrao.
- Badges de risco, status e sigilo usam cores consistentes com o restante do MVP.

### 5. Prevencao de erros

- A acao de ajustar anamnese fica disponivel somente quando a chamada foi encerrada e a consulta ainda nao foi finalizada.
- Eventos sensiveis ficam marcados por nivel de sigilo.
- O plano AWS + Supabase deixa claro que chaves secretas e dados clinicos nao podem ir para o frontend.

### 6. Reconhecimento em vez de memorizacao

- Os modulos usam nomes diretos e icones: Atendimento, Meu financeiro e Prontuario.
- O modal do prontuario apresenta blocos nomeados: Camada Ocupacional, Inteligencia e Gestao, Alertas e Timeline.
- Filtros usam termos visiveis no proprio conteudo da timeline.

### 7. Flexibilidade e eficiencia

- O profissional consegue chegar rapidamente a pendencias financeiras e voltar ao atendimento exato.
- A busca aceita nome, CPF, empresa, setor, cargo e risco.
- A timeline permite filtrar por area, profissional, status e eventos criticos.

### 8. Estetica e design minimalista

- A barra superior concentra acessos de modulo sem criar uma nova lateral.
- O financeiro evita dashboard pesado e prioriza lista operacional.
- O prontuario em modal evita trocar a tela inteira quando o profissional precisa apenas consultar contexto.

### 9. Ajuda para reconhecer e recuperar falhas

- Estados vazios explicam que nenhum prontuario e carregado antes da busca.
- Botoes desabilitados explicam o motivo via tooltip.
- O plano de deploy documenta riscos tecnicos antes de hospedagem externa.

### 10. Ajuda e documentacao

- Foi criado o plano de deploy AWS + Supabase.
- O status de desenvolvimento foi atualizado com as novas decisoes.
- O README passa a apontar o plano de deploy e o novo prontuario profissional.

## Resultado

A experiencia do profissional ficou mais completa sem perder foco: ele atende, acompanha pendencias financeiras e consulta o prontuario integrado em uma unica jornada. A documentacao tambem prepara o projeto para sair do ambiente local com AWS e Supabase sem misturar dados sensiveis no frontend.
