import type {
  AttachmentSecurityPolicy,
  AutomatedTestSuite,
  ESocialSstQueueItem,
  LgpdConsentRecord,
  LgpdRetentionPolicy,
  QualitySummary,
  SensitiveAccessTrailEvent,
} from "./quality.types";

export const qualityReferenceSources = {
  esocialMos:
    "https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-03-2025.pdf",
  esocialTechnicalDocumentation: "https://www.gov.br/esocial/pt-br/documentacao-tecnica",
  lgpdLaw: "Lei 13.709/2018 - LGPD",
} as const;

export const automatedTestSuites: AutomatedTestSuite[] = [
  {
    id: "test-suite-login",
    domain: "login",
    title: "Login, troca obrigatoria de senha e reset",
    status: "covered",
    criticalFlows: [
      "Portal PRONUS por CPF",
      "Portal RH por CNPJ",
      "Portal Cliente por CPF",
      "Portal Profissional por CPF clinico",
    ],
    acceptanceCriteria: [
      "CPF/CNPJ invalidos sao rejeitados antes de autenticar.",
      "Senha padrao exige troca no primeiro acesso.",
      "Reset volta a senha padrao do perfil correto.",
    ],
    nextAutomationTarget: "Executar chamadas HTTP contra API local em pipeline.",
  },
  {
    id: "test-suite-permissions",
    domain: "permissions",
    title: "Permissoes por perfil",
    status: "planned",
    criticalFlows: [
      "Master acessa tudo",
      "Administrativo nao ve prontuario clinico",
      "Corpo clinico nao altera cadastro financeiro",
      "RH ve apenas dados agregados da empresa",
    ],
    acceptanceCriteria: [
      "Permissoes devem ser validadas no backend, nao apenas na UI.",
      "Acesso sensivel deve gerar trilha.",
    ],
    nextAutomationTarget: "Criar middleware de autorizacao por recurso e acao.",
  },
  {
    id: "test-suite-structural-registration",
    domain: "structural_registration",
    title: "Cadastro estrutural",
    status: "covered",
    criticalFlows: ["Empresas", "Unidades", "Setores", "Cargos", "Clientes", "Profissionais"],
    acceptanceCriteria: [
      "CPF, CNPJ e CBO seguem validacao forte.",
      "Duplicidades por empresa sao bloqueadas.",
      "Movimentacoes geram auditoria.",
    ],
    nextAutomationTarget: "Cobrir criacao e inativacao via API com fixtures isoladas.",
  },
  {
    id: "test-suite-spreadsheet-import",
    domain: "spreadsheet_import",
    title: "Importacao por planilha",
    status: "covered",
    criticalFlows: ["Validar unidade", "Validar setor", "Validar cargo", "Bloquear duplicidade"],
    acceptanceCriteria: [
      "Erros retornam linha, campo e motivo.",
      "Importacao invalida nao altera base.",
    ],
    nextAutomationTarget:
      "Adicionar arquivo CSV fixture para importacao feliz e importacao com erro.",
  },
  {
    id: "test-suite-psychosocial",
    domain: "psychosocial",
    title: "Psicossocial COPSOQ",
    status: "covered",
    criticalFlows: [
      "Salvar progresso parcial",
      "Finalizar questionario",
      "Pontuar eixos",
      "Aplicar anonimato por grupo minimo",
      "Gerar relatorio tecnico",
    ],
    acceptanceCriteria: [
      "Progresso parcial deve retomar em outro dispositivo quando banco real estiver ativo.",
      "Setor abaixo do minimo nao aparece isolado para cliente.",
    ],
    nextAutomationTarget: "Testar persistencia real no Supabase quando DATABASE_URL estiver ativa.",
  },
  {
    id: "test-suite-schedule",
    domain: "schedule",
    title: "Agenda",
    status: "needs_backend",
    criticalFlows: [
      "Disponibilidade",
      "Cobertura contratual",
      "Feriados",
      "Bloqueios",
      "Absenteismo",
    ],
    acceptanceCriteria: [
      "Cliente nao escolhe profissional.",
      "Consulta respeita limite mensal e cobertura contratada.",
    ],
    nextAutomationTarget: "Persistir agenda real antes de automatizar fluxo completo.",
  },
  {
    id: "test-suite-clinical-record",
    domain: "clinical_record",
    title: "Prontuario integrado",
    status: "needs_backend",
    criticalFlows: ["Sigilo clinico", "Anamnese", "Evolucao", "Assinatura", "Anexos"],
    acceptanceCriteria: [
      "Dado clinico sensivel fica separado do dado administrativo.",
      "Acesso gera trilha e respeita perfil.",
    ],
    nextAutomationTarget: "Implementar persistencia clinica segregada.",
  },
  {
    id: "test-suite-finance",
    domain: "finance",
    title: "Financeiro e pagamento de profissionais",
    status: "planned",
    criticalFlows: ["Faturas", "Inadimplencia", "Consultas finalizadas", "Tabela profissional"],
    acceptanceCriteria: [
      "Pagamento profissional depende de consulta finalizada.",
      "Dados financeiros nao aparecem para corpo clinico.",
    ],
    nextAutomationTarget: "Criar contratos de API para fechamento mensal.",
  },
];

export const lgpdConsents: LgpdConsentRecord[] = [
  {
    id: "consent-rafael-access-001",
    companyTradeName: "Industria Horizonte",
    subjectType: "employee",
    subjectName: "Rafael Moreira Lima",
    purpose: "account_access",
    legalBasis: "Execucao de contrato e procedimentos preliminares",
    status: "active",
    version: "portal-cliente-v1",
    channel: "Portal Cliente",
    grantedAt: "2026-04-29T12:10:00.000Z",
    retentionUntil: "2031-04-29",
    evidenceHash: "sha256-demo-account-access",
  },
  {
    id: "consent-rafael-psychosocial-001",
    companyTradeName: "Industria Horizonte",
    subjectType: "employee",
    subjectName: "Rafael Moreira Lima",
    purpose: "psychosocial_questionnaire",
    legalBasis: "Obrigacao legal/regulatoria em SST com minimizacao e agregacao",
    status: "active",
    version: "copsoq-v1",
    channel: "Portal Cliente",
    grantedAt: "2026-05-01T09:30:00.000Z",
    retentionUntil: "2031-05-01",
    evidenceHash: "sha256-demo-psychosocial",
  },
  {
    id: "consent-video-recording-001",
    companyTradeName: "Industria Horizonte",
    subjectType: "employee",
    subjectName: "Rafael Moreira Lima",
    purpose: "telehealth_recording",
    legalBasis: "Consentimento destacado para gravacao e transcricao",
    status: "pending",
    version: "teleatendimento-v1",
    channel: "Portal Cliente",
    retentionUntil: "2026-11-01",
  },
];

export const retentionPolicies: LgpdRetentionPolicy[] = [
  {
    id: "retention-access",
    dataDomain: "Acesso, autenticacao e auditoria",
    legalBasis: "Seguranca, prevencao a fraude e exercicio regular de direitos",
    retentionPeriodMonths: 60,
    deletionAction: "anonymize",
    reviewFrequency: "Semestral",
    ownerRole: "Administrador Geral PRONUS",
    active: true,
  },
  {
    id: "retention-psychosocial",
    dataDomain: "Psicossocial individual",
    legalBasis: "Obrigacao legal/regulatoria em SST e sigilo profissional",
    retentionPeriodMonths: 60,
    deletionAction: "legal_hold",
    reviewFrequency: "Trimestral",
    ownerRole: "Responsavel tecnico PRONUS",
    active: true,
  },
  {
    id: "retention-clinical-record",
    dataDomain: "Prontuario clinico",
    legalBasis: "Obrigacao legal, regulatoria e defesa em processos",
    retentionPeriodMonths: 240,
    deletionAction: "legal_hold",
    reviewFrequency: "Anual",
    ownerRole: "Diretor medico / responsavel tecnico",
    active: true,
  },
];

export const attachmentSecurityPolicies: AttachmentSecurityPolicy[] = [
  {
    id: "attachment-documents",
    bucketName: "documents",
    dataClass: "occupational",
    allowedMimeTypes: ["application/pdf", "image/png", "image/jpeg"],
    maxSizeMb: 25,
    encryptionRequired: true,
    signedUrlMinutes: 15,
    retentionPolicyId: "retention-access",
  },
  {
    id: "attachment-clinical-records",
    bucketName: "clinical-records",
    dataClass: "clinical",
    allowedMimeTypes: ["application/pdf", "image/png", "image/jpeg", "audio/webm"],
    maxSizeMb: 50,
    encryptionRequired: true,
    signedUrlMinutes: 10,
    retentionPolicyId: "retention-clinical-record",
  },
];

export const sensitiveAccessTrail: SensitiveAccessTrailEvent[] = [
  {
    id: "access-trail-001",
    companyTradeName: "Industria Horizonte",
    subjectName: "Rafael Moreira Lima",
    actorName: "Carlos Henrique Nunes",
    actorRole: "Medico do Trabalho",
    dataDomain: "clinical_record",
    action: "view",
    decision: "allowed",
    purpose: "Preparacao de atendimento agendado",
    createdAt: "2026-05-13T09:00:00.000Z",
  },
  {
    id: "access-trail-002",
    companyTradeName: "Industria Horizonte",
    subjectName: "Rafael Moreira Lima",
    actorName: "Ana Paula Martins",
    actorRole: "Administrativo PRONUS",
    dataDomain: "clinical_record",
    action: "view",
    decision: "denied",
    purpose: "Tentativa de consulta administrativa sem permissao clinica",
    reason: "Perfil administrativo sem escopo clinico",
    createdAt: "2026-05-13T09:05:00.000Z",
  },
];

export const esocialSstQueue: ESocialSstQueueItem[] = [
  {
    id: "esocial-s2240-rafael-001",
    eventType: "S-2240",
    companyTradeName: "Industria Horizonte",
    employeeName: "Rafael Moreira Lima",
    employeeCpf: "987.654.321-00",
    sourceModule: "risk_inventory",
    sourceReferenceId: "risk-horizonte-ergonomia",
    status: "ready_for_future_submission",
    schemaVersion: "MOS S-1.3",
    payloadSummary: {
      riskAgent: "Posturas forcadas",
      riskLevel: "high",
      hasEpc: true,
      hasEpi: true,
    },
    validationMessages: [],
    generatedAt: "2026-05-13T10:00:00.000Z",
    dueAt: "2026-05-20",
    futureSubmissionEnabled: false,
  },
  {
    id: "esocial-s2220-rafael-001",
    eventType: "S-2220",
    companyTradeName: "Industria Horizonte",
    employeeName: "Rafael Moreira Lima",
    employeeCpf: "987.654.321-00",
    sourceModule: "occupational_exam",
    sourceReferenceId: "aso-periodico-rafael-2026",
    status: "pending_validation",
    schemaVersion: "MOS S-1.3",
    payloadSummary: {
      examType: "periodico",
      asoStatus: "aguardando assinatura",
    },
    validationMessages: ["Aso ainda nao finalizado pelo responsavel tecnico."],
    generatedAt: "2026-05-13T10:05:00.000Z",
    dueAt: "2026-05-30",
    futureSubmissionEnabled: false,
  },
  {
    id: "esocial-s2210-demo-001",
    eventType: "S-2210",
    companyTradeName: "Industria Horizonte",
    employeeName: "Ana Cristina Ramos",
    employeeCpf: "123.456.789-09",
    sourceModule: "cat",
    sourceReferenceId: "cat-demo-ana-2026",
    status: "blocked_by_missing_data",
    schemaVersion: "MOS S-1.3",
    payloadSummary: {
      accidentType: "tipico",
      hasCatNumber: false,
    },
    validationMessages: ["CAT demonstrativa sem numero oficial e sem fechamento juridico."],
    generatedAt: "2026-05-13T10:10:00.000Z",
    futureSubmissionEnabled: false,
  },
  {
    id: "esocial-s3000-demo-001",
    eventType: "S-3000",
    companyTradeName: "Industria Horizonte",
    sourceModule: "event_exclusion",
    sourceReferenceId: "future-exclusion-demo",
    status: "draft",
    schemaVersion: "MOS S-1.3",
    payloadSummary: {
      targetEvent: "S-2240",
      reason: "Preparacao para exclusao futura sem envio real no MVP",
    },
    validationMessages: ["Evento de exclusao permanece como rascunho ate existir recibo oficial."],
    generatedAt: "2026-05-13T10:15:00.000Z",
    futureSubmissionEnabled: false,
  },
];

export function buildQualitySummary(generatedAt = new Date().toISOString()): QualitySummary {
  const covered = automatedTestSuites.filter((suite) => suite.status === "covered").length;
  const activeConsents = lgpdConsents.filter((consent) => consent.status === "active").length;
  const pendingConsents = lgpdConsents.filter((consent) => consent.status === "pending").length;
  const encryptedBuckets = attachmentSecurityPolicies.filter(
    (policy) => policy.encryptionRequired,
  ).length;
  const readyForFutureSubmission = esocialSstQueue.filter(
    (item) => item.status === "ready_for_future_submission",
  ).length;
  const blockedByMissingData = esocialSstQueue.filter(
    (item) => item.status === "blocked_by_missing_data",
  ).length;

  return {
    generatedAt,
    automatedTestCoverage: {
      covered,
      percent: Math.round((covered / automatedTestSuites.length) * 100),
      total: automatedTestSuites.length,
    },
    lgpdGovernance: {
      activeConsents,
      pendingConsents,
      retentionPolicies: retentionPolicies.length,
      sensitiveAccessEvents: sensitiveAccessTrail.length,
    },
    attachmentSecurity: {
      encryptedBuckets,
      policies: attachmentSecurityPolicies.length,
      privateBuckets: attachmentSecurityPolicies.length,
    },
    esocialSstQueue: {
      blockedByMissingData,
      futureSubmissionEnabled: esocialSstQueue.some((item) => item.futureSubmissionEnabled),
      readyForFutureSubmission,
      total: esocialSstQueue.length,
    },
  };
}
