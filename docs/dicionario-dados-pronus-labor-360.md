# Pronus Labor 360 - Dicionario de Dados Inicial

Versao: 0.1  
Data: 2026-04-26  
Status: Dicionario inicial para validacao

## 1. Objetivo

Este documento explica, em portugues, o significado das principais tabelas e campos do Pronus Labor 360.

Mesmo que o banco de dados e o codigo usem nomes em ingles tecnico, este dicionario permite que usuarios de negocio, gestores e equipe PRONUS entendam o que esta sendo guardado no sistema.

## 2. Convencoes

- `id`: identificador unico do registro.
- `created_at`: data e hora em que o registro foi criado.
- `updated_at`: data e hora da ultima alteracao.
- `status`: situacao atual do registro.
- Campos terminados em `_id`: indicam ligacao com outra tabela.
- Campos terminados em `_at`: indicam data e hora de um evento.
- Campos terminados em `_by_user_id`: indicam qual usuario realizou uma acao.

## 3. Identidade e Acesso

### 3.1 users

Tabela que representa todas as pessoas que acessam o sistema.

| Campo | Significado |
| --- | --- |
| id | Identificador unico do usuario. |
| name | Nome do usuario. |
| email | E-mail usado para contato e/ou login. |
| cpf | CPF do usuario, usado especialmente para colaboradores. |
| phone | Telefone de contato. |
| password_hash | Senha criptografada, quando a autenticacao nao for totalmente externa. |
| user_type | Tipo geral de usuario: PRONUS, RH cliente, profissional de saude ou colaborador. |
| status | Situacao do usuario: ativo, inativo, bloqueado etc. |
| last_login_at | Ultima data/hora em que o usuario entrou no sistema. |
| created_at | Data/hora de criacao. |
| updated_at | Data/hora da ultima atualizacao. |

### 3.2 roles

Tabela que representa os papeis de acesso.

Exemplos: Super admin, Financeiro, Atendimento, Tecnico SST, Profissional de saude, RH Cliente e Colaborador.

| Campo | Significado |
| --- | --- |
| id | Identificador unico do papel. |
| name | Nome do papel. |
| description | Explicacao do que esse papel faz. |
| scope | Abrangencia do papel: global PRONUS, empresa cliente ou colaborador. |
| created_at | Data/hora de criacao. |
| updated_at | Data/hora da ultima atualizacao. |

### 3.3 permissions

Tabela que representa permissoes especificas.

| Campo | Significado |
| --- | --- |
| id | Identificador unico da permissao. |
| key | Codigo tecnico da permissao. |
| description | Explicacao da permissao. |
| created_at | Data/hora de criacao. |
| updated_at | Data/hora da ultima atualizacao. |

### 3.4 user_roles

Tabela que liga usuarios aos papeis.

| Campo | Significado |
| --- | --- |
| id | Identificador unico do vinculo. |
| user_id | Usuario que recebeu o papel. |
| role_id | Papel atribuido ao usuario. |
| organization_group_id | Grupo empresarial ao qual o papel se aplica, quando houver. |
| company_id | Empresa/CNPJ ao qual o papel se aplica, quando houver. |
| created_at | Data/hora de criacao. |

### 3.5 role_permissions

Tabela que liga papeis a permissoes.

| Campo | Significado |
| --- | --- |
| id | Identificador unico do vinculo. |
| role_id | Papel que recebe a permissao. |
| permission_id | Permissao concedida ao papel. |

## 4. Estrutura Organizacional

### 4.1 organization_groups

Tabela que representa grupos empresariais.

Exemplo: um grupo economico que possui varias empresas/CNPJs.

| Campo | Significado |
| --- | --- |
| id | Identificador unico do grupo. |
| name | Nome comercial do grupo. |
| legal_name | Razao social ou nome juridico, quando aplicavel. |
| status | Situacao do grupo no sistema. |
| created_at | Data/hora de criacao. |
| updated_at | Data/hora da ultima atualizacao. |

### 4.2 companies

Tabela que representa empresas/CNPJs.

| Campo | Significado |
| --- | --- |
| id | Identificador unico da empresa. |
| organization_group_id | Grupo empresarial ao qual a empresa pertence. |
| trade_name | Nome fantasia. |
| legal_name | Razao social. |
| cnpj | CNPJ da empresa. |
| state_registration | Inscricao estadual, quando houver. |
| municipal_registration | Inscricao municipal, quando houver. |
| cnae_main | CNAE principal da empresa. |
| risk_grade | Grau de risco da empresa, quando aplicavel. |
| address fields | Campos de endereco da empresa. |
| status | Situacao da empresa no sistema. |
| created_at | Data/hora de criacao. |
| updated_at | Data/hora da ultima atualizacao. |

### 4.3 company_units

Tabela que representa unidades ou locais de trabalho.

| Campo | Significado |
| --- | --- |
| id | Identificador unico da unidade. |
| company_id | Empresa/CNPJ ao qual a unidade pertence. |
| name | Nome da unidade. |
| code | Codigo interno da unidade. |
| address fields | Endereco da unidade. |
| status | Situacao da unidade. |
| created_at | Data/hora de criacao. |
| updated_at | Data/hora da ultima atualizacao. |

### 4.4 departments

Tabela que representa setores.

| Campo | Significado |
| --- | --- |
| id | Identificador unico do setor. |
| company_id | Empresa/CNPJ ao qual o setor pertence. |
| company_unit_id | Unidade onde o setor esta localizado. |
| name | Nome do setor. |
| code | Codigo interno do setor. |
| status | Situacao do setor. |
| created_at | Data/hora de criacao. |
| updated_at | Data/hora da ultima atualizacao. |

### 4.5 job_positions

Tabela que representa cargos.

| Campo | Significado |
| --- | --- |
| id | Identificador unico do cargo. |
| company_id | Empresa/CNPJ ao qual o cargo pertence. |
| department_id | Setor ao qual o cargo esta vinculado. |
| title | Nome do cargo. |
| cbo_code | Codigo CBO do cargo, importante para documentos e eSocial futuro. |
| description | Descricao das atividades do cargo. |
| status | Situacao do cargo. |
| created_at | Data/hora de criacao. |
| updated_at | Data/hora da ultima atualizacao. |

## 5. Colaboradores

### 5.1 employees

Tabela que representa colaboradores das empresas clientes.

| Campo | Significado |
| --- | --- |
| id | Identificador unico do colaborador. |
| user_id | Usuario de acesso vinculado ao colaborador. |
| company_id | Empresa/CNPJ do colaborador. |
| company_unit_id | Unidade do colaborador. |
| department_id | Setor do colaborador. |
| job_position_id | Cargo do colaborador. |
| cpf | CPF do colaborador. |
| full_name | Nome completo. |
| social_name | Nome social, quando houver. |
| birth_date | Data de nascimento. |
| sex | Sexo informado no cadastro. |
| email | E-mail do colaborador. |
| phone | Telefone. |
| whatsapp | Numero de WhatsApp. |
| employee_registration | Matricula do colaborador na empresa. |
| worker_category_code | Categoria do trabalhador, orientada ao eSocial. |
| admission_date | Data de admissao. |
| employment_status | Situacao do vinculo: ativo, desligado, afastado etc. |
| has_medical_plan | Indica se possui plano medico informado pelo RH. |
| has_dental_plan | Indica se possui plano odontologico informado pelo RH. |
| has_life_insurance | Indica se possui seguro de vida informado pelo RH. |
| first_access_completed_at | Data/hora em que o colaborador concluiu o primeiro acesso. |
| registration_status | Situacao cadastral: valido, pendente, bloqueado etc. |
| created_at | Data/hora de criacao. |
| updated_at | Data/hora da ultima atualizacao. |

### 5.2 employee_registration_changes

Tabela que guarda divergencias ou propostas de alteracao cadastral feitas pelo colaborador.

| Campo | Significado |
| --- | --- |
| id | Identificador unico da solicitacao de alteracao. |
| employee_id | Colaborador relacionado. |
| submitted_by_user_id | Usuario que enviou a alteracao, geralmente o colaborador. |
| reviewed_by_user_id | Usuario RH que aprovou ou recusou. |
| pronus_checked_by_user_id | Usuario PRONUS que conferiu dados sensiveis, quando necessario. |
| status | Situacao: pendente RH, pendente PRONUS, aprovado ou recusado. |
| submitted_data | Dados enviados pelo colaborador. |
| approved_data | Dados aprovados pelo RH. |
| rejected_reason | Motivo da recusa, quando houver. |
| requires_pronus_check | Indica se exige conferencia operacional da PRONUS. |
| created_at | Data/hora de criacao. |
| reviewed_at | Data/hora da decisao do RH. |
| pronus_checked_at | Data/hora da conferencia PRONUS. |

Regras:

- Telefone, e-mail e endereco podem ser aprovados somente pelo RH.
- Cargo, setor, data de admissao, matricula e categoria do trabalhador exigem conferencia operacional da PRONUS.
- Mesmo quando houver conferencia PRONUS, o RH continua sendo o aprovador formal.
- Enquanto a divergencia estiver pendente, o colaborador fica bloqueado para responder questionarios e usar funcionalidades internas.

## 6. Auditoria

### 6.1 audit_logs

Tabela que guarda historico de acoes importantes.

| Campo | Significado |
| --- | --- |
| id | Identificador unico do log. |
| actor_user_id | Usuario que realizou a acao. |
| actor_role | Papel do usuario no momento da acao. |
| organization_group_id | Grupo empresarial afetado, quando houver. |
| company_id | Empresa/CNPJ afetado, quando houver. |
| action | Acao realizada. |
| entity_type | Tipo de registro afetado, como colaborador, risco ou documento. |
| entity_id | Identificador do registro afetado. |
| field_name | Campo alterado, quando aplicavel. |
| old_value | Valor anterior. |
| new_value | Valor novo. |
| metadata | Informacoes extras em formato estruturado. |
| ip_address | IP de origem. |
| user_agent | Navegador/dispositivo usado. |
| created_at | Data/hora do evento. |

## 7. NR-01 / GRO / PGR

### 7.1 risk_sources

Tabela que representa perigos ou fontes de risco.

| Campo | Significado |
| --- | --- |
| id | Identificador unico da fonte de risco. |
| company_id | Empresa/CNPJ relacionada. |
| name | Nome da fonte de risco. |
| description | Descricao da fonte de risco. |
| risk_type | Tipo: fisico, quimico, biologico, ergonomico, acidente ou psicossocial. |
| created_by_user_id | Usuario que cadastrou. |
| created_at | Data/hora de criacao. |
| updated_at | Data/hora da ultima atualizacao. |

### 7.2 occupational_risks

Tabela que representa riscos ocupacionais identificados.

| Campo | Significado |
| --- | --- |
| id | Identificador unico do risco. |
| company_id | Empresa/CNPJ relacionada. |
| company_unit_id | Unidade relacionada, quando aplicavel. |
| department_id | Setor relacionado, quando aplicavel. |
| job_position_id | Cargo relacionado, quando aplicavel. |
| employee_id | Colaborador relacionado, quando aplicavel. |
| risk_source_id | Fonte de risco relacionada. |
| description | Descricao do risco. |
| probability | Probabilidade do risco, na matriz 5x5. |
| severity | Severidade do risco, na matriz 5x5. |
| risk_level | Nivel resultante: baixo, moderado, alto ou critico. |
| status | Situacao do risco. |
| identified_by_user_id | Usuario que identificou. |
| validated_by_user_id | Usuario que validou. |
| identified_at | Data/hora de identificacao. |
| validated_at | Data/hora de validacao. |
| created_at | Data/hora de criacao. |
| updated_at | Data/hora da ultima atualizacao. |

### 7.3 risk_controls

Tabela que representa medidas de controle de risco.

| Campo | Significado |
| --- | --- |
| id | Identificador unico da medida. |
| occupational_risk_id | Risco ao qual a medida esta ligada. |
| control_type | Tipo de controle. |
| description | Descricao da medida. |
| status | Situacao da medida. |
| responsible_user_id | Responsavel pela medida. |
| created_at | Data/hora de criacao. |
| updated_at | Data/hora da ultima atualizacao. |

### 7.4 action_plans

Tabela que representa planos de acao.

| Campo | Significado |
| --- | --- |
| id | Identificador unico do plano. |
| company_id | Empresa/CNPJ relacionada. |
| title | Titulo do plano. |
| description | Descricao geral. |
| status | Situacao do plano. |
| owner_user_id | Responsavel principal. |
| due_date | Prazo final. |
| created_at | Data/hora de criacao. |
| updated_at | Data/hora da ultima atualizacao. |

### 7.5 action_plan_items

Tabela que representa itens do plano de acao.

| Campo | Significado |
| --- | --- |
| id | Identificador unico do item. |
| action_plan_id | Plano de acao ao qual pertence. |
| occupational_risk_id | Risco relacionado, quando houver. |
| title | Titulo do item. |
| description | Descricao da acao. |
| responsible_user_id | Responsavel pela acao. |
| due_date | Prazo. |
| status | Situacao do item. |
| completed_at | Data/hora de conclusao. |
| created_at | Data/hora de criacao. |
| updated_at | Data/hora da ultima atualizacao. |

## 8. Psicossocial

### 8.1 psychosocial_campaigns

Tabela que representa campanhas psicossociais.

| Campo | Significado |
| --- | --- |
| id | Identificador unico da campanha. |
| company_id | Empresa/CNPJ avaliada. |
| name | Nome da campanha. |
| start_date | Data de inicio. |
| end_date | Data final. |
| status | Situacao da campanha. |
| response_threshold_percent | Percentual de alerta, inicialmente 89%. |
| assigned_analyst_user_id | Analista PRONUS responsavel. |
| assigned_psychologist_user_id | Psicologo responsavel. |
| closed_by_user_id | Usuario que encerrou a campanha. |
| closed_at | Data/hora de encerramento. |
| created_at | Data/hora de criacao. |
| updated_at | Data/hora da ultima atualizacao. |

### 8.2 psychosocial_questionnaires

Tabela que representa modelos de questionario psicossocial.

| Campo | Significado |
| --- | --- |
| id | Identificador unico do questionario. |
| name | Nome do questionario. |
| version | Versao do questionario. |
| source_reference | Referencia de origem/metodologia. |
| status | Situacao do questionario. |
| created_at | Data/hora de criacao. |
| updated_at | Data/hora da ultima atualizacao. |

### 8.3 psychosocial_questions

Tabela que representa perguntas do questionario.

| Campo | Significado |
| --- | --- |
| id | Identificador unico da pergunta. |
| questionnaire_id | Questionario ao qual a pergunta pertence. |
| dimension | Dimensao avaliada pela pergunta. |
| question_text | Texto da pergunta. |
| answer_type | Tipo de resposta. |
| scale_min | Menor valor possivel da escala. |
| scale_max | Maior valor possivel da escala. |
| order_index | Ordem da pergunta. |
| is_active | Indica se a pergunta esta ativa. |
| created_at | Data/hora de criacao. |
| updated_at | Data/hora da ultima atualizacao. |

### 8.4 psychosocial_answers

Tabela que representa uma submissao de questionario feita por um colaborador.

| Campo | Significado |
| --- | --- |
| id | Identificador unico da resposta/submissao. |
| campaign_id | Campanha relacionada. |
| questionnaire_id | Questionario respondido. |
| employee_id | Colaborador que respondeu. |
| submitted_at | Data/hora de envio. |
| status | Situacao da resposta. |
| created_at | Data/hora de criacao. |

### 8.5 psychosocial_answer_items

Tabela que representa cada resposta individual por pergunta.

| Campo | Significado |
| --- | --- |
| id | Identificador unico do item de resposta. |
| psychosocial_answer_id | Submissao do questionario. |
| question_id | Pergunta respondida. |
| answer_value | Valor da resposta. |
| created_at | Data/hora de criacao. |

### 8.6 psychosocial_scores

Tabela que representa pontuacoes calculadas.

| Campo | Significado |
| --- | --- |
| id | Identificador unico da pontuacao. |
| campaign_id | Campanha relacionada. |
| employee_id | Colaborador relacionado, para uso interno autorizado. |
| department_id | Setor relacionado. |
| dimension | Dimensao psicossocial avaliada. |
| raw_score | Pontuacao bruta. |
| normalized_score | Pontuacao normalizada. |
| risk_level | Nivel: baixo, moderado, alto ou critico. |
| calculated_at | Data/hora do calculo. |

### 8.7 psychosocial_department_groupings

Tabela que representa agrupamentos de setores pequenos.

| Campo | Significado |
| --- | --- |
| id | Identificador unico do agrupamento. |
| campaign_id | Campanha relacionada. |
| name | Nome do agrupamento. |
| confirmed_by_user_id | Usuario PRONUS que confirmou o agrupamento. |
| confirmed_at | Data/hora da confirmacao. |
| created_at | Data/hora de criacao. |
| updated_at | Data/hora da ultima atualizacao. |

### 8.8 psychosocial_interviews

Tabela que representa entrevistas psicossociais.

| Campo | Significado |
| --- | --- |
| id | Identificador unico da entrevista. |
| campaign_id | Campanha relacionada. |
| employee_id | Colaborador entrevistado. |
| psychologist_user_id | Psicologo responsavel. |
| scheduled_at | Data/hora agendada. |
| completed_at | Data/hora realizada. |
| status | Situacao da entrevista. |
| clinical_notes | Anotacoes tecnicas/clinicas sigilosas. |
| final_risk_level | Risco final indicado apos entrevista. |
| adjustment_reason | Justificativa de ajuste do risco, quando houver. |
| created_at | Data/hora de criacao. |
| updated_at | Data/hora da ultima atualizacao. |

### 8.9 psychosocial_final_results

Tabela que representa resultados finais agregados.

| Campo | Significado |
| --- | --- |
| id | Identificador unico do resultado. |
| campaign_id | Campanha relacionada. |
| company_id | Empresa/CNPJ avaliada. |
| department_id | Setor relacionado, quando puder ser exibido. |
| grouping_id | Agrupamento relacionado, quando setor pequeno for agrupado. |
| dimension | Dimensao avaliada. |
| final_risk_level | Nivel final: baixo, moderado, alto ou critico. |
| employee_count | Quantidade de colaboradores representados no resultado. |
| calculated_at | Data/hora do calculo. |
| validated_by_user_id | Usuario que validou. |
| validated_at | Data/hora da validacao. |

## 9. Documentos

### 9.1 document_templates

Tabela que representa modelos de documentos.

| Campo | Significado |
| --- | --- |
| id | Identificador unico do modelo. |
| name | Nome do modelo. |
| document_type | Tipo de documento. |
| version | Versao do modelo. |
| template_content | Conteudo do modelo. |
| status | Situacao do modelo. |
| created_at | Data/hora de criacao. |
| updated_at | Data/hora da ultima atualizacao. |

### 9.2 documents

Tabela que representa documentos gerados.

| Campo | Significado |
| --- | --- |
| id | Identificador unico do documento. |
| company_id | Empresa/CNPJ do documento. |
| document_template_id | Modelo usado. |
| document_type | Tipo de documento. |
| title | Titulo do documento. |
| version | Versao do documento. |
| status | Situacao: rascunho, gerado, publicado etc. |
| file_url | Local onde o arquivo esta armazenado. |
| responsible_technical_user_id | Responsavel tecnico identificado no documento. |
| generated_by_user_id | Usuario que gerou. |
| published_by_user_id | Usuario que publicou. |
| generated_at | Data/hora de geracao. |
| published_at | Data/hora de publicacao. |
| created_at | Data/hora de criacao. |
| updated_at | Data/hora da ultima atualizacao. |

## 10. Proximas Expansoes do Dicionario

Este dicionario ainda deve ser ampliado quando os modulos abaixo entrarem em desenho detalhado:

- Faturamento e contratos.
- Agenda.
- Teleatendimento.
- Prontuario.
- Pagamento de profissionais.
- eSocial.
- BI avancado.

