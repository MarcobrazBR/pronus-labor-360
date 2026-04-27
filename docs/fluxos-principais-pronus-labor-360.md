# Pronus Labor 360 - Fluxos Principais

Versao: 0.1  
Data: 2026-04-26  
Status: Planejamento funcional

## 1. Objetivo

Este documento descreve os fluxos operacionais mais importantes do Pronus Labor 360 antes do desenho tecnico e do desenvolvimento.

Os fluxos foram escritos em linguagem pratica para facilitar validacao de produto, regras de negocio, permissoes e pontos de auditoria.

## 2. Fluxo 1 - Cadastro de Cliente, Estrutura e Colaboradores

### Objetivo

Criar a base organizacional necessaria para NR-01, PGR, risco psicossocial, dashboards, documentos e futura integracao eSocial.

### Participantes

- Equipe PRONUS.
- RH Cliente.

### Passos

1. PRONUS cadastra grupo empresarial.
2. PRONUS cadastra uma ou mais empresas/CNPJs dentro do grupo.
3. PRONUS ou RH Cliente cadastra unidades.
4. PRONUS ou RH Cliente cadastra setores.
5. PRONUS ou RH Cliente cadastra cargos.
6. PRONUS ou RH Cliente cadastra colaboradores manualmente ou por planilha.
7. Sistema valida campos obrigatorios.
8. Sistema vincula cada colaborador a empresa, unidade, setor e cargo.
9. Sistema registra logs das criacoes e alteracoes relevantes.

### Regras

- Todo colaborador precisa estar vinculado a um CNPJ.
- Todo colaborador precisa ter CPF.
- O CPF sera usado como chave de acesso inicial do colaborador.
- O cadastro minimo deve ser orientado pelos leiautes oficiais vigentes do eSocial.
- O cadastro deve incluir telefone/WhatsApp e beneficios de saude informados pelo RH.
- O cliente so ve sua propria estrutura.
- A PRONUS ve a estrutura de todos os clientes conforme permissao interna.

### Pendencias de definicao

- Campos obrigatorios da empresa.
- Campos obrigatorios do colaborador com base no eSocial.
- Layout da planilha de importacao.
- Campos exigidos desde ja para preparacao futura do eSocial.

## 3. Fluxo 2 - Primeiro Acesso do Colaborador e Divergencia Cadastral

### Objetivo

Permitir que o colaborador acesse o sistema, confirme seus dados e gere pendencia ao RH quando houver divergencia.

### Participantes

- Colaborador.
- RH Cliente.
- PRONUS, quando houver dados sensiveis.

### Passos

1. Colaborador acessa o portal informando CPF.
2. Sistema verifica se CPF existe e esta ativo.
3. Se CPF nao existir, sistema nega acesso e orienta contato com RH.
4. Se CPF existir, sistema solicita criacao de senha e aceite dos termos necessarios.
5. Colaborador preenche ou confirma dados cadastrais.
6. Sistema compara os dados informados com o cadastro existente.
7. Se nao houver divergencia, acesso e liberado.
8. Se houver divergencia, sistema bloqueia o colaborador e cria pendencia para o RH.
9. RH analisa a divergencia.
10. RH confirma ou recusa os dados enviados pelo colaborador.
11. Para dados sensiveis ligados a SST/eSocial, sistema envia para conferencia operacional da PRONUS.
12. Sistema registra log da decisao do RH e da conferencia da PRONUS, quando houver.

### Regras

- O RH e responsavel por aprovar ou recusar dados do colaborador.
- A PRONUS pode conferir dados sensiveis, mas nao substitui a responsabilidade de aprovacao do RH.
- Se o RH recusar, os dados enviados pelo colaborador sao descartados e o acesso pode ser bloqueado com mensagem para procurar o RH.
- Toda divergencia deve manter historico.
- Enquanto a divergencia estiver pendente, o colaborador nao pode responder questionario psicossocial nem usar funcionalidades internas.

### Logs obrigatorios

- Usuario RH que aprovou ou recusou.
- Data e hora.
- Campos alterados.
- Valor anterior.
- Valor novo.
- Status da conferencia PRONUS, quando houver.

## 4. Fluxo 3 - Campanha Psicossocial

### Objetivo

Aplicar questionario psicossocial a todos os colaboradores de uma empresa, monitorar adesao, calcular risco inicial e preparar analise tecnica.

### Participantes

- Analista PRONUS.
- Psicologo PRONUS.
- RH Cliente.
- Colaboradores.

### Passos

1. PRONUS cria campanha psicossocial para uma empresa/CNPJ.
2. PRONUS define data de inicio e fim.
3. Sistema identifica colaboradores ativos elegiveis.
4. RH Cliente emite comunicado interno orientando os colaboradores a acessarem a ferramenta.
5. Colaboradores acessam o portal e respondem o questionario.
6. Sistema calcula percentual de respostas.
7. Ao atingir 89% de respostas, sistema alerta o analista PRONUS.
8. Analista avalia se encerra ou mantem a campanha aberta ate a data final.
9. Se o prazo final chegar sem 89%, sistema alerta o analista.
10. Analista conversa com a empresa para decidir prorrogar ou encerrar.
11. Ao encerrar, sistema calcula risco inicial.
12. Sistema prepara resultados para avaliacao do analista e do psicologo.

### Regras

- O questionario e aplicado a todos os colaboradores elegiveis.
- O cliente nao ve respostas individuais.
- O cliente nao ve risco individual.
- O resultado inicial ainda nao e necessariamente o risco final.
- O risco final pode ser validado ou ajustado apos entrevistas clinicas.
- Apenas perfis autorizados, como profissional de saude e gerente, podem visualizar nome da pessoa junto com respostas individuais.

### Saidas

- Percentual de respostas.
- Risco inicial por colaborador para uso interno PRONUS.
- Risco inicial por setor para uso tecnico.
- Risco agregado para painel do cliente, apos regras de privacidade.

## 5. Fluxo 4 - Agrupamento de Setores com Menos de 5 Pessoas

### Objetivo

Proteger a identidade dos colaboradores em setores pequenos antes de exibir risco psicossocial ao cliente.

### Participantes

- Analista PRONUS.
- Sistema.

### Passos

1. Sistema identifica setores com menos de 5 colaboradores elegiveis/respondentes.
2. Sistema impede exibicao isolada desses setores no painel do cliente.
3. Sistema sugere agrupamento com outro(s) setor(es).
4. Analista PRONUS revisa sugestao.
5. Analista confirma ou altera agrupamento.
6. Sistema recalcula indicador agregado.
7. Sistema libera exibicao ao cliente somente quando o agrupamento cumprir a regra minima.

### Regras

- Pode agrupar mais de dois setores.
- A equipe PRONUS decide o agrupamento final.
- O agrupamento deve ficar registrado para auditoria.
- O cliente deve ver apenas o grupo agregado, sem expor resultado isolado de setor pequeno.

### Logs obrigatorios

- Setores agrupados.
- Usuario que confirmou.
- Data e hora.
- Justificativa opcional ou obrigatoria, a definir.

## 6. Fluxo 5 - Entrevistas Psicossociais e Validacao Final

### Objetivo

Permitir que o psicologo valide ou ajuste o risco psicossocial inicial gerado pelo questionario.

### Participantes

- Analista PRONUS.
- Psicologo PRONUS.
- Colaboradores selecionados.

### Passos

1. Apos resultado inicial, analista e psicologo avaliam se havera entrevistas.
2. Psicologo ou analista informa a quantidade desejada de entrevistas.
3. Sistema seleciona colaboradores aleatoriamente.
4. A selecao prioriza colaboradores ou setores com niveis mais altos de risco.
5. PRONUS agenda entrevistas.
6. Psicologo realiza entrevistas.
7. Psicologo registra conclusao tecnica.
8. Psicologo valida o risco inicial ou ajusta o risco final.
9. Sistema atualiza resultado final.
10. Sistema gera dados agregados para relatorio e dashboard do cliente.

### Regras

- A selecao deve ter componente aleatorio para reduzir vies.
- A priorizacao por risco alto ajuda a focar onde ha maior sinal de alerta.
- Cliente nao visualiza quem foi entrevistado nem conteudo da entrevista.
- Ajuste de risco deve exigir justificativa tecnica.

### Saidas

- Risco final por colaborador para uso interno autorizado.
- Risco final por setor, respeitando agrupamentos.
- Risco final da empresa.
- Base para relatorio psicossocial agregado.

## 7. Fluxo 6 - Gestao NR-01 / PGR

### Objetivo

Montar e acompanhar inventario de riscos, matriz, plano de acao e evidencias.

### Participantes

- Tecnico SST PRONUS.
- Engenheiro/tecnico de seguranca.
- Profissionais autorizados PRONUS.
- RH Cliente como visualizador.

### Passos

1. PRONUS identifica estrutura da empresa: unidades, setores, cargos e colaboradores.
2. PRONUS cadastra perigos e riscos ocupacionais.
3. PRONUS associa riscos a unidades, setores, cargos ou colaboradores.
4. PRONUS classifica probabilidade e severidade.
5. Sistema calcula ou apoia a classificacao do nivel de risco.
6. PRONUS define medidas de controle.
7. PRONUS cria plano de acao.
8. PRONUS anexa evidencias.
9. Sistema acompanha prazos, responsaveis e status.
10. Sistema gera inventario, plano de acao e documentos relacionados.
11. Cliente consulta documentos e indicadores.

### Regras

- Cliente nao classifica risco tecnico.
- Cliente pode visualizar documentos e status.
- Alteracoes devem gerar historico.
- Evidencias devem ficar vinculadas ao risco, acao ou documento correspondente.

## 8. Fluxo 7 - Dashboard RH Cliente

### Objetivo

Apresentar ao RH uma visao simples, confiavel e juridicamente segura do status da empresa.

### Participantes

- RH Cliente.

### Passos

1. RH acessa portal cliente.
2. Sistema verifica status financeiro e permissao.
3. Se cliente estiver inadimplente, sistema bloqueia acesso geral e exibe area de pagamento.
4. Se cliente estiver regular, sistema exibe dashboard.
5. Dashboard mostra dados agregados permitidos.
6. RH acessa documentos, pendencias e indicadores.

### Indicadores iniciais

- Colaboradores cadastrados.
- Colaboradores ativos.
- Riscos contratados.
- Status de risco por farol.
- Risco por setor ou grupo de setores.
- Consultas agendadas, realizadas e faltas quando agenda estiver ativa.
- Absenteismo quando agenda estiver ativa.

### Regras

- Nenhum prontuario e exibido.
- Nenhuma resposta individual de questionario e exibida.
- Nenhum risco psicossocial individual e exibido.
- Percentual de resposta da campanha psicossocial nao e exibido ao cliente; ele fica restrito a operacao PRONUS.
- Setores pequenos so aparecem agrupados.

## 9. Fluxo 8 - Documentos

### Objetivo

Gerar e disponibilizar documentos legais e operacionais.

### Participantes

- PRONUS.
- RH Cliente.

### Passos

1. PRONUS gera documento a partir dos dados do sistema.
2. Sistema aplica modelo correspondente.
3. Sistema inclui identificacao do responsavel tecnico quando aplicavel.
4. PRONUS revisa.
5. PRONUS publica documento.
6. RH Cliente acessa documento no portal.
7. Sistema registra emissao e acesso quando aplicavel.

### Documentos iniciais

- ASO.
- PGR.
- Relatorio psicossocial agregado.
- Plano de acao.
- Inventario de riscos.
- Termo LGPD.

### Regras

- MVP nao exige assinatura digital.
- Republicacao deve gerar nova versao.
- Versoes anteriores devem ficar preservadas.

## 10. Fluxo 9 - Faturamento, Pacotes e Bloqueio

### Objetivo

Controlar contratos, pacotes, inadimplencia e autorizacao de custos adicionais.

### Participantes

- Financeiro PRONUS.
- RH Cliente.

### Passos

1. PRONUS cadastra contrato do cliente.
2. PRONUS define valor per capita e pacotes contratados.
3. Sistema calcula valores de referencia.
4. Cliente usa servicos conforme contrato.
5. RH Cliente pode solicitar pacote adicional.
6. Sistema exibe termo de responsabilidade e aumento de fatura.
7. RH aceita o termo.
8. Sistema registra aceite e lanca adicional na fatura.
9. Se cliente ficar inadimplente, sistema bloqueia acesso geral.
10. Cliente mantem apenas acesso a area de pagamento.
11. Apos regularizacao, sistema desbloqueia.

### Regras

- Bloqueio por inadimplencia bloqueia tudo, exceto pagamento.
- Pacotes de consulta sao separados por tipo.
- Saldo de uma especialidade nao substitui outra.
- Falta com menos de 12h consome saldo.

## 11. Fluxo 10 - Preparacao Futura Para eSocial

### Objetivo

Garantir que a modelagem inicial nao bloqueie envio futuro de SST ao eSocial.

### Participantes

- PRONUS.
- Cliente.
- eSocial em etapa futura.

### Passos futuros

1. Sistema identifica eventos SST geraveis.
2. Sistema cria evento em fila.
3. PRONUS valida dados.
4. Sistema prepara payload conforme leiaute vigente.
5. Sistema envia ao eSocial em nome do cliente.
6. Sistema registra retorno.
7. Sistema permite correcao, reenvio ou exclusao quando necessario.

### Eventos prioritarios futuros

- S-2210.
- S-2220.
- S-2221, quando aplicavel.
- S-2240.
- S-3000.

### Regras iniciais

- MVP nao precisa enviar eventos reais.
- O cadastro deve guardar dados suficientes para evitar retrabalho.
- A fila deve ser pensada no desenho tecnico, mesmo que nao implementada completa no inicio.

## 12. Proximas Validacoes

Os fluxos acima precisam ser validados antes de desenhar banco de dados e telas.

Pontos principais:

- O colaborador deve ter acesso limitado enquanto uma divergencia cadastral estiver pendente?
- Quais campos de colaborador sao considerados sensiveis para SST/eSocial?
- Qual sera a formula inicial do risco psicossocial?
- Qual matriz detalhada de risco sera usada na NR-01/PGR, partindo de probabilidade x severidade?
- Quais campos aparecerao no dashboard do cliente no primeiro release?
- Como sera o layout dos primeiros documentos?
