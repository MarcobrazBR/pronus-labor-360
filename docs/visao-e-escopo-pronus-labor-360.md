# Pronus Labor 360 - Documento de Visao e Escopo

Versao: 0.1  
Data: 2026-04-26  
Status: Descoberta de produto / antes do desenvolvimento

## 1. Contexto

O Pronus Labor 360 sera uma plataforma para gestao de saude ocupacional, seguranca do trabalho, riscos trabalhistas, teleatendimento e conformidade regulatoria para empresas atendidas pela PRONUS LABOR.

Inicialmente, o sistema sera usado pela propria PRONUS e por seus clientes. Ainda assim, deve nascer preparado para evoluir futuramente para um modelo SaaS, possibilitando venda ou licenciamento para outras empresas do ramo.

O produto deve atender as Normas Regulamentadoras vigentes no Brasil, com enfase inicial na NR-01, no Gerenciamento de Riscos Ocupacionais (GRO), no Programa de Gerenciamento de Riscos (PGR), em riscos psicossociais e na preparacao futura para envio de eventos de SST ao eSocial.

## 2. Marca e Posicionamento

Nome do produto: Pronus Labor 360

Slogan institucional: PRONUS LABOR - Saude para pessoas, seguranca para empresas.

Missao:
Cuidar de quem move a empresa: preservar a saude do trabalhador e fortalecer a saude do negocio, reduzindo riscos e criando valor duradouro.

Visao:
Transformar a medicina ocupacional em uma ponte entre pessoas saudaveis e empresas solidas, tornando-se a parceira mais confiavel do mercado.

Posicionamento:
A PRONUS LABOR nao vende apenas atendimentos e sistema de risco. Ela entrega continuidade operacional, reducao de passivos e valorizacao humana.

Valores da marca:

- Equilibrio
- Prevencao
- Etica
- Excelencia tecnica
- Humanizacao
- Parceria
- Confianca

Paleta de cores:

- Primaria: `#457B9D`
- Apoio/acao: `#A8DADC`
- Fundo de tela: `#F1F4F8`
- Texto: `#1D3557`

Direcao visual:

- Portal PRONUS: perfil mais operacional, robusto, denso e eficiente, com cara de ERP moderno.
- Portal RH Cliente: perfil executivo, claro, confiavel e orientado a indicadores.
- Portal Colaborador: perfil simples, acolhedor e healthtech premium, com baixa complexidade.

Os tres portais devem ser visualmente distintos para reduzir risco de acesso indevido ou confusao operacional, mantendo a mesma identidade de marca.

## 3. Publicos do Sistema

### 3.1 Equipe administrativa PRONUS

Responsavel por:

- Cadastro e gestao de grupos empresariais, empresas, unidades, setores, cargos e colaboradores.
- Gestao de contratos, planos, pacotes, faturamento e inadimplencia.
- Insercao e administracao de riscos ocupacionais.
- Acompanhamento de campanhas de questionarios psicossociais.
- Gestao de documentos, evidencias e pendencias.
- Validacao administrativa e operacional de dados sensiveis.

Papeis iniciais:

- Super admin
- Financeiro
- Atendimento
- Tecnico SST
- Medico coordenador
- Profissional de saude
- Suporte

### 3.2 Clientes pessoa juridica

Perfil inicial: RH da empresa cliente.

Responsavel por:

- Consultar documentos legais e ocupacionais emitidos pela PRONUS.
- Acompanhar dashboards de saude ocupacional e risco.
- Ver quantidade de colaboradores cadastrados.
- Ver status de riscos contratados.
- Ver consultas marcadas, realizadas e abandonadas.
- Ver percentual de absenteismo.
- Cadastrar ou importar colaboradores.
- Confirmar ou recusar divergencias cadastrais apresentadas pelos colaboradores.
- Solicitar pacotes adicionais e autorizar aumento de fatura quando aplicavel.

Restricao importante:
O cliente PJ nao tera acesso a prontuarios, anotacoes clinicas, dados psicossociais individuais ou conteudos sigilosos dos atendimentos.

### 3.3 Profissionais de saude PRONUS

Inclui medicos, psicologos, nutricionistas e outras especialidades.

Responsavel por:

- Atender colaboradores por teleatendimento.
- Registrar prontuario multidisciplinar.
- Classificar e validar riscos quando aplicavel.
- Encaminhar colaboradores para outras especialidades.
- Revisar, editar e finalizar resumos gerados por IA.
- Criar adendos/retificacoes apos fechamento de prontuario.

Regra de pagamento:
O pagamento do profissional depende do atendimento estar finalizado. O fechamento financeiro mensal deve considerar o valor contratado na data em que a consulta ocorreu, preservando historico de negociacoes e tabelas profissionais.

### 3.4 Colaboradores das empresas clientes

Responsavel por:

- Acessar o portal com CPF previamente cadastrado.
- Confirmar ou complementar dados cadastrais no primeiro acesso.
- Responder questionarios psicossociais.
- Agendar, cancelar ou remarcar atendimentos conforme regras.
- Participar de teleatendimentos.
- Visualizar agenda e historico simples de consultas realizadas, abandonadas ou pendentes.
- Aceitar termos de LGPD e ciencia sobre ambiente digital.

Restricao:
O colaborador nao acessa o prontuario clinico completo.

## 4. Estrutura Organizacional

O sistema deve suportar a seguinte hierarquia:

Grupo empresarial > Empresa/CNPJ > Unidade > Setor > Cargo > Colaborador

Cada cliente deve ver apenas seus proprios dados. A PRONUS deve ter visao administrativa global, respeitando regras de sigilo clinico e permissoes internas.

O sistema deve ser multiempresa, com isolamento forte de dados, preparado para uso futuro em modelo SaaS.

## 5. MVP Priorizado

O nucleo inicial recomendado e aprovado para o MVP e:

1. Cadastro estrutural de grupos, empresas, unidades, setores, cargos e colaboradores.
2. Gestao NR-01, GRO e PGR.
3. Risco psicossocial com questionario inspirado no COPSOQ e entrevista clinica por amostragem.
4. Dashboards basicos para cliente PJ.
5. Documentos iniciais.
6. Base preparada para teleatendimento, prontuario e eSocial em etapas posteriores.

O MVP nao precisa enviar eventos reais ao eSocial na primeira versao, mas deve ser modelado para permitir fila de eventos, validacao futura e integracao posterior.

Data regulatoria de referencia:
A NR-01 atualizada tem mudancas relevantes com vigencia em 26 de maio de 2026. O sistema deve incorporar essa logica, mesmo que a data de lancamento comercial seja definida separadamente.

Meta desejada:
Lancamento em meados de maio de 2026, caso o escopo esteja validado e tecnicamente consistente.

## 6. Modulos Principais

### 6.1 Administracao PRONUS

Funcionalidades:

- Gestao de usuarios internos.
- Gestao de grupos empresariais e empresas.
- Gestao de unidades, setores, cargos e colaboradores.
- Gestao de permissoes.
- Acompanhamento de campanhas psicossociais.
- Controle de pendencias.
- Logs e auditoria.
- Gestao de documentos e evidencias.

### 6.2 Portal RH Cliente

Funcionalidades:

- Dashboard executivo.
- Cadastro manual de colaboradores.
- Importacao de colaboradores por planilha.
- Consulta de documentos legais.
- Consulta de riscos agregados.
- Acompanhamento de consultas e absenteismo.
- Confirmacao de divergencias cadastrais.
- Solicitacao de pacotes adicionais.
- Acesso a area de pagamento em caso de bloqueio por inadimplencia.

### 6.3 Portal Colaborador

Funcionalidades:

- Acesso por CPF com cadastro previo.
- Primeiro acesso com validacao/complementacao de dados.
- Aceite de termos LGPD e ambiente digital.
- Resposta de questionarios psicossociais.
- Agendamento de atendimentos permitidos.
- Cancelamento/remarcacao conforme regras.
- Acesso a teleatendimento.
- Historico simples de consultas.

### 6.4 Gestao NR-01 / GRO / PGR

Funcionalidades:

- Inventario de riscos.
- Matriz de risco.
- Plano de acao.
- Evidencias.
- Classificacao por pessoa, setor e empresa.
- Nivel de risco NR-01 por empresa, derivado dos setores.
- Controle de responsaveis tecnicos.
- Historico completo de alteracoes.

### 6.5 Risco Psicossocial

Funcionalidades:

- Campanhas com data de inicio e fim.
- Questionario para todos os colaboradores da empresa participante.
- Risco inicial por colaborador, setor e empresa.
- Indicadores em formato de farol.
- Alerta quando 89% dos colaboradores responderem.
- Alerta ao final do prazo caso 89% nao seja atingido.
- Decisao do analista PRONUS sobre encerrar ou prorrogar campanha.
- Sugestao automatica de agrupamento de setores com menos de 5 pessoas.
- Confirmacao manual do agrupamento pela equipe PRONUS.
- Selecao aleatoria de colaboradores para entrevista clinica, priorizando niveis mais altos de risco.
- Validacao final por psicologo, com possibilidade de ajuste do risco.

Niveis de risco psicossocial:

- Baixo
- Moderado
- Alto
- Critico

Regra de privacidade:
A PRONUS pode visualizar risco individual quando necessario para operacao tecnica e clinica. O cliente PJ visualiza apenas dados agregados por setor. Quando um setor tiver menos de 5 pessoas, o sistema deve exigir agrupamento com outro(s) setor(es) antes de mostrar indicador ao cliente.

### 6.6 Teleatendimento e Prontuario

Embora nao seja o primeiro nucleo do MVP, o sistema deve ser preparado para:

- Teleatendimento dentro da plataforma.
- Nao gravar video.
- Gravar audio temporariamente para transcricao e resumo.
- Apagar audio apos finalizacao do prontuario.
- Usar IA para transcrever e resumir a consulta.
- Exigir revisao do profissional antes de salvar.
- Permitir edicao livre do resumo antes do fechamento.
- Impedir alteracao direta apos finalizacao.
- Permitir adendo/retificacao com autor, data, hora e justificativa.
- Prontuario integrado multidisciplinar.
- Encaminhamento entre especialidades.

Fluxo de encaminhamento:
Um medico, psicologo ou nutricionista pode identificar necessidade de outra especialidade, informar o colaborador e agendar ou solicitar consulta com outro profissional. O proximo profissional deve ter acesso as observacoes autorizadas e pertinentes do atendimento anterior.

### 6.7 Agenda e Regras de Consulta

Regras:

- Todo fluxo inicia por acolhimento psicologico, clinico geral ou nutricao.
- Especialidades como psiquiatria, psicoterapia e outras consultas medicas dependem de autorizacao ou encaminhamento.
- Cada cliente pode ter limites mensais por especialidade.
- Cada colaborador pode ter limites mensais de atendimento, conforme contrato.
- Cancelamento/remarcacao livre pelo colaborador apenas com 24 horas ou mais de antecedencia.
- Entre 24h e 12h antes, o colaborador deve falar com atendimento PRONUS.
- Menos de 12h antes conta como falta, impacta absenteismo e consome saldo do pacote.
- A PRONUS pode tentar ocupar horario vago com colaborador de qualquer empresa.

### 6.8 Faturamento e Contratos

Modelo:

- Faturamento por CNPJ.
- Composicao por valor per capita por colaborador ativo.
- Pacotes de servico.
- Pacotes de consultas por tipo/especialidade.
- Pacotes adicionais solicitados pelo cliente.

Regras:

- Inadimplencia bloqueia o acesso ao sistema, preservando apenas a area de pagamento.
- Pacotes sao consumidos por tipo de consulta.
- Falta com menos de 12h consome saldo do pacote.
- Cliente pode solicitar pacote adicional pelo sistema.
- A solicitacao de pacote adicional exige termo de responsabilidade do RH, confirmando ciencia de aumento da fatura.
- Apos aceite, o sistema pode lancar o valor adicional na fatura do cliente.

### 6.9 Pagamento de Profissionais

Regras:

- Cada profissional possui tabela de valores.
- A tabela deve guardar historico de negociacoes.
- O calculo considera a data em que a consulta ocorreu, nao a data em que foi finalizada.
- Consulta so entra no fechamento quando estiver finalizada.
- Relatorio mensal deve consolidar quantidade de consultas, tipos, valores unitarios historicos e total a pagar.

### 6.10 Documentos

Documentos prioritarios do MVP:

- ASO
- PGR
- Relatorio psicossocial agregado
- Plano de acao
- Inventario de riscos
- Termo LGPD

No MVP, os documentos podem ser emitidos em PDF com identificacao do responsavel tecnico, sem assinatura digital.

Os modelos serao criados do zero.

### 6.11 eSocial / SST

Na primeira versao, o sistema deve estar preparado para futura integracao, mas nao precisa enviar eventos reais.

Eventos prioritarios de SST para modelagem futura:

- S-2210: Comunicacao de Acidente de Trabalho
- S-2220: Monitoramento da Saude do Trabalhador
- S-2221: Exame toxicologico do motorista profissional empregado, quando aplicavel
- S-2240: Condicoes Ambientais do Trabalho - Agentes Nocivos
- S-3000: Exclusao de eventos

Direcao inicial:

- Criar base de dados compativel com informacoes exigidas.
- Preparar fila futura de eventos.
- Permitir validacao interna antes de envio.
- Nao priorizar integracoes com sistemas terceiros de RH/folha no MVP.
- Importacao inicial de colaboradores pode ocorrer por planilha ou cadastro manual.

## 7. Regras de Seguranca, LGPD e Auditoria

O sistema deve nascer com preocupacao forte de seguranca, pois lidara com dados de saude, documentos ocupacionais e informacoes trabalhistas sensiveis.

Requisitos:

- Controle de acesso por perfil.
- Isolamento de dados por cliente.
- Logs de acesso e alteracao.
- Trilha de auditoria para prontuario, riscos, faturamento, contratos, pacotes e alteracoes cadastrais relevantes.
- Registro de quem fez, quando fez e quais campos foram alterados.
- Consentimentos digitais.
- Criptografia de dados sensiveis, sempre que tecnicamente aplicavel.
- Separacao clara entre dados clinicos sigilosos e dados administrativos.

Regra especifica para divergencia cadastral:

- O colaborador pode informar dados no primeiro acesso.
- Se houver divergencia com o cadastro da empresa, o sistema sinaliza ao RH.
- Enquanto houver divergencia cadastral pendente, o colaborador fica bloqueado para responder questionarios e usar funcionalidades internas.
- O RH pode confirmar ou recusar os dados.
- Dados simples podem ser aceitos diretamente pelo RH.
- Dados sensiveis ligados a eSocial/SST devem entrar em fila de conferencia da PRONUS.
- Mesmo quando houver conferencia da PRONUS, o log deve registrar o RH como aprovador da mudanca, pois a responsabilidade pela confirmacao e do cliente.
- O log tambem pode registrar a conferencia feita pela PRONUS como etapa operacional separada.

Cadastro minimo do colaborador:

- O cadastro inicial deve ser orientado pelos requisitos do eSocial, especialmente dados usados em eventos de trabalhador e SST.
- Campos iniciais esperados: CPF, nome completo, data de nascimento, sexo, telefone/WhatsApp, e-mail, empresa/CNPJ, unidade, setor, cargo, matricula, categoria do trabalhador, data de admissao e status.
- Deve haver campos para o RH informar beneficios de saude disponiveis ao colaborador, como plano medico, plano odontologico e seguro de vida.
- A lista final de campos deve ser validada contra os leiautes oficiais vigentes do eSocial antes da modelagem definitiva.

Regra especifica para questionario psicossocial:

- O questionario e identificado internamente pela PRONUS para permitir entrevistas e validacao tecnica.
- Para analise estatistica e exibicao ao cliente, os dados devem ser tratados de forma agregada.
- Apenas perfis autorizados, como profissional de saude e gerente, podem visualizar nome da pessoa junto com respostas individuais.

## 8. Dashboards Iniciais

### 8.1 Cliente PJ

Indicadores minimos:

- Total de colaboradores cadastrados.
- Riscos contratados/cobertos.
- Status de risco por farol: baixo, moderado, alto e critico.
- Visao por setor, respeitando agrupamento minimo de 5 pessoas para risco psicossocial.
- Consultas agendadas, quando o modulo de agenda estiver ativo.
- Consultas realizadas, quando o modulo de agenda estiver ativo.
- Consultas abandonadas/faltas, quando o modulo de agenda estiver ativo.
- Percentual de absenteismo, quando o modulo de agenda estiver ativo.

Observacao:
O percentual de respostas de campanhas psicossociais nao deve aparecer no dashboard do cliente. Esse indicador deve ficar restrito ao operador administrativo da PRONUS.

Formula inicial de absenteismo:
Consultas faltadas / total de consultas agendadas.

Exemplo:
100 consultas agendadas e 10 faltas = 10% de absenteismo.

### 8.2 PRONUS

Indicadores desejados:

- Campanhas psicossociais em andamento.
- Empresas com prazo proximo de encerramento.
- Empresas abaixo de 89% de resposta.
- Empresas acima de 89% aguardando decisao do analista.
- Pendencias de agrupamento de setor.
- Pendencias de entrevista clinica.
- Pendencias de validacao final do psicologo.
- Clientes inadimplentes.
- Consultas pendentes de finalizacao.
- Fechamento mensal de profissionais.

## 9. Arquitetura Recomendada

Direcao aprovada:

- Monorepo.
- Node.js + TypeScript no backend.
- React.js + Tailwind no frontend.
- PostgreSQL como banco principal.
- Possibilidade de usar Supabase ou servicos equivalentes para acelerar autenticacao, storage e infraestrutura, desde que tudo seja documentado e seguro.
- Hospedagem preferencial futura: AWS, com possibilidade de uso de servicos Google para ferramentas administrativas.

Portais:

1. Portal PRONUS
2. Portal RH Cliente
3. Portal Colaborador

Todos os portais compartilham a mesma base e regras de seguranca, mas devem ter experiencias visuais e fluxos distintos.

## 10. Decisoes Ja Tomadas

- O sistema sera multiempresa.
- A PRONUS tera visao administrativa global.
- Cliente PJ vera apenas seus proprios dados.
- Prontuario e dados clinicos nao serao visiveis para empresa cliente.
- Risco psicossocial individual nao sera visivel para empresa cliente.
- Colaborador com divergencia cadastral pendente fica bloqueado ate validacao do RH.
- Setores com menos de 5 pessoas precisam ser agrupados para exibicao ao cliente.
- COPSOQ ou questionario inspirado no COPSOQ sera aplicado a todos os colaboradores no processo psicossocial.
- Atingir 89% de respostas gera alerta para analista PRONUS.
- Percentual de respostas de campanha psicossocial fica visivel apenas para a operacao PRONUS, nao para o cliente.
- O analista decide encerrar ou prorrogar campanhas.
- Entrevistas clinicas serao por amostragem aleatoria, priorizando riscos mais altos.
- Psicologo valida ou ajusta risco final.
- Teleatendimento sera dentro da plataforma em etapa futura.
- Video nao sera gravado.
- Audio sera gravado temporariamente ate finalizacao do prontuario.
- IA podera transcrever e resumir, mas profissional deve revisar antes de salvar.
- Prontuario finalizado nao deve ser editado diretamente; deve receber adendo/retificacao.
- Inadimplencia bloqueia tudo, exceto area de pagamento.
- Faturamento sera por CNPJ, com per capita e pacotes.
- Pacotes de consulta sao consumidos por tipo.
- Pacote adicional pode ser solicitado pelo sistema mediante aceite do RH.
- MVP nao precisa assinatura digital.
- MVP nao precisa enviar eSocial real, mas deve preparar modelagem.

## 11. Pontos Que Ainda Precisam Ser Detalhados

Antes do desenho tecnico completo, ainda sera necessario definir:

- Campos obrigatorios da planilha de importacao de colaboradores.
- Estrutura exata do questionario psicossocial.
- Metodo de calculo dos niveis baixo, moderado, alto e critico.
- Modelo de matriz de risco para NR-01/PGR.
- Modelos de ASO, PGR, relatorio psicossocial, plano de acao, inventario de riscos e termo LGPD.
- Regras detalhadas de contrato e precificacao.
- Regras de bloqueio e reativacao por inadimplencia.
- Perfis e permissoes em nivel granular.
- Politica de retencao de documentos e prontuarios.
- Provedor futuro de videochamada.
- Provedor futuro de transcricao e resumo por IA.
- Estrategia de armazenamento seguro de anexos.
- Estrutura futura de fila e envio eSocial.

## 12. Proximos Passos Recomendados

1. Validar este documento de visao e escopo.
2. Criar matriz de modulos do MVP com prioridade: essencial, importante e futuro.
3. Desenhar fluxos principais:
   - Cadastro de empresa e colaborador.
   - Campanha psicossocial.
   - Agrupamento de setores com menos de 5 pessoas.
   - Validacao por psicologo.
   - Dashboard do cliente.
   - Faturamento e bloqueio por inadimplencia.
4. Definir modelo de dados inicial.
5. Definir arquitetura do monorepo.
6. Criar wireframes/telas iniciais.
7. Iniciar desenvolvimento apenas apos validacao da fundacao do produto.
