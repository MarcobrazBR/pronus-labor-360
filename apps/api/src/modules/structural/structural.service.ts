import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { createHash, randomUUID } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import type {
  ClientAccessLoginInput,
  ClientAccessPasswordChangeInput,
  ClientAccessProfile,
  ClientPasswordResetRequest,
  ClientPasswordResetRequestInput,
  CompanyContractStatus,
  CreateEmployeeMovementInput,
  CreateStructuralCompanyInput,
  CreateStructuralDepartmentInput,
  CreateStructuralEmployeeInput,
  CreateStructuralJobPositionInput,
  CreateStructuralUnitInput,
  EmployeeAccessConfirmRegistrationInput,
  EmployeeAccessLoginInput,
  EmployeeAccessLookupInput,
  EmployeeAccessPasswordChangeInput,
  EmployeeAccessProfile,
  EmployeeDivergenceChange,
  EmployeeDivergenceRequest,
  EmployeeDivergenceStatus,
  EmployeeMovementRequest,
  EmployeeMovementSource,
  EmployeeMovementStatus,
  EmployeeMovementType,
  EmployeePasswordResetRequest,
  EmployeePasswordResetRequestInput,
  ImportStructuralEmployeesInput,
  PronusAccessLoginInput,
  PronusAccessPasswordChangeInput,
  PronusAccessProfile,
  PronusAccessRole,
  PronusAccessUser,
  StructuralAudience,
  StructuralCompany,
  StructuralDepartment,
  StructuralEmployee,
  StructuralEmployeeImportIssue,
  StructuralEmployeeImportResult,
  StructuralJobPosition,
  StructuralStatus,
  StructuralSummary,
  SubmitEmployeeDivergenceInput,
  UpdateEmployeeMovementInput,
  UpdateEmployeeDivergenceInput,
  UpdateStructuralCompanyInput,
  UpdateStructuralDepartmentInput,
  UpdateStructuralEmployeeInput,
  UpdateStructuralJobPositionInput,
  UpdateStructuralUnitInput,
  StructuralUnit,
} from "./structural.types";

const activeStatuses = new Set<StructuralStatus>(["active", "pending_validation"]);
const contractStatuses = new Set<CompanyContractStatus>([
  "prospecting",
  "onboarding",
  "active",
  "suspended",
  "closed",
]);
const structuralAudiences = new Set<StructuralAudience>([
  "client",
  "client_hr",
  "client_manager",
  "pronus_administrative",
  "pronus_clinical",
]);
const validStatuses = new Set<StructuralStatus>([
  "active",
  "pending_validation",
  "blocked",
  "inactive",
]);
const divergenceStatuses = new Set<EmployeeDivergenceStatus>(["pending", "approved", "rejected"]);
const movementStatuses = new Set<EmployeeMovementStatus>(["pending", "approved", "rejected"]);
const movementSources = new Set<EmployeeMovementSource>(["client_portal", "pronus_portal"]);
const movementTypes = new Set<EmployeeMovementType>(["inclusion", "update", "termination"]);
const passwordResetStatuses = new Set(["pending", "completed"]);

type AccessKind = "employee" | "client" | "pronus";

interface AccessCredential {
  subjectId: string;
  passwordHash: string;
  mustChangePassword: boolean;
  updatedAt: string;
}

interface AccessStorageState {
  employeeCredentials: AccessCredential[];
  clientCredentials: AccessCredential[];
  pronusCredentials: AccessCredential[];
  employeeResetRequests: EmployeePasswordResetRequest[];
  clientResetRequests: ClientPasswordResetRequest[];
  employeeRegistrationConfirmations: Array<{
    employeeId: string;
    confirmedAt: string;
  }>;
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function formatCnpj(value: string): string {
  const digits = onlyDigits(value);
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function formatCpf(value: string): string {
  const digits = onlyDigits(value);
  return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

function requireText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new BadRequestException(`Campo obrigatorio invalido: ${field}`);
  }

  return value.trim();
}

function optionalText(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new BadRequestException(`Campo invalido: ${field}`);
  }

  return value.trim();
}

function optionalCount(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new BadRequestException(`Campo numerico invalido: ${field}`);
  }

  return value;
}

function normalizeStatus(value: unknown, field: string): StructuralStatus | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || !validStatuses.has(value as StructuralStatus)) {
    throw new BadRequestException(`Status invalido: ${field}`);
  }

  return value as StructuralStatus;
}

function normalizeContractStatus(value: unknown): CompanyContractStatus | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || !contractStatuses.has(value as CompanyContractStatus)) {
    throw new BadRequestException("Status contratual invalido");
  }

  return value as CompanyContractStatus;
}

function normalizeAudience(value: unknown): StructuralAudience | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || !structuralAudiences.has(value as StructuralAudience)) {
    throw new BadRequestException("Perfil de uso invalido");
  }

  return value as StructuralAudience;
}

function normalizeDivergenceStatus(value: unknown): EmployeeDivergenceStatus {
  if (typeof value !== "string" || !divergenceStatuses.has(value as EmployeeDivergenceStatus)) {
    throw new BadRequestException("Status de divergencia invalido");
  }

  return value as EmployeeDivergenceStatus;
}

function normalizeMovementStatus(value: unknown): EmployeeMovementStatus {
  if (typeof value !== "string" || !movementStatuses.has(value as EmployeeMovementStatus)) {
    throw new BadRequestException("Status de movimentacao invalido");
  }

  return value as EmployeeMovementStatus;
}

function normalizeMovementType(value: unknown): EmployeeMovementType {
  if (typeof value !== "string" || !movementTypes.has(value as EmployeeMovementType)) {
    throw new BadRequestException("Tipo de movimentacao invalido");
  }

  return value as EmployeeMovementType;
}

function normalizeMovementSource(value: unknown): EmployeeMovementSource {
  if (value === undefined || value === null || value === "") {
    return "client_portal";
  }

  if (typeof value !== "string" || !movementSources.has(value as EmployeeMovementSource)) {
    throw new BadRequestException("Origem de movimentacao invalida");
  }

  return value as EmployeeMovementSource;
}

function normalizeCnpj(value: unknown): string {
  const cnpj = onlyDigits(requireText(value, "cnpj"));

  if (cnpj.length !== 14) {
    throw new BadRequestException("CNPJ deve ter 14 digitos");
  }

  return formatCnpj(cnpj);
}

function normalizeCpf(value: unknown): string {
  const cpf = onlyDigits(requireText(value, "cpf"));

  if (cpf.length !== 11) {
    throw new BadRequestException("CPF deve ter 11 digitos");
  }

  return formatCpf(cpf);
}

function optionalCpf(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const cpf = onlyDigits(requireText(value, field));

  if (cpf.length !== 11) {
    throw new BadRequestException(`${field} deve ter 11 digitos`);
  }

  return formatCpf(cpf);
}

function optionalDigits(value: unknown, field: string, length?: number): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const digits = onlyDigits(requireText(value, field));

  if (length !== undefined && digits.length !== length) {
    throw new BadRequestException(`${field} deve ter ${length} digitos`);
  }

  return digits;
}

function now(): string {
  return new Date().toISOString();
}

function workspaceRoot(): string {
  let current = process.cwd();

  while (true) {
    const packagePath = join(current, "package.json");

    if (
      existsSync(packagePath) &&
      readFileSync(packagePath, "utf8").includes('"name": "pronus-labor-360"')
    ) {
      return current;
    }

    const parent = dirname(current);

    if (parent === current) {
      return process.cwd();
    }

    current = parent;
  }
}

function accessStatePath(): string {
  return join(workspaceRoot(), ".data", "access-state.json");
}

function emptyAccessState(): AccessStorageState {
  return {
    clientCredentials: [],
    clientResetRequests: [],
    employeeCredentials: [],
    employeeRegistrationConfirmations: [],
    employeeResetRequests: [],
    pronusCredentials: [],
  };
}

function loadAccessState(): AccessStorageState {
  const filePath = accessStatePath();
  const legacyPath = join(process.cwd(), ".data", "access-state.json");
  const readablePath = existsSync(filePath) ? filePath : legacyPath;

  if (!existsSync(readablePath)) {
    return emptyAccessState();
  }

  try {
    return {
      ...emptyAccessState(),
      ...(JSON.parse(readFileSync(readablePath, "utf8")) as Partial<AccessStorageState>),
    };
  } catch {
    return emptyAccessState();
  }
}

function saveAccessState(state: AccessStorageState): void {
  const filePath = accessStatePath();
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(state, null, 2), "utf8");
}

function hashPassword(kind: AccessKind, subjectId: string, password: string): string {
  return createHash("sha256").update(`${kind}:${subjectId}:${password}`).digest("hex");
}

function defaultEmployeePassword(cpf: string): string {
  return onlyDigits(cpf).slice(0, 6);
}

function defaultClientPassword(cnpj: string): string {
  return onlyDigits(cnpj).slice(0, 6);
}

function defaultPronusPassword(cpf: string): string {
  return onlyDigits(cpf).slice(0, 6);
}

function validateNewPassword(value: unknown): string {
  const password = requireText(value, "newPassword");

  if (password.length !== 6) {
    throw new BadRequestException("A nova senha deve ter exatamente 6 caracteres");
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    throw new BadRequestException(
      "A nova senha deve conter letras, numeros e caracteres especiais",
    );
  }

  return password;
}

function movementSlaDueAt(createdAt: string): string {
  const date = new Date(createdAt);
  date.setDate(date.getDate() + 2);
  return date.toISOString();
}

function normalizeHeader(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function detectDelimiter(headerLine: string): "," | ";" {
  const semicolonCount = (headerLine.match(/;/g) ?? []).length;
  const commaCount = (headerLine.match(/,/g) ?? []).length;
  return semicolonCount >= commaCount ? ";" : ",";
}

function parseCsvLine(line: string, delimiter: "," | ";"): string[] {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && quoted && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === delimiter && !quoted) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseCsv(
  content: string,
  delimiter?: "," | ";",
): Array<{
  rowNumber: number;
  row: Record<string, string>;
}> {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new BadRequestException("CSV deve conter cabecalho e pelo menos uma linha de dados");
  }

  const headerLine = lines[0];

  if (headerLine === undefined) {
    throw new BadRequestException("CSV sem cabecalho");
  }

  const selectedDelimiter = delimiter ?? detectDelimiter(headerLine);
  const headers = parseCsvLine(headerLine, selectedDelimiter).map(normalizeHeader);

  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line, selectedDelimiter);
    const row: Record<string, string> = {};

    headers.forEach((header, headerIndex) => {
      row[header] = values[headerIndex] ?? "";
    });

    return {
      rowNumber: index + 2,
      row,
    };
  });
}

function pickRowValue(row: Record<string, string>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = row[key];

    if (value !== undefined && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function valueOrEmpty(value: string | undefined): string {
  return value?.trim() ?? "";
}

const startedAt = now();

const companies: StructuralCompany[] = [
  {
    id: "company-pronus-demo",
    groupName: "Grupo Demonstracao",
    tradeName: "Industria Horizonte",
    legalName: "Industria Horizonte Ltda.",
    cnpj: "12.345.678/0001-90",
    contractStatus: "active",
    contractDueDate: "2026-12-31",
    selectedPackage: "Essencial SST + Psicossocial",
    eSocialValidFrom: "2026-04",
    taxClassification: "99",
    cooperativeIndicator: "0",
    constructionCompanyIndicator: "0",
    payrollExemptionIndicator: "0",
    electronicRegistrationIndicator: "1",
    educationalEntityIndicator: "N",
    temporaryWorkCompanyIndicator: "N",
    primaryCnae: "1091102",
    contactName: "Mariana Costa",
    contactCpf: "111.222.333-44",
    contactPhone: "1133334444",
    contactMobile: "11988887777",
    contactEmail: "rh@industriahorizonte.com.br",
    units: 2,
    departments: 3,
    employees: 148,
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "company-pronus-retail",
    groupName: "Grupo Demonstracao",
    tradeName: "Rede Norte",
    legalName: "Rede Norte Comercio S.A.",
    cnpj: "98.765.432/0001-10",
    contractStatus: "onboarding",
    contractDueDate: "2026-10-31",
    selectedPackage: "Completo Ocupacional",
    eSocialValidFrom: "2026-04",
    taxClassification: "99",
    cooperativeIndicator: "0",
    constructionCompanyIndicator: "0",
    payrollExemptionIndicator: "0",
    electronicRegistrationIndicator: "1",
    educationalEntityIndicator: "N",
    temporaryWorkCompanyIndicator: "N",
    primaryCnae: "4711302",
    contactName: "Paulo Mendes",
    contactCpf: "222.333.444-55",
    contactPhone: "1144445555",
    contactMobile: "11977776666",
    contactEmail: "rh@redenorte.com.br",
    units: 4,
    departments: 3,
    employees: 326,
    status: "pending_validation",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
];

const units: StructuralUnit[] = [
  {
    id: "unit-horizonte-matriz",
    companyId: "company-pronus-demo",
    companyTradeName: "Industria Horizonte",
    name: "Matriz",
    code: "HZ-MTZ",
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "unit-horizonte-centro-distribuicao",
    companyId: "company-pronus-demo",
    companyTradeName: "Industria Horizonte",
    name: "Centro de Distribuicao",
    code: "HZ-CD",
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "unit-rede-norte-loja-01",
    companyId: "company-pronus-retail",
    companyTradeName: "Rede Norte",
    name: "Loja 01",
    code: "RN-L01",
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "unit-rede-norte-loja-02",
    companyId: "company-pronus-retail",
    companyTradeName: "Rede Norte",
    name: "Loja 02",
    code: "RN-L02",
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "unit-rede-norte-cd",
    companyId: "company-pronus-retail",
    companyTradeName: "Rede Norte",
    name: "Centro de Distribuicao",
    code: "RN-CD",
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "unit-rede-norte-adm",
    companyId: "company-pronus-retail",
    companyTradeName: "Rede Norte",
    name: "Administrativo",
    code: "RN-ADM",
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
];

const departments: StructuralDepartment[] = [
  {
    id: "department-horizonte-producao",
    companyId: "company-pronus-demo",
    companyTradeName: "Industria Horizonte",
    unitId: "unit-horizonte-matriz",
    unitName: "Matriz",
    name: "Producao",
    code: "PROD",
    audience: "client",
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "department-horizonte-manutencao",
    companyId: "company-pronus-demo",
    companyTradeName: "Industria Horizonte",
    unitId: "unit-horizonte-matriz",
    unitName: "Matriz",
    name: "Manutencao",
    code: "MAN",
    audience: "client",
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "department-horizonte-rh",
    companyId: "company-pronus-demo",
    companyTradeName: "Industria Horizonte",
    unitId: "unit-horizonte-centro-distribuicao",
    unitName: "Centro de Distribuicao",
    name: "Recursos Humanos",
    code: "RH",
    audience: "client_hr",
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "department-rede-norte-atendimento",
    companyId: "company-pronus-retail",
    companyTradeName: "Rede Norte",
    unitId: "unit-rede-norte-loja-01",
    unitName: "Loja 01",
    name: "Atendimento",
    code: "ATD",
    audience: "client",
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "department-rede-norte-logistica",
    companyId: "company-pronus-retail",
    companyTradeName: "Rede Norte",
    unitId: "unit-rede-norte-cd",
    unitName: "Centro de Distribuicao",
    name: "Logistica",
    code: "LOG",
    audience: "client",
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "department-rede-norte-adm",
    companyId: "company-pronus-retail",
    companyTradeName: "Rede Norte",
    unitId: "unit-rede-norte-adm",
    unitName: "Administrativo",
    name: "Administrativo",
    code: "ADM",
    audience: "client_manager",
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "department-pronus-administrativo",
    name: "Administrativo PRONUS",
    code: "PRONUS-ADM",
    audience: "pronus_administrative",
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "department-pronus-corpo-clinico",
    name: "Corpo Clinico PRONUS",
    code: "PRONUS-CLIN",
    audience: "pronus_clinical",
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
];

const jobPositions: StructuralJobPosition[] = [
  {
    id: "job-horizonte-operadora-maquina",
    companyId: "company-pronus-demo",
    companyTradeName: "Industria Horizonte",
    departmentId: "department-horizonte-producao",
    departmentName: "Producao",
    title: "Operadora de Maquina",
    audience: "client",
    eSocialCode: "CARGO-001",
    cboCode: "7842-05",
    description: "Opera equipamentos industriais conforme procedimento de seguranca.",
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "job-horizonte-tecnico-seguranca",
    companyId: "company-pronus-demo",
    companyTradeName: "Industria Horizonte",
    departmentId: "department-horizonte-manutencao",
    departmentName: "Manutencao",
    title: "Tecnico de Seguranca",
    audience: "client",
    eSocialCode: "CARGO-002",
    cboCode: "3516-05",
    description: "Apoia rotinas de seguranca ocupacional e controles preventivos.",
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "job-rede-norte-supervisora-loja",
    companyId: "company-pronus-retail",
    companyTradeName: "Rede Norte",
    departmentId: "department-rede-norte-atendimento",
    departmentName: "Atendimento",
    title: "Supervisora de Loja",
    audience: "client_manager",
    eSocialCode: "CARGO-003",
    cboCode: "5201-10",
    description: "Coordena equipe de atendimento e operacao de loja.",
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "job-rede-norte-auxiliar-logistica",
    companyId: "company-pronus-retail",
    companyTradeName: "Rede Norte",
    departmentId: "department-rede-norte-logistica",
    departmentName: "Logistica",
    title: "Auxiliar de Logistica",
    audience: "client",
    eSocialCode: "CARGO-004",
    cboCode: "4141-05",
    description: "Executa recebimento, conferencia e movimentacao de mercadorias.",
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "job-pronus-analista-administrativo",
    departmentId: "department-pronus-administrativo",
    departmentName: "Administrativo PRONUS",
    title: "Analista Administrativo PRONUS",
    audience: "pronus_administrative",
    eSocialCode: "CARGO-005",
    cboCode: "4110-10",
    description: "Apoia rotina administrativa, relacionamento com clientes e controles internos.",
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "job-pronus-medico-ocupacional",
    departmentId: "department-pronus-corpo-clinico",
    departmentName: "Corpo Clinico PRONUS",
    title: "Medico do Trabalho",
    audience: "pronus_clinical",
    eSocialCode: "CARGO-006",
    cboCode: "2251-40",
    description: "Atua em avaliacao clinica ocupacional, PCMSO e suporte tecnico ao cliente.",
    status: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
];

const employees: StructuralEmployee[] = [
  {
    id: "employee-001",
    companyId: "company-pronus-demo",
    companyTradeName: "Industria Horizonte",
    fullName: "Ana Cristina Ramos",
    cpf: "123.456.789-09",
    birthDate: "1989-03-14",
    inclusionDate: "2026-01-05",
    department: "Producao",
    jobPosition: "Operadora de Maquina",
    registrationStatus: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "employee-002",
    companyId: "company-pronus-demo",
    companyTradeName: "Industria Horizonte",
    fullName: "Rafael Moreira Lima",
    cpf: "987.654.321-00",
    birthDate: "1982-08-21",
    inclusionDate: "2026-01-05",
    department: "Manutencao",
    jobPosition: "Tecnico de Seguranca",
    registrationStatus: "pending_validation",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
  {
    id: "employee-003",
    companyId: "company-pronus-retail",
    companyTradeName: "Rede Norte",
    fullName: "Beatriz Almeida Souza",
    cpf: "456.789.123-44",
    birthDate: "1991-11-02",
    inclusionDate: "2026-02-12",
    department: "Atendimento",
    jobPosition: "Supervisora de Loja",
    registrationStatus: "active",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
];

const employeeDivergences: EmployeeDivergenceRequest[] = [
  {
    id: "divergence-001",
    employeeId: "employee-002",
    companyTradeName: "Industria Horizonte",
    fullName: "Rafael Moreira Lima",
    cpf: "987.654.321-00",
    changes: [
      {
        field: "phone",
        currentValue: "",
        submittedValue: "11 98888-7777",
      },
    ],
    status: "pending",
    createdAt: startedAt,
    updatedAt: startedAt,
  },
];

const employeeMovements: EmployeeMovementRequest[] = [
  {
    id: "movement-horizonte-update-001",
    type: "update",
    status: "pending",
    source: "client_portal",
    companyId: "company-pronus-demo",
    companyTradeName: "Industria Horizonte",
    employeeId: "employee-002",
    fullName: "Rafael Moreira Lima",
    cpf: "987.654.321-00",
    department: "Manutencao",
    jobPosition: "Tecnico de Seguranca",
    phone: "11 98888-7777",
    notes: "RH solicitou atualizacao de telefone antes do proximo exame periodico.",
    requestedBy: "Mariana Costa",
    createdAt: startedAt,
    updatedAt: startedAt,
    slaDueAt: movementSlaDueAt(startedAt),
  },
];

const pronusAccessUsers: PronusAccessUser[] = [
  {
    id: "pronus-master-admin",
    fullName: "Administrador Geral PRONUS",
    cpf: "111.222.333-00",
    email: "admin.master@pronus.com.br",
    department: "Operacao PRONUS",
    jobPosition: "Administrador geral",
    audience: "pronus_administrative",
    role: "master_admin",
    status: "active",
  },
  {
    id: "pronus-ana-admin",
    fullName: "Ana Paula Martins",
    cpf: "456.789.123-88",
    email: "ana.martins@pronus.com.br",
    department: "Administrativo PRONUS",
    jobPosition: "Analista Administrativo PRONUS",
    audience: "pronus_administrative",
    role: "administrative",
    status: "active",
  },
  {
    id: "pronus-dr-carlos",
    fullName: "Carlos Henrique Nunes",
    cpf: "654.987.321-11",
    email: "carlos.nunes@pronus.com.br",
    department: "Corpo Clinico PRONUS",
    jobPosition: "Medico do Trabalho",
    audience: "pronus_clinical",
    role: "clinical",
    status: "active",
  },
  {
    id: "pronus-psi-larissa",
    fullName: "Larissa Moreira",
    cpf: "789.123.456-22",
    email: "larissa.moreira@pronus.com.br",
    department: "Corpo Clinico PRONUS",
    jobPosition: "Psicologa Ocupacional",
    audience: "pronus_clinical",
    role: "clinical",
    status: "active",
  },
];

const accessState = loadAccessState();

@Injectable()
export class StructuralService {
  getSummary(): StructuralSummary {
    return {
      generatedAt: now(),
      companies: companies.filter((company) => activeStatuses.has(company.status)).length,
      units: units.filter((unit) => activeStatuses.has(unit.status)).length,
      departments: departments.filter((department) => activeStatuses.has(department.status)).length,
      jobPositions: jobPositions.filter((jobPosition) => activeStatuses.has(jobPosition.status))
        .length,
      employees: companies.reduce(
        (total, company) => total + (activeStatuses.has(company.status) ? company.employees : 0),
        0,
      ),
      pendingValidations: employees.filter(
        (employee) => employee.registrationStatus === "pending_validation",
      ).length,
    };
  }

  loginPronusAccess(input: PronusAccessLoginInput): PronusAccessProfile {
    const cpf = normalizeCpf(input.cpf);
    const user = pronusAccessUsers.find((item) => onlyDigits(item.cpf) === onlyDigits(cpf));

    if (user === undefined || user.status === "inactive") {
      throw new NotFoundException("CPF nao encontrado na base PRONUS");
    }

    const credential = this.ensurePronusCredential(user);

    if (
      credential.passwordHash !==
      hashPassword("pronus", user.id, requireText(input.password, "password"))
    ) {
      throw new BadRequestException("CPF ou senha invalidos");
    }

    return this.toPronusAccessProfile(user);
  }

  changePronusPassword(input: PronusAccessPasswordChangeInput): PronusAccessProfile {
    const user = this.findPronusAccessUser(input.userId);
    const newPassword = validateNewPassword(input.newPassword);
    const credential = this.ensurePronusCredential(user);
    const updatedAt = now();

    credential.passwordHash = hashPassword("pronus", user.id, newPassword);
    credential.mustChangePassword = false;
    credential.updatedAt = updatedAt;
    saveAccessState(accessState);

    return this.toPronusAccessProfile(user);
  }

  listPronusAccessUsers(): PronusAccessProfile[] {
    return pronusAccessUsers.map((user) => this.toPronusAccessProfile(user));
  }

  resetPronusAccessUserPassword(id: string): PronusAccessProfile {
    const user = this.findPronusAccessUser(id);
    const credential = this.ensurePronusCredential(user);
    const updatedAt = now();

    credential.passwordHash = hashPassword("pronus", user.id, defaultPronusPassword(user.cpf));
    credential.mustChangePassword = true;
    credential.updatedAt = updatedAt;
    saveAccessState(accessState);

    return this.toPronusAccessProfile(user);
  }

  loginEmployeeAccess(input: EmployeeAccessLoginInput): EmployeeAccessProfile {
    const cpf = normalizeCpf(input.cpf);
    const employee = employees.find((item) => onlyDigits(item.cpf) === onlyDigits(cpf));

    if (employee === undefined || employee.registrationStatus === "inactive") {
      throw new NotFoundException("CPF nao encontrado na base de clientes");
    }

    const credential = this.ensureEmployeeCredential(employee);

    if (
      credential.passwordHash !==
      hashPassword("employee", employee.id, requireText(input.password, "password"))
    ) {
      throw new BadRequestException("CPF ou senha invalidos");
    }

    return this.toEmployeeAccessProfile(employee);
  }

  changeEmployeePassword(input: EmployeeAccessPasswordChangeInput): EmployeeAccessProfile {
    const employee = this.findEmployee(input.employeeId);
    const newPassword = validateNewPassword(input.newPassword);
    const credential = this.ensureEmployeeCredential(employee);
    const updatedAt = now();

    credential.passwordHash = hashPassword("employee", employee.id, newPassword);
    credential.mustChangePassword = false;
    credential.updatedAt = updatedAt;
    employee.updatedAt = updatedAt;
    saveAccessState(accessState);

    return this.toEmployeeAccessProfile(employee);
  }

  confirmEmployeeRegistration(
    input: EmployeeAccessConfirmRegistrationInput,
  ): EmployeeAccessProfile {
    const employee = this.findEmployee(input.employeeId);
    const confirmedAt = now();
    const existing = accessState.employeeRegistrationConfirmations.find(
      (item) => item.employeeId === employee.id,
    );

    if (existing === undefined) {
      accessState.employeeRegistrationConfirmations.push({
        confirmedAt,
        employeeId: employee.id,
      });
    } else {
      existing.confirmedAt = existing.confirmedAt ?? confirmedAt;
    }

    employee.registrationConfirmedAt = confirmedAt;
    employee.registrationStatus = "active";
    employee.updatedAt = confirmedAt;
    saveAccessState(accessState);

    return this.toEmployeeAccessProfile(employee);
  }

  listEmployeePasswordResetRequests(): EmployeePasswordResetRequest[] {
    return accessState.employeeResetRequests;
  }

  requestEmployeePasswordReset(
    input: EmployeePasswordResetRequestInput,
  ): EmployeePasswordResetRequest {
    const cpf = normalizeCpf(input.cpf);
    const employee = employees.find((item) => onlyDigits(item.cpf) === onlyDigits(cpf));

    if (employee === undefined || employee.registrationStatus === "inactive") {
      throw new NotFoundException("CPF nao encontrado na base de clientes");
    }

    const existing = accessState.employeeResetRequests.find(
      (item) => item.employeeId === employee.id && item.status === "pending",
    );

    if (existing !== undefined) {
      return existing;
    }

    const requestedAt = now();
    const request: EmployeePasswordResetRequest = {
      id: randomUUID(),
      companyTradeName: employee.companyTradeName,
      cpf: employee.cpf,
      employeeId: employee.id,
      fullName: employee.fullName,
      requestedAt,
      status: "pending",
    };

    accessState.employeeResetRequests.unshift(request);
    saveAccessState(accessState);
    return request;
  }

  resolveEmployeePasswordReset(id: string): EmployeePasswordResetRequest {
    const request = accessState.employeeResetRequests.find((item) => item.id === id);

    if (request === undefined) {
      throw new NotFoundException("Pedido de reset nao encontrado");
    }

    const status = "completed";

    if (!passwordResetStatuses.has(status)) {
      throw new BadRequestException("Status de reset invalido");
    }

    const employee = this.findEmployee(request.employeeId);
    const credential = this.ensureEmployeeCredential(employee);
    const resolvedAt = now();

    credential.passwordHash = hashPassword(
      "employee",
      employee.id,
      defaultEmployeePassword(employee.cpf),
    );
    credential.mustChangePassword = true;
    credential.updatedAt = resolvedAt;
    request.status = status;
    request.resolvedAt = resolvedAt;
    employee.updatedAt = resolvedAt;
    saveAccessState(accessState);

    return request;
  }

  loginClientAccess(input: ClientAccessLoginInput): ClientAccessProfile {
    const cnpj = normalizeCnpj(input.cnpj);
    const company = companies.find((item) => onlyDigits(item.cnpj) === onlyDigits(cnpj));

    if (company === undefined || company.status === "inactive") {
      throw new NotFoundException("CNPJ nao encontrado na base de empresas");
    }

    const credential = this.ensureClientCredential(company);

    if (
      credential.passwordHash !==
      hashPassword("client", company.id, requireText(input.password, "password"))
    ) {
      throw new BadRequestException("CNPJ ou senha invalidos");
    }

    return this.toClientAccessProfile(company);
  }

  changeClientPassword(input: ClientAccessPasswordChangeInput): ClientAccessProfile {
    const company = this.findCompany(input.companyId);
    const newPassword = validateNewPassword(input.newPassword);
    const credential = this.ensureClientCredential(company);
    const updatedAt = now();

    credential.passwordHash = hashPassword("client", company.id, newPassword);
    credential.mustChangePassword = false;
    credential.updatedAt = updatedAt;
    company.updatedAt = updatedAt;
    saveAccessState(accessState);

    return this.toClientAccessProfile(company);
  }

  listClientPasswordResetRequests(): ClientPasswordResetRequest[] {
    return accessState.clientResetRequests;
  }

  requestClientPasswordReset(input: ClientPasswordResetRequestInput): ClientPasswordResetRequest {
    const cnpj = normalizeCnpj(input.cnpj);
    const company = companies.find((item) => onlyDigits(item.cnpj) === onlyDigits(cnpj));

    if (company === undefined || company.status === "inactive") {
      throw new NotFoundException("CNPJ nao encontrado na base de empresas");
    }

    const existing = accessState.clientResetRequests.find(
      (item) => item.companyId === company.id && item.status === "pending",
    );

    if (existing !== undefined) {
      return existing;
    }

    const requestedAt = now();
    const request: ClientPasswordResetRequest = {
      id: randomUUID(),
      cnpj: company.cnpj,
      companyId: company.id,
      companyTradeName: company.tradeName,
      requestedAt,
      status: "pending",
    };

    accessState.clientResetRequests.unshift(request);
    saveAccessState(accessState);
    return request;
  }

  resolveClientPasswordReset(id: string): ClientPasswordResetRequest {
    const request = accessState.clientResetRequests.find((item) => item.id === id);

    if (request === undefined) {
      throw new NotFoundException("Pedido de reset da empresa nao encontrado");
    }

    const company = this.findCompany(request.companyId);
    const credential = this.ensureClientCredential(company);
    const resolvedAt = now();

    credential.passwordHash = hashPassword(
      "client",
      company.id,
      defaultClientPassword(company.cnpj),
    );
    credential.mustChangePassword = true;
    credential.updatedAt = resolvedAt;
    request.status = "completed";
    request.resolvedAt = resolvedAt;
    company.updatedAt = resolvedAt;
    saveAccessState(accessState);

    return request;
  }

  listCompanies(): StructuralCompany[] {
    return companies.filter((company) => company.status !== "inactive");
  }

  getCompany(id: string): StructuralCompany {
    return this.findCompany(id);
  }

  createCompany(input: CreateStructuralCompanyInput): StructuralCompany {
    const cnpj = normalizeCnpj(input.cnpj);

    if (companies.some((company) => onlyDigits(company.cnpj) === onlyDigits(cnpj))) {
      throw new ConflictException("Ja existe empresa cadastrada com este CNPJ");
    }

    const createdAt = now();
    const company: StructuralCompany = {
      id: randomUUID(),
      groupName: requireText(input.groupName, "groupName"),
      tradeName: requireText(input.tradeName, "tradeName"),
      legalName: requireText(input.legalName, "legalName"),
      cnpj,
      contractStatus: normalizeContractStatus(input.contractStatus) ?? "onboarding",
      contractDueDate: optionalText(input.contractDueDate, "contractDueDate"),
      selectedPackage: optionalText(input.selectedPackage, "selectedPackage"),
      eSocialValidFrom: optionalText(input.eSocialValidFrom, "eSocialValidFrom"),
      eSocialValidTo: optionalText(input.eSocialValidTo, "eSocialValidTo"),
      taxClassification: optionalDigits(input.taxClassification, "taxClassification"),
      cooperativeIndicator: optionalText(input.cooperativeIndicator, "cooperativeIndicator"),
      constructionCompanyIndicator: optionalText(
        input.constructionCompanyIndicator,
        "constructionCompanyIndicator",
      ),
      payrollExemptionIndicator: optionalText(
        input.payrollExemptionIndicator,
        "payrollExemptionIndicator",
      ),
      electronicRegistrationIndicator: optionalText(
        input.electronicRegistrationIndicator,
        "electronicRegistrationIndicator",
      ),
      educationalEntityIndicator: optionalText(
        input.educationalEntityIndicator,
        "educationalEntityIndicator",
      ),
      temporaryWorkCompanyIndicator: optionalText(
        input.temporaryWorkCompanyIndicator,
        "temporaryWorkCompanyIndicator",
      ),
      temporaryWorkRegistration: optionalText(
        input.temporaryWorkRegistration,
        "temporaryWorkRegistration",
      ),
      primaryCnae: optionalDigits(input.primaryCnae, "primaryCnae", 7),
      contactName: optionalText(input.contactName, "contactName"),
      contactCpf: optionalCpf(input.contactCpf, "contactCpf"),
      contactPhone: optionalDigits(input.contactPhone, "contactPhone"),
      contactMobile: optionalDigits(input.contactMobile, "contactMobile"),
      contactEmail: optionalText(input.contactEmail, "contactEmail"),
      units: optionalCount(input.units, "units") ?? 0,
      departments: optionalCount(input.departments, "departments") ?? 0,
      employees: 0,
      status: "active",
      createdAt,
      updatedAt: createdAt,
    };

    companies.unshift(company);
    return company;
  }

  updateCompany(id: string, input: UpdateStructuralCompanyInput): StructuralCompany {
    const company = this.findCompany(id);
    const cnpj = input.cnpj === undefined ? undefined : normalizeCnpj(input.cnpj);

    if (
      cnpj !== undefined &&
      companies.some(
        (existingCompany) =>
          existingCompany.id !== id && onlyDigits(existingCompany.cnpj) === onlyDigits(cnpj),
      )
    ) {
      throw new ConflictException("Ja existe empresa cadastrada com este CNPJ");
    }

    company.groupName = optionalText(input.groupName, "groupName") ?? company.groupName;
    company.tradeName = optionalText(input.tradeName, "tradeName") ?? company.tradeName;
    company.legalName = optionalText(input.legalName, "legalName") ?? company.legalName;
    company.cnpj = cnpj ?? company.cnpj;
    company.contractStatus =
      normalizeContractStatus(input.contractStatus) ?? company.contractStatus;
    company.contractDueDate =
      optionalText(input.contractDueDate, "contractDueDate") ?? company.contractDueDate;
    company.selectedPackage =
      optionalText(input.selectedPackage, "selectedPackage") ?? company.selectedPackage;
    company.eSocialValidFrom =
      optionalText(input.eSocialValidFrom, "eSocialValidFrom") ?? company.eSocialValidFrom;
    company.eSocialValidTo =
      optionalText(input.eSocialValidTo, "eSocialValidTo") ?? company.eSocialValidTo;
    company.taxClassification =
      optionalDigits(input.taxClassification, "taxClassification") ?? company.taxClassification;
    company.cooperativeIndicator =
      optionalText(input.cooperativeIndicator, "cooperativeIndicator") ??
      company.cooperativeIndicator;
    company.constructionCompanyIndicator =
      optionalText(input.constructionCompanyIndicator, "constructionCompanyIndicator") ??
      company.constructionCompanyIndicator;
    company.payrollExemptionIndicator =
      optionalText(input.payrollExemptionIndicator, "payrollExemptionIndicator") ??
      company.payrollExemptionIndicator;
    company.electronicRegistrationIndicator =
      optionalText(input.electronicRegistrationIndicator, "electronicRegistrationIndicator") ??
      company.electronicRegistrationIndicator;
    company.educationalEntityIndicator =
      optionalText(input.educationalEntityIndicator, "educationalEntityIndicator") ??
      company.educationalEntityIndicator;
    company.temporaryWorkCompanyIndicator =
      optionalText(input.temporaryWorkCompanyIndicator, "temporaryWorkCompanyIndicator") ??
      company.temporaryWorkCompanyIndicator;
    company.temporaryWorkRegistration =
      optionalText(input.temporaryWorkRegistration, "temporaryWorkRegistration") ??
      company.temporaryWorkRegistration;
    company.primaryCnae =
      optionalDigits(input.primaryCnae, "primaryCnae", 7) ?? company.primaryCnae;
    company.contactName = optionalText(input.contactName, "contactName") ?? company.contactName;
    company.contactCpf = optionalCpf(input.contactCpf, "contactCpf") ?? company.contactCpf;
    company.contactPhone =
      optionalDigits(input.contactPhone, "contactPhone") ?? company.contactPhone;
    company.contactMobile =
      optionalDigits(input.contactMobile, "contactMobile") ?? company.contactMobile;
    company.contactEmail = optionalText(input.contactEmail, "contactEmail") ?? company.contactEmail;
    company.units = optionalCount(input.units, "units") ?? company.units;
    company.departments = optionalCount(input.departments, "departments") ?? company.departments;
    company.status = normalizeStatus(input.status, "status") ?? company.status;
    company.updatedAt = now();

    this.syncCompanyNameOnEmployees(company);
    return company;
  }

  deactivateCompany(id: string): StructuralCompany {
    return this.updateCompany(id, { status: "inactive" });
  }

  listUnits(): StructuralUnit[] {
    return units.filter((unit) => unit.status !== "inactive");
  }

  getUnit(id: string): StructuralUnit {
    return this.findUnit(id);
  }

  createUnit(input: CreateStructuralUnitInput): StructuralUnit {
    const company = this.findCompany(input.companyId);
    const name = requireText(input.name, "name");

    this.ensureUniqueUnitName(company.id, name);

    const createdAt = now();
    const unit: StructuralUnit = {
      id: randomUUID(),
      companyId: company.id,
      companyTradeName: company.tradeName,
      name,
      code: optionalText(input.code, "code"),
      status: "active",
      createdAt,
      updatedAt: createdAt,
    };

    units.unshift(unit);
    company.units += 1;
    company.updatedAt = createdAt;

    return unit;
  }

  updateUnit(id: string, input: UpdateStructuralUnitInput): StructuralUnit {
    const unit = this.findUnit(id);
    const previousCompany = this.findCompany(unit.companyId);
    const company =
      input.companyId === undefined ? previousCompany : this.findCompany(input.companyId);
    const name = optionalText(input.name, "name") ?? unit.name;
    const nextStatus = normalizeStatus(input.status, "status") ?? unit.status;

    this.ensureUniqueUnitName(company.id, name, unit.id);

    if (company.id !== previousCompany.id) {
      previousCompany.units = Math.max(previousCompany.units - 1, 0);
      previousCompany.updatedAt = now();
      company.units += 1;
    }

    if (unit.status !== "inactive" && nextStatus === "inactive") {
      company.units = Math.max(company.units - 1, 0);
    }

    if (unit.status === "inactive" && nextStatus !== "inactive") {
      company.units += 1;
    }

    unit.companyId = company.id;
    unit.companyTradeName = company.tradeName;
    unit.name = name;
    unit.code = optionalText(input.code, "code") ?? unit.code;
    unit.status = nextStatus;
    unit.updatedAt = now();
    company.updatedAt = unit.updatedAt;

    this.syncUnitNameOnDepartments(unit);
    return unit;
  }

  deactivateUnit(id: string): StructuralUnit {
    return this.updateUnit(id, { status: "inactive" });
  }

  listDepartments(): StructuralDepartment[] {
    return departments.filter((department) => department.status !== "inactive");
  }

  getDepartment(id: string): StructuralDepartment {
    return this.findDepartment(id);
  }

  createDepartment(input: CreateStructuralDepartmentInput): StructuralDepartment {
    const unit = input.unitId === undefined ? undefined : this.findUnit(input.unitId);
    const company =
      input.companyId === undefined
        ? unit === undefined
          ? undefined
          : this.findCompany(unit.companyId)
        : this.findCompany(input.companyId);
    const name = requireText(input.name, "name");
    const audience = normalizeAudience(input.audience) ?? "client";

    if (unit !== undefined && company !== undefined && unit.companyId !== company.id) {
      throw new BadRequestException("Unidade nao pertence a empresa informada");
    }

    this.ensureUniqueDepartmentName(audience, name);

    const createdAt = now();
    const department: StructuralDepartment = {
      id: randomUUID(),
      companyId: company?.id,
      companyTradeName: company?.tradeName,
      unitId: unit?.id,
      unitName: unit?.name,
      name,
      code: optionalText(input.code, "code"),
      audience,
      status: "active",
      createdAt,
      updatedAt: createdAt,
    };

    departments.unshift(department);
    if (company !== undefined) {
      company.departments += 1;
      company.updatedAt = createdAt;
    }

    return department;
  }

  updateDepartment(id: string, input: UpdateStructuralDepartmentInput): StructuralDepartment {
    const department = this.findDepartment(id);
    const previousCompany =
      department.companyId === undefined ? undefined : this.findCompany(department.companyId);
    const requestedCompanyId =
      input.companyId === undefined
        ? department.companyId
        : optionalText(input.companyId, "companyId");
    const requestedUnitId =
      input.unitId === undefined ? department.unitId : optionalText(input.unitId, "unitId");
    const unit = requestedUnitId === undefined ? undefined : this.findUnit(requestedUnitId);
    const company =
      requestedCompanyId === undefined
        ? unit === undefined
          ? undefined
          : this.findCompany(unit.companyId)
        : this.findCompany(requestedCompanyId);
    const name = optionalText(input.name, "name") ?? department.name;
    const audience = normalizeAudience(input.audience) ?? department.audience;
    const nextStatus = normalizeStatus(input.status, "status") ?? department.status;

    if (unit !== undefined && company !== undefined && unit.companyId !== company.id) {
      throw new BadRequestException("Unidade nao pertence a empresa informada");
    }

    this.ensureUniqueDepartmentName(audience, name, department.id);

    if (company?.id !== previousCompany?.id) {
      if (previousCompany !== undefined) {
        previousCompany.departments = Math.max(previousCompany.departments - 1, 0);
        previousCompany.updatedAt = now();
      }
      if (company !== undefined) {
        company.departments += 1;
      }
    }

    if (company !== undefined && department.status !== "inactive" && nextStatus === "inactive") {
      company.departments = Math.max(company.departments - 1, 0);
    }

    if (company !== undefined && department.status === "inactive" && nextStatus !== "inactive") {
      company.departments += 1;
    }

    department.companyId = company?.id;
    department.companyTradeName = company?.tradeName;
    department.unitId = unit?.id;
    department.unitName = unit?.name;
    department.name = name;
    department.code = optionalText(input.code, "code") ?? department.code;
    department.audience = audience;
    department.status = nextStatus;
    department.updatedAt = now();
    if (company !== undefined) {
      company.updatedAt = department.updatedAt;
    }

    this.syncDepartmentNameOnJobPositions(department);
    return department;
  }

  deactivateDepartment(id: string): StructuralDepartment {
    return this.updateDepartment(id, { status: "inactive" });
  }

  listJobPositions(): StructuralJobPosition[] {
    return jobPositions.filter((jobPosition) => jobPosition.status !== "inactive");
  }

  getJobPosition(id: string): StructuralJobPosition {
    return this.findJobPosition(id);
  }

  createJobPosition(input: CreateStructuralJobPositionInput): StructuralJobPosition {
    const department =
      input.departmentId === undefined ? undefined : this.findDepartment(input.departmentId);
    const company =
      input.companyId === undefined
        ? department?.companyId === undefined
          ? undefined
          : this.findCompany(department.companyId)
        : this.findCompany(input.companyId);
    const title = requireText(input.title, "title");
    const audience = normalizeAudience(input.audience) ?? department?.audience ?? "client";

    if (
      department !== undefined &&
      company !== undefined &&
      department.companyId !== undefined &&
      department.companyId !== company.id
    ) {
      throw new BadRequestException("Setor nao pertence a empresa informada");
    }

    this.ensureUniqueJobTitle(audience, title);

    const createdAt = now();
    const jobPosition: StructuralJobPosition = {
      id: randomUUID(),
      companyId: company?.id,
      companyTradeName: company?.tradeName,
      departmentId: department?.id,
      departmentName: department?.name,
      title,
      audience,
      eSocialCode: optionalText(input.eSocialCode, "eSocialCode"),
      cboCode: optionalText(input.cboCode, "cboCode"),
      description: optionalText(input.description, "description"),
      status: "active",
      createdAt,
      updatedAt: createdAt,
    };

    jobPositions.unshift(jobPosition);
    return jobPosition;
  }

  updateJobPosition(id: string, input: UpdateStructuralJobPositionInput): StructuralJobPosition {
    const jobPosition = this.findJobPosition(id);
    const requestedCompanyId =
      input.companyId === undefined
        ? jobPosition.companyId
        : optionalText(input.companyId, "companyId");
    const department =
      input.departmentId === undefined ? undefined : this.findDepartment(input.departmentId);
    const company =
      requestedCompanyId === undefined
        ? department?.companyId === undefined
          ? undefined
          : this.findCompany(department.companyId)
        : this.findCompany(requestedCompanyId);
    const title = optionalText(input.title, "title") ?? jobPosition.title;
    const audience =
      normalizeAudience(input.audience) ?? department?.audience ?? jobPosition.audience;

    if (
      department !== undefined &&
      company !== undefined &&
      department.companyId !== undefined &&
      department.companyId !== company.id
    ) {
      throw new BadRequestException("Setor nao pertence a empresa informada");
    }

    this.ensureUniqueJobTitle(audience, title, id);

    jobPosition.companyId = company?.id;
    jobPosition.companyTradeName = company?.tradeName;
    jobPosition.departmentId = department?.id ?? jobPosition.departmentId;
    jobPosition.departmentName = department?.name ?? jobPosition.departmentName;
    jobPosition.title = title;
    jobPosition.audience = audience;
    jobPosition.eSocialCode =
      optionalText(input.eSocialCode, "eSocialCode") ?? jobPosition.eSocialCode;
    jobPosition.cboCode = optionalText(input.cboCode, "cboCode") ?? jobPosition.cboCode;
    jobPosition.description =
      optionalText(input.description, "description") ?? jobPosition.description;
    jobPosition.status = normalizeStatus(input.status, "status") ?? jobPosition.status;
    jobPosition.updatedAt = now();

    return jobPosition;
  }

  deactivateJobPosition(id: string): StructuralJobPosition {
    return this.updateJobPosition(id, { status: "inactive" });
  }

  listEmployees(): StructuralEmployee[] {
    return employees.filter((employee) => employee.registrationStatus !== "inactive");
  }

  getEmployee(id: string): StructuralEmployee {
    return this.findEmployee(id);
  }

  listEmployeeMovements(): EmployeeMovementRequest[] {
    return employeeMovements;
  }

  createEmployeeMovement(input: CreateEmployeeMovementInput): EmployeeMovementRequest {
    const type = normalizeMovementType(input.type);
    const source = normalizeMovementSource(input.source);
    const company = this.findCompany(input.companyId);
    const employee =
      type === "inclusion"
        ? undefined
        : this.findEmployee(requireText(input.employeeId, "employeeId"));

    if (employee !== undefined && employee.companyId !== company.id) {
      throw new BadRequestException("Cliente nao pertence a empresa informada");
    }

    const cpf =
      type === "inclusion"
        ? normalizeCpf(input.cpf)
        : (optionalCpf(input.cpf, "cpf") ?? employee?.cpf);

    if (cpf === undefined) {
      throw new BadRequestException("CPF da movimentacao nao encontrado");
    }

    if (
      employeeMovements.some(
        (movement) =>
          movement.status === "pending" &&
          movement.companyId === company.id &&
          movement.type === type &&
          onlyDigits(movement.cpf) === onlyDigits(cpf) &&
          (movement.employeeId ?? "") === (employee?.id ?? ""),
      )
    ) {
      throw new ConflictException("Ja existe movimentacao pendente para este cliente");
    }

    if (
      type === "inclusion" &&
      employees.some(
        (existingEmployee) =>
          existingEmployee.companyId === company.id &&
          onlyDigits(existingEmployee.cpf) === onlyDigits(cpf),
      )
    ) {
      throw new ConflictException("Ja existe colaborador com este CPF nesta empresa");
    }

    const fullName =
      type === "inclusion"
        ? requireText(input.fullName, "fullName")
        : (optionalText(input.fullName, "fullName") ?? employee?.fullName);
    const department =
      type === "inclusion"
        ? requireText(input.department, "department")
        : (optionalText(input.department, "department") ?? employee?.department);
    const jobPosition =
      type === "inclusion"
        ? requireText(input.jobPosition, "jobPosition")
        : (optionalText(input.jobPosition, "jobPosition") ?? employee?.jobPosition);

    if (fullName === undefined || department === undefined || jobPosition === undefined) {
      throw new BadRequestException("Dados obrigatorios da movimentacao incompletos");
    }

    const exclusionDate = optionalText(input.exclusionDate, "exclusionDate");

    if (type === "termination" && exclusionDate === undefined) {
      throw new BadRequestException("Data de desligamento obrigatoria");
    }

    if (
      type === "update" &&
      input.fullName === undefined &&
      input.cpf === undefined &&
      input.birthDate === undefined &&
      input.department === undefined &&
      input.jobPosition === undefined &&
      input.cboCode === undefined &&
      input.email === undefined &&
      input.phone === undefined
    ) {
      throw new BadRequestException("Informe ao menos um campo para alteracao cadastral");
    }

    const createdAt = now();
    const movement: EmployeeMovementRequest = {
      id: randomUUID(),
      type,
      status: "pending",
      source,
      companyId: company.id,
      companyTradeName: company.tradeName,
      employeeId: employee?.id,
      fullName,
      cpf,
      birthDate: optionalText(input.birthDate, "birthDate") ?? employee?.birthDate,
      inclusionDate:
        optionalText(input.inclusionDate, "inclusionDate") ??
        employee?.inclusionDate ??
        createdAt.slice(0, 10),
      exclusionDate,
      department,
      jobPosition,
      cboCode: optionalText(input.cboCode, "cboCode") ?? employee?.cboCode,
      email: optionalText(input.email, "email") ?? employee?.email,
      phone: optionalText(input.phone, "phone") ?? employee?.phone,
      notes: optionalText(input.notes, "notes"),
      requestedBy: optionalText(input.requestedBy, "requestedBy"),
      createdAt,
      updatedAt: createdAt,
      slaDueAt: movementSlaDueAt(createdAt),
    };

    employeeMovements.unshift(movement);
    return movement;
  }

  updateEmployeeMovement(id: string, input: UpdateEmployeeMovementInput): EmployeeMovementRequest {
    const movement = this.findEmployeeMovement(id);
    const status = normalizeMovementStatus(input.status);

    if (movement.status !== "pending") {
      throw new BadRequestException("Movimentacao ja finalizada");
    }

    const decidedAt = now();
    const reviewerName = optionalText(input.reviewerName, "reviewerName");

    if (status === "approved") {
      if (movement.type === "inclusion") {
        const employee = this.createEmployee({
          birthDate: movement.birthDate,
          companyId: movement.companyId,
          cpf: movement.cpf,
          department: movement.department,
          email: movement.email,
          fullName: movement.fullName,
          inclusionDate: movement.inclusionDate,
          jobPosition: movement.jobPosition,
          cboCode: movement.cboCode,
          phone: movement.phone,
        });
        employee.registrationStatus = "active";
        employee.updatedAt = decidedAt;
        movement.employeeId = employee.id;
      }

      if (movement.type === "update") {
        if (movement.employeeId === undefined) {
          throw new BadRequestException("Movimentacao sem cliente vinculado");
        }

        this.updateEmployee(movement.employeeId, {
          birthDate: movement.birthDate,
          cpf: movement.cpf,
          department: movement.department,
          email: movement.email,
          fullName: movement.fullName,
          jobPosition: movement.jobPosition,
          cboCode: movement.cboCode,
          phone: movement.phone,
          registrationStatus: "active",
        });
      }

      if (movement.type === "termination") {
        if (movement.employeeId === undefined) {
          throw new BadRequestException("Movimentacao sem cliente vinculado");
        }

        this.updateEmployee(movement.employeeId, {
          exclusionDate: movement.exclusionDate ?? decidedAt.slice(0, 10),
          registrationStatus: "inactive",
        });
      }
    }

    movement.status = status;
    movement.reviewerName = reviewerName ?? movement.reviewerName;
    movement.updatedAt = decidedAt;
    movement.decidedAt = decidedAt;

    return movement;
  }

  createEmployee(input: CreateStructuralEmployeeInput): StructuralEmployee {
    const company = this.findCompany(input.companyId);
    const cpf = normalizeCpf(input.cpf);

    if (
      employees.some(
        (employee) =>
          employee.companyId === company.id && onlyDigits(employee.cpf) === onlyDigits(cpf),
      )
    ) {
      throw new ConflictException("Ja existe colaborador com este CPF nesta empresa");
    }

    const createdAt = now();
    const employee: StructuralEmployee = {
      id: randomUUID(),
      companyId: company.id,
      companyTradeName: company.tradeName,
      fullName: requireText(input.fullName, "fullName"),
      cpf,
      birthDate: optionalText(input.birthDate, "birthDate"),
      inclusionDate: optionalText(input.inclusionDate, "inclusionDate") ?? createdAt.slice(0, 10),
      exclusionDate: optionalText(input.exclusionDate, "exclusionDate"),
      department: requireText(input.department, "department"),
      jobPosition: requireText(input.jobPosition, "jobPosition"),
      cboCode: optionalText(input.cboCode, "cboCode"),
      email: optionalText(input.email, "email"),
      phone: optionalText(input.phone, "phone"),
      registrationStatus: "pending_validation",
      createdAt,
      updatedAt: createdAt,
    };

    employees.unshift(employee);
    company.employees += 1;
    company.updatedAt = createdAt;

    return employee;
  }

  updateEmployee(id: string, input: UpdateStructuralEmployeeInput): StructuralEmployee {
    const employee = this.findEmployee(id);
    const previousCompany = this.findCompany(employee.companyId);
    const company =
      input.companyId === undefined ? previousCompany : this.findCompany(input.companyId);
    const cpf = input.cpf === undefined ? undefined : normalizeCpf(input.cpf);
    const previousStatus = employee.registrationStatus;
    const nextStatus =
      normalizeStatus(input.registrationStatus, "registrationStatus") ??
      employee.registrationStatus;

    if (
      cpf !== undefined &&
      employees.some(
        (existingEmployee) =>
          existingEmployee.id !== id &&
          existingEmployee.companyId === company.id &&
          onlyDigits(existingEmployee.cpf) === onlyDigits(cpf),
      )
    ) {
      throw new ConflictException("Ja existe colaborador com este CPF nesta empresa");
    }

    if (company.id !== employee.companyId && activeStatuses.has(previousStatus)) {
      previousCompany.employees = Math.max(previousCompany.employees - 1, 0);
      previousCompany.updatedAt = now();
    }

    if (company.id !== employee.companyId && activeStatuses.has(nextStatus)) {
      company.employees += 1;
    }

    if (
      company.id === employee.companyId &&
      activeStatuses.has(previousStatus) &&
      nextStatus === "inactive"
    ) {
      company.employees = Math.max(company.employees - 1, 0);
    }

    if (
      company.id === employee.companyId &&
      previousStatus === "inactive" &&
      activeStatuses.has(nextStatus)
    ) {
      company.employees += 1;
    }

    employee.companyId = company.id;
    employee.companyTradeName = company.tradeName;
    employee.fullName = optionalText(input.fullName, "fullName") ?? employee.fullName;
    employee.cpf = cpf ?? employee.cpf;
    employee.birthDate = optionalText(input.birthDate, "birthDate") ?? employee.birthDate;
    employee.inclusionDate =
      optionalText(input.inclusionDate, "inclusionDate") ?? employee.inclusionDate;
    employee.exclusionDate =
      optionalText(input.exclusionDate, "exclusionDate") ?? employee.exclusionDate;
    employee.department = optionalText(input.department, "department") ?? employee.department;
    employee.jobPosition = optionalText(input.jobPosition, "jobPosition") ?? employee.jobPosition;
    employee.cboCode = optionalText(input.cboCode, "cboCode") ?? employee.cboCode;
    employee.email = optionalText(input.email, "email") ?? employee.email;
    employee.phone = optionalText(input.phone, "phone") ?? employee.phone;
    employee.registrationStatus = nextStatus;
    employee.updatedAt = now();
    company.updatedAt = employee.updatedAt;

    return employee;
  }

  deactivateEmployee(id: string): StructuralEmployee {
    return this.updateEmployee(id, { registrationStatus: "inactive" });
  }

  lookupEmployeeAccess(input: EmployeeAccessLookupInput): EmployeeAccessProfile {
    const cpf = normalizeCpf(input.cpf);
    const employee = employees.find((item) => onlyDigits(item.cpf) === onlyDigits(cpf));

    if (employee === undefined || employee.registrationStatus === "inactive") {
      throw new NotFoundException("CPF nao encontrado na base de colaboradores");
    }

    return this.toEmployeeAccessProfile(employee);
  }

  listEmployeeDivergences(): EmployeeDivergenceRequest[] {
    return employeeDivergences;
  }

  submitEmployeeDivergence(input: SubmitEmployeeDivergenceInput): EmployeeDivergenceRequest {
    const employee = this.findEmployee(input.employeeId);
    const changes = this.buildDivergenceChanges(employee, input.submittedData);

    if (changes.length === 0) {
      throw new BadRequestException("Nenhuma divergencia encontrada nos dados enviados");
    }

    const createdAt = now();
    const divergence: EmployeeDivergenceRequest = {
      id: randomUUID(),
      employeeId: employee.id,
      companyTradeName: employee.companyTradeName,
      fullName: employee.fullName,
      cpf: employee.cpf,
      changes,
      status: "pending",
      createdAt,
      updatedAt: createdAt,
    };

    employeeDivergences.unshift(divergence);
    employee.registrationStatus = "blocked";
    employee.registrationConfirmedAt = createdAt;
    employee.updatedAt = createdAt;
    if (
      accessState.employeeRegistrationConfirmations.every((item) => item.employeeId !== employee.id)
    ) {
      accessState.employeeRegistrationConfirmations.push({
        confirmedAt: createdAt,
        employeeId: employee.id,
      });
    }
    saveAccessState(accessState);

    return divergence;
  }

  updateEmployeeDivergence(
    id: string,
    input: UpdateEmployeeDivergenceInput,
  ): EmployeeDivergenceRequest {
    const divergence = this.findEmployeeDivergence(id);
    const status = normalizeDivergenceStatus(input.status);

    divergence.status = status;
    divergence.reviewerName =
      optionalText(input.reviewerName, "reviewerName") ?? divergence.reviewerName;
    divergence.updatedAt = now();

    if (status === "approved") {
      const employee = this.findEmployee(divergence.employeeId);

      for (const change of divergence.changes) {
        employee[change.field] = change.submittedValue;
      }

      employee.registrationStatus = "active";
      employee.updatedAt = divergence.updatedAt;
    }

    if (status === "rejected") {
      const employee = this.findEmployee(divergence.employeeId);
      employee.registrationStatus = "active";
      employee.updatedAt = divergence.updatedAt;
    }

    return divergence;
  }

  importEmployees(input: ImportStructuralEmployeesInput): StructuralEmployeeImportResult {
    const dryRun = input.dryRun ?? true;
    const rows = parseCsv(requireText(input.content, "content"), input.delimiter);
    const createdEmployees: StructuralEmployee[] = [];
    const skipped: StructuralEmployeeImportIssue[] = [];
    const errors: StructuralEmployeeImportIssue[] = [];

    for (const { rowNumber, row } of rows) {
      try {
        const company = this.resolveCompanyForImport(row, input.defaultCompanyId);
        const fullName = requireText(
          pickRowValue(row, ["nomecompleto", "nome", "fullname", "name"]),
          "nome",
        );
        const cpf = normalizeCpf(pickRowValue(row, ["cpf"]));
        const department = requireText(
          pickRowValue(row, ["setor", "department", "departamento"]),
          "setor",
        );
        const jobPosition = requireText(
          pickRowValue(row, ["cargo", "jobposition", "funcao"]),
          "cargo",
        );

        if (
          employees.some(
            (employee) =>
              employee.companyId === company.id && onlyDigits(employee.cpf) === onlyDigits(cpf),
          )
        ) {
          skipped.push({
            rowNumber,
            row,
            message: "Colaborador ja cadastrado para esta empresa",
          });
          continue;
        }

        if (!dryRun) {
          const employee = this.createEmployee({
            companyId: company.id,
            fullName,
            cpf,
            birthDate: pickRowValue(row, ["datanascimento", "nascimento", "birthdate"]),
            inclusionDate: pickRowValue(row, ["datainclusao", "admissao", "inclusiondate"]),
            department,
            jobPosition,
            cboCode: pickRowValue(row, ["cbo", "codigocbo", "cbocode"]),
            email: pickRowValue(row, ["email", "emailcorporativo"]),
            phone: pickRowValue(row, ["telefone", "phone", "whatsapp", "celular"]),
          });

          createdEmployees.push(employee);
        }
      } catch (error) {
        errors.push({
          rowNumber,
          row,
          message: error instanceof Error ? error.message : "Erro desconhecido na linha",
        });
      }
    }

    const createdRows = createdEmployees.length;
    const skippedRows = skipped.length;
    const errorRows = errors.length;

    return {
      dryRun,
      totalRows: rows.length,
      validRows: rows.length - skippedRows - errorRows,
      createdRows,
      skippedRows,
      errorRows,
      createdEmployees,
      skipped,
      errors,
    };
  }

  private ensureEmployeeCredential(employee: StructuralEmployee): AccessCredential {
    let credential = accessState.employeeCredentials.find((item) => item.subjectId === employee.id);

    if (credential === undefined) {
      credential = {
        mustChangePassword: true,
        passwordHash: hashPassword("employee", employee.id, defaultEmployeePassword(employee.cpf)),
        subjectId: employee.id,
        updatedAt: now(),
      };
      accessState.employeeCredentials.push(credential);
      saveAccessState(accessState);
    }

    return credential;
  }

  private ensureClientCredential(company: StructuralCompany): AccessCredential {
    let credential = accessState.clientCredentials.find((item) => item.subjectId === company.id);

    if (credential === undefined) {
      credential = {
        mustChangePassword: true,
        passwordHash: hashPassword("client", company.id, defaultClientPassword(company.cnpj)),
        subjectId: company.id,
        updatedAt: now(),
      };
      accessState.clientCredentials.push(credential);
      saveAccessState(accessState);
    }

    return credential;
  }

  private ensurePronusCredential(user: PronusAccessUser): AccessCredential {
    let credential = accessState.pronusCredentials.find((item) => item.subjectId === user.id);

    if (credential === undefined) {
      credential = {
        mustChangePassword: true,
        passwordHash: hashPassword("pronus", user.id, defaultPronusPassword(user.cpf)),
        subjectId: user.id,
        updatedAt: now(),
      };
      accessState.pronusCredentials.push(credential);
      saveAccessState(accessState);
    }

    return credential;
  }

  private findPronusAccessUser(id: string): PronusAccessUser {
    const user = pronusAccessUsers.find((item) => item.id === id);

    if (user === undefined) {
      throw new NotFoundException("Usuario PRONUS nao encontrado");
    }

    return user;
  }

  private findCompany(id: string): StructuralCompany {
    const company = companies.find((item) => item.id === id);

    if (company === undefined) {
      throw new NotFoundException("Empresa nao encontrada");
    }

    return company;
  }

  private resolveCompanyForImport(
    row: Record<string, string>,
    defaultCompanyId?: string,
  ): StructuralCompany {
    const companyId =
      pickRowValue(row, ["companyid", "empresaid", "idempresa"]) ?? defaultCompanyId;

    if (companyId !== undefined) {
      return this.findCompany(companyId);
    }

    const cnpj = pickRowValue(row, ["cnpj", "companycnpj", "empresacnpj"]);

    if (cnpj === undefined) {
      throw new BadRequestException("Linha sem companyId/defaultCompanyId ou CNPJ");
    }

    const company = companies.find((item) => onlyDigits(item.cnpj) === onlyDigits(cnpj));

    if (company === undefined) {
      throw new NotFoundException("Empresa nao encontrada pelo CNPJ informado");
    }

    return company;
  }

  private findUnit(id: string): StructuralUnit {
    const unit = units.find((item) => item.id === id);

    if (unit === undefined) {
      throw new NotFoundException("Unidade nao encontrada");
    }

    return unit;
  }

  private findDepartment(id: string): StructuralDepartment {
    const department = departments.find((item) => item.id === id);

    if (department === undefined) {
      throw new NotFoundException("Setor nao encontrado");
    }

    return department;
  }

  private findJobPosition(id: string): StructuralJobPosition {
    const jobPosition = jobPositions.find((item) => item.id === id);

    if (jobPosition === undefined) {
      throw new NotFoundException("Cargo nao encontrado");
    }

    return jobPosition;
  }

  private findEmployee(id: string): StructuralEmployee {
    const employee = employees.find((item) => item.id === id);

    if (employee === undefined) {
      throw new NotFoundException("Colaborador nao encontrado");
    }

    return employee;
  }

  private findEmployeeMovement(id: string): EmployeeMovementRequest {
    const movement = employeeMovements.find((item) => item.id === id);

    if (movement === undefined) {
      throw new NotFoundException("Movimentacao cadastral nao encontrada");
    }

    return movement;
  }

  private findEmployeeDivergence(id: string): EmployeeDivergenceRequest {
    const divergence = employeeDivergences.find((item) => item.id === id);

    if (divergence === undefined) {
      throw new NotFoundException("Divergencia cadastral nao encontrada");
    }

    return divergence;
  }

  private toEmployeeAccessProfile(employee: StructuralEmployee): EmployeeAccessProfile {
    const credential = this.ensureEmployeeCredential(employee);
    const confirmation = accessState.employeeRegistrationConfirmations.find(
      (item) => item.employeeId === employee.id,
    );

    return {
      employeeId: employee.id,
      companyTradeName: employee.companyTradeName,
      fullName: employee.fullName,
      cpf: employee.cpf,
      department: employee.department,
      jobPosition: employee.jobPosition,
      email: employee.email,
      phone: employee.phone,
      registrationStatus: employee.registrationStatus,
      registrationConfirmedAt: employee.registrationConfirmedAt ?? confirmation?.confirmedAt,
      mustChangePassword: credential.mustChangePassword,
    };
  }

  private toClientAccessProfile(company: StructuralCompany): ClientAccessProfile {
    const credential = this.ensureClientCredential(company);

    return {
      cnpj: company.cnpj,
      companyId: company.id,
      companyTradeName: company.tradeName,
      mustChangePassword: credential.mustChangePassword,
    };
  }

  private toPronusAccessProfile(user: PronusAccessUser): PronusAccessProfile {
    const credential = this.ensurePronusCredential(user);
    const isMaster = user.role === "master_admin";
    const isAdministrative = user.role === "administrative" || isMaster;

    return {
      ...user,
      mustChangePassword: credential.mustChangePassword,
      permissions: {
        canManageCompanies: isAdministrative,
        canManageSchedule: isAdministrative || user.role === "clinical",
        canResetPronusUsers: isMaster,
        canViewClinicalRecords: isMaster || user.role === "clinical",
        fullAccess: isMaster,
      },
    };
  }

  private buildDivergenceChanges(
    employee: StructuralEmployee,
    submittedData: SubmitEmployeeDivergenceInput["submittedData"],
  ): EmployeeDivergenceChange[] {
    const fields: EmployeeDivergenceChange["field"][] = [
      "email",
      "phone",
      "department",
      "jobPosition",
    ];
    const changes: EmployeeDivergenceChange[] = [];

    for (const field of fields) {
      const submittedValue = valueOrEmpty(submittedData[field]);
      const currentValue = valueOrEmpty(employee[field]);

      if (submittedValue.length > 0 && submittedValue !== currentValue) {
        changes.push({
          field,
          currentValue,
          submittedValue,
        });
      }
    }

    return changes;
  }

  private ensureUniqueUnitName(companyId: string, name: string, currentId?: string): void {
    const normalizedName = name.toLowerCase();
    const duplicated = units.some(
      (unit) =>
        unit.id !== currentId &&
        unit.companyId === companyId &&
        unit.name.toLowerCase() === normalizedName,
    );

    if (duplicated) {
      throw new ConflictException("Ja existe unidade com este nome nesta empresa");
    }
  }

  private ensureUniqueDepartmentName(
    audience: StructuralAudience,
    name: string,
    currentId?: string,
  ): void {
    const normalizedName = name.toLowerCase();
    const duplicated = departments.some(
      (department) =>
        department.id !== currentId &&
        department.audience === audience &&
        department.name.toLowerCase() === normalizedName,
    );

    if (duplicated) {
      throw new ConflictException("Ja existe setor com este nome neste perfil");
    }
  }

  private ensureUniqueJobTitle(
    audience: StructuralAudience,
    title: string,
    currentId?: string,
  ): void {
    const normalizedTitle = title.toLowerCase();
    const duplicated = jobPositions.some(
      (jobPosition) =>
        jobPosition.id !== currentId &&
        jobPosition.audience === audience &&
        jobPosition.title.toLowerCase() === normalizedTitle,
    );

    if (duplicated) {
      throw new ConflictException("Ja existe cargo com este titulo neste perfil");
    }
  }

  private syncCompanyNameOnEmployees(company: StructuralCompany): void {
    for (const unit of units) {
      if (unit.companyId === company.id) {
        unit.companyTradeName = company.tradeName;
      }
    }

    for (const department of departments) {
      if (department.companyId === company.id) {
        department.companyTradeName = company.tradeName;
      }
    }

    for (const jobPosition of jobPositions) {
      if (jobPosition.companyId === company.id) {
        jobPosition.companyTradeName = company.tradeName;
      }
    }

    for (const employee of employees) {
      if (employee.companyId === company.id) {
        employee.companyTradeName = company.tradeName;
      }
    }

    for (const movement of employeeMovements) {
      if (movement.companyId === company.id) {
        movement.companyTradeName = company.tradeName;
      }
    }
  }

  private syncUnitNameOnDepartments(unit: StructuralUnit): void {
    for (const department of departments) {
      if (department.unitId === unit.id) {
        department.unitName = unit.name;
      }
    }
  }

  private syncDepartmentNameOnJobPositions(department: StructuralDepartment): void {
    for (const jobPosition of jobPositions) {
      if (jobPosition.departmentId === department.id) {
        jobPosition.departmentName = department.name;
      }
    }
  }
}
