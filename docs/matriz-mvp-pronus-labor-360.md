# Pronus Labor 360 - Matriz de Modulos do MVP

Versao: 0.1  
Data: 2026-04-26  
Status: Planejamento funcional

## 1. Objetivo

Este documento organiza os modulos do Pronus Labor 360 por prioridade de entrega.

A classificacao usada sera:

- Essencial no MVP: precisa existir para a primeira versao funcional.
- Importante pos-MVP: deve entrar logo depois, mas nao bloqueia o MVP.
- Preparar para futuro: nao precisa estar completo agora, mas o desenho tecnico deve considerar sua evolucao.

O foco inicial aprovado e:

1. Cadastro estrutural.
2. Gestao NR-01/GRO/PGR.
3. Risco psicossocial.
4. Dashboard basico do cliente.
5. Documentos iniciais.

## 2. Matriz Resumida

| Modulo | Prioridade | Portal principal | Observacao |
| --- | --- | --- | --- |
| Autenticacao e permissoes | Essencial no MVP | Todos | Base de seguranca do sistema |
| Multiempresa e isolamento de dados | Essencial no MVP | Todos | Cliente so acessa seus dados |
| Cadastro de grupos, empresas e CNPJs | Essencial no MVP | PRONUS | Base operacional |
| Cadastro de unidades, setores e cargos | Essencial no MVP | PRONUS / RH Cliente | Necessario para NR-01 e dashboards |
| Cadastro/importacao de colaboradores | Essencial no MVP | PRONUS / RH Cliente | Cadastro manual e planilha |
| Divergencia cadastral no primeiro acesso | Essencial no MVP | RH Cliente / Colaborador | Com log e fluxo de aprovacao |
| NR-01/GRO/PGR | Essencial no MVP | PRONUS | Inventario, matriz, plano e evidencias |
| Risco psicossocial | Essencial no MVP | PRONUS / RH Cliente / Colaborador | Questionario, campanha, farol e agregacao |
| Dashboard RH Cliente | Essencial no MVP | RH Cliente | Indicadores basicos |
| Documentos iniciais | Essencial no MVP | PRONUS / RH Cliente | ASO, PGR, relatorio psicossocial, plano, inventario, termo LGPD |
| Auditoria e logs | Essencial no MVP | PRONUS | Obrigatorio para confiabilidade juridica |
| Faturamento basico e inadimplencia | Importante pos-MVP | PRONUS / RH Cliente | Pode entrar em ciclo logo apos o nucleo de risco |
| Pacotes e limites de consultas | Importante pos-MVP | PRONUS / RH Cliente | Necessario antes do teleatendimento completo |
| Agenda de consultas | Importante pos-MVP | Todos | Base para teleatendimento |
| Teleatendimento | Preparar para futuro | Profissional / Colaborador | Nao iniciar como nucleo do MVP |
| Prontuario multidisciplinar | Preparar para futuro | Profissional | Modelar seguranca desde cedo |
| Transcricao e resumo por IA | Preparar para futuro | Profissional | Depende de fornecedor e consentimentos |
| Pagamento de profissionais | Importante pos-MVP | PRONUS | Requer agenda/prontuario finalizado |
| eSocial SST | Preparar para futuro | PRONUS | Criar base compativel, sem envio real no MVP |
| BI avancado | Preparar para futuro | PRONUS / RH Cliente | Dashboards avancados depois |
| Aplicativo mobile nativo | Preparar para futuro | Colaborador | MVP sera web responsivo simples |

## 3. Modulos Essenciais no MVP

### 3.1 Autenticacao e permissoes

Objetivo:
Garantir acesso seguro aos tres portais e separar claramente o que cada usuario pode ver e fazer.

Funcionalidades:

- Login de usuarios PRONUS.
- Login de RH cliente.
- Login de colaborador por CPF previamente cadastrado.
- Perfis e permissoes.
- Controle de sessoes.
- Recuperacao de senha.
- Bloqueio de acesso por status do cliente, quando aplicavel.

Regras importantes:

- O colaborador so acessa se o CPF ja existir no cadastro.
- O cliente PJ nao acessa prontuario, dados clinicos ou risco psicossocial individual.
- O acesso deve respeitar isolamento por empresa/CNPJ.

### 3.2 Multiempresa e isolamento de dados

Objetivo:
Permitir que a PRONUS opere varios grupos, empresas e CNPJs no mesmo sistema, sem vazamento de dados entre clientes.

Funcionalidades:

- Vinculo de todos os dados a uma empresa, CNPJ ou grupo empresarial.
- Usuarios RH vinculados apenas ao seu cliente.
- Equipe PRONUS com acesso global conforme permissao.
- Base preparada para futuro SaaS.

Regras importantes:

- Todo registro sensivel deve ter dono organizacional claro.
- A arquitetura deve evitar que um cliente consulte dados de outro por erro de interface ou API.

### 3.3 Cadastro estrutural

Objetivo:
Criar a base para todas as operacoes de NR-01, risco psicossocial, documentos, dashboards e eSocial futuro.

Entidades:

- Grupo empresarial.
- Empresa/CNPJ.
- Unidade.
- Setor.
- Cargo.
- Colaborador.

Funcionalidades:

- Cadastro manual.
- Edicao com historico.
- Importacao de colaboradores por planilha.
- Validacao de campos obrigatorios.
- Status de colaborador ativo/inativo.
- Associacao do colaborador a empresa, unidade, setor e cargo.
- Campos orientados ao eSocial.
- Registro de telefone/WhatsApp.
- Registro de beneficios de saude informados pelo RH, como plano medico, plano odontologico e seguro de vida.

Observacao:
Campos exatos da planilha ainda precisam ser definidos com base no MVP e nos leiautes oficiais vigentes do eSocial.

Campos iniciais esperados:

- CPF.
- Nome completo.
- Data de nascimento.
- Sexo.
- Telefone/WhatsApp.
- E-mail.
- Empresa/CNPJ.
- Unidade.
- Setor.
- Cargo.
- Matricula.
- Categoria do trabalhador.
- Data de admissao.
- Status.
- Beneficios de saude disponiveis.

### 3.4 Primeiro acesso e divergencia cadastral

Objetivo:
Permitir que o colaborador confirme ou complemente seus dados no primeiro acesso, sem perder governanca do RH e da PRONUS.

Fluxo resumido:

1. RH ou PRONUS cadastra colaborador.
2. Colaborador acessa com CPF.
3. Sistema solicita dados de primeiro acesso.
4. Sistema compara dados informados com cadastro original.
5. Se houver divergencia, gera pendencia para o RH e bloqueia o colaborador ate validacao.
6. RH confirma ou recusa.
7. Dados sensiveis para SST/eSocial entram em conferencia da PRONUS.
8. Sistema registra log completo.

Regras importantes:

- O RH e o aprovador formal da mudanca.
- A PRONUS pode conferir dados sensiveis como etapa operacional.
- O log deve registrar campos alterados, valor anterior, valor novo, aprovador, data e hora.
- Enquanto a divergencia estiver pendente, o colaborador nao pode responder questionarios nem acessar funcionalidades internas.

### 3.5 NR-01, GRO e PGR

Objetivo:
Ajudar ativamente a montar e acompanhar inventario de riscos, matriz de risco, plano de acao e evidencias.

Funcionalidades:

- Cadastro de perigos e riscos ocupacionais.
- Associacao de riscos a empresa, unidade, setor, cargo ou colaborador.
- Classificacao de probabilidade, severidade e nivel de risco.
- Matriz de risco.
- Inventario de riscos.
- Plano de acao.
- Evidencias anexas.
- Responsaveis e prazos.
- Status de acoes.
- Historico de alteracoes.

Regras importantes:

- Apenas equipe tecnica PRONUS e profissionais autorizados classificam riscos.
- Cliente PJ visualiza resultados e documentos, mas nao altera classificacoes tecnicas.

### 3.6 Risco psicossocial

Objetivo:
Executar campanhas de avaliacao psicossocial, calcular risco inicial, apoiar entrevistas clinicas e gerar risco final agregado para o cliente.

Funcionalidades:

- Criacao de campanha por empresa/CNPJ.
- Data de inicio e fim.
- Questionario para todos os colaboradores participantes.
- Monitoramento de percentual de respostas.
- Alerta ao atingir 89% de respostas.
- Alerta ao fim do prazo caso 89% nao seja atingido.
- Decisao do analista PRONUS: encerrar ou prorrogar.
- Calculo de risco inicial por colaborador e setor.
- Selecao aleatoria para entrevistas, priorizando niveis mais altos.
- Registro de validacao pelo psicologo.
- Ajuste de risco final quando necessario.
- Agregacao por setor e empresa.
- Farol de risco: baixo, moderado, alto e critico.

Regras de privacidade:

- Cliente PJ ve somente dados agregados.
- Setor com menos de 5 pessoas nao pode aparecer isolado no painel do cliente.
- Sistema sugere agrupamento de setores pequenos.
- Equipe PRONUS confirma ou ajusta agrupamento.
- PRONUS pode visualizar informacoes individuais conforme permissao e necessidade tecnica.
- Apenas perfis autorizados, como profissional de saude e gerente, podem visualizar respostas individuais associadas ao nome da pessoa.

### 3.7 Dashboard basico do RH Cliente

Objetivo:
Dar ao cliente uma visao clara da saude ocupacional contratada, sem expor dados sigilosos.

Indicadores iniciais:

- Total de colaboradores.
- Total de colaboradores ativos.
- Riscos contratados.
- Nivel de risco por farol.
- Risco por setor, respeitando regra de agrupamento.
- Consultas agendadas, quando o modulo de agenda estiver ativo.
- Consultas realizadas, quando o modulo de agenda estiver ativo.
- Faltas/abandonos, quando o modulo de agenda estiver ativo.
- Absenteismo, quando o modulo de agenda estiver ativo.

Observacao:
No MVP inicial, indicadores de consultas podem aparecer como area preparada ou com dados simulados/desativados ate o modulo de agenda entrar. O percentual de respostas da campanha psicossocial deve aparecer apenas para operadores administrativos da PRONUS.

### 3.8 Documentos iniciais

Objetivo:
Permitir emissao e consulta dos primeiros documentos legais e operacionais.

Documentos:

- ASO.
- PGR.
- Relatorio psicossocial agregado.
- Plano de acao.
- Inventario de riscos.
- Termo LGPD.

Regras:

- No MVP, documentos podem ser emitidos em PDF sem assinatura digital.
- Devem conter identificacao do responsavel tecnico quando aplicavel.
- Modelos serao criados do zero.
- Toda emissao, alteracao ou republicacao deve gerar log.

### 3.9 Auditoria e logs

Objetivo:
Registrar eventos relevantes para seguranca juridica, LGPD e confiabilidade operacional.

Eventos minimos:

- Login e logout.
- Alteracao cadastral relevante.
- Aprovacao ou recusa de divergencia cadastral.
- Alteracao de risco ocupacional.
- Alteracao de risco psicossocial.
- Emissao ou republicacao de documento.
- Alteracao de contrato, plano, pacote ou faturamento.
- Bloqueio ou desbloqueio de cliente.
- Acesso a dados clinicos, quando o prontuario existir.

Campos minimos do log:

- Usuario.
- Perfil.
- Cliente/empresa afetada.
- Acao realizada.
- Data e hora.
- Entidade alterada.
- Campo alterado.
- Valor anterior.
- Valor novo.
- Origem da acao, quando aplicavel.

## 4. Importante Pos-MVP

### 4.1 Faturamento basico e inadimplencia

Funcionalidades:

- Cadastro de contratos.
- Valor per capita.
- Pacotes de servico.
- Pacotes de consultas por tipo.
- Geracao de fatura interna.
- Controle de vencimento.
- Status de inadimplencia.
- Bloqueio de cliente inadimplente.
- Acesso liberado apenas para pagamento em caso de bloqueio.

### 4.2 Pacotes e limites de consulta

Funcionalidades:

- Limite mensal por empresa.
- Limite mensal por colaborador.
- Limite por especialidade.
- Consumo de saldo por consulta realizada.
- Consumo de saldo por falta com menos de 12h.
- Pedido de pacote adicional pelo RH.
- Aceite de termo de responsabilidade.
- Lancamento automatico na fatura.

### 4.3 Agenda

Funcionalidades:

- Disponibilidade de profissionais.
- Agendamento por colaborador.
- Regras de entrada por tipo de atendimento.
- Encaminhamento para especialidade.
- Cancelamento/remarcacao.
- Controle de falta.
- Absenteismo.

### 4.4 Pagamento de profissionais

Funcionalidades:

- Tabela de valores por profissional.
- Historico de negociacoes.
- Valor por tipo de consulta.
- Calculo pela data da consulta.
- Inclusao no fechamento apenas apos finalizacao.
- Relatorio mensal de pagamento.

## 5. Preparar Para Futuro

### 5.1 Teleatendimento

Preparar:

- Estrutura de agendamento compativel com videochamada.
- Consentimento para atendimento digital.
- Status de sala.
- Registro de presenca.
- Eventos de inicio e fim da consulta.

Nao fazer no primeiro nucleo:

- Videochamada completa.
- Gravacao de audio.
- Transcricao automatica.

### 5.2 Prontuario multidisciplinar

Preparar:

- Modelo de permissao clinica.
- Separacao entre dados administrativos e dados clinicos.
- Historico imutavel.
- Adendos e retificacoes.
- Encaminhamentos entre especialidades.

### 5.3 Transcricao e IA

Preparar:

- Consentimento do colaborador.
- Status de audio temporario.
- Politica de exclusao apos finalizacao.
- Campo para resumo editavel.
- Registro de revisao humana obrigatoria.

### 5.4 eSocial SST

Preparar:

- Campos compativeis com eventos SST.
- Estrutura de fila futura de eventos.
- Status: pendente, validado, enviado, rejeitado, corrigido e excluido.
- Historico de retorno.

Eventos futuros:

- S-2210.
- S-2220.
- S-2221, quando aplicavel.
- S-2240.
- S-3000.

### 5.5 BI avancado

Preparar:

- Dados bem estruturados.
- Datas e status consistentes.
- Indicadores historicos.
- Possibilidade de visao por grupo, empresa, unidade, setor e periodo.

## 6. Sequencia Recomendada de Desenvolvimento

### Fase 1 - Fundacao

- Autenticacao.
- Multiempresa.
- Perfis e permissoes.
- Cadastro estrutural.
- Logs basicos.

### Fase 2 - NR-01/PGR

- Inventario de riscos.
- Matriz de risco.
- Plano de acao.
- Evidencias.
- Documentos iniciais.

### Fase 3 - Psicossocial

- Campanhas.
- Questionario.
- Percentual de respostas.
- Alerta de 89%.
- Risco inicial.
- Agrupamento de setores.
- Amostragem de entrevistas.
- Validacao final.
- Dashboard agregado.

### Fase 4 - Portal Cliente

- Dashboard RH.
- Consulta de documentos.
- Pendencias cadastrais.
- Indicadores basicos.

### Fase 5 - Operacao comercial e agenda

- Faturamento.
- Inadimplencia.
- Pacotes.
- Agenda.
- Regras de consulta.

### Fase 6 - Saude digital

- Teleatendimento.
- Prontuario.
- Transcricao.
- IA.
- Pagamento de profissionais.

### Fase 7 - Integracoes

- Fila eSocial.
- Envio real eSocial.
- Integracoes futuras com sistemas terceiros.

## 7. Validacoes Pendentes

Antes de iniciar desenvolvimento, ainda e necessario validar:

- Lista de campos obrigatorios do cadastro de colaborador.
- Campos da planilha de importacao.
- Estrutura do questionario psicossocial.
- Formula de pontuacao do risco psicossocial.
- Modelo detalhado de matriz de risco NR-01, partindo de probabilidade x severidade para gerar baixo, moderado, alto e critico.
- Permissoes detalhadas por perfil.
- Primeiros modelos de documentos.
- Regras de bloqueio, desbloqueio e pagamento.
