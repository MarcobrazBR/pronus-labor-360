import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import type {
  CreateStructuralCompanyInput,
  CreateStructuralDepartmentInput,
  CreateStructuralEmployeeInput,
  CreateStructuralJobPositionInput,
  CreateStructuralUnitInput,
  EmployeeAccessLookupInput,
  EmployeeAccessProfile,
  EmployeeDivergenceChange,
  EmployeeDivergenceRequest,
  EmployeeDivergenceStatus,
  ImportStructuralEmployeesInput,
  StructuralCompany,
  StructuralDepartment,
  StructuralEmployee,
  StructuralEmployeeImportIssue,
  StructuralEmployeeImportResult,
  StructuralJobPosition,
  StructuralStatus,
  StructuralSummary,
  SubmitEmployeeDivergenceInput,
  UpdateStructuralCompanyInput,
  UpdateStructuralDepartmentInput,
  UpdateEmployeeDivergenceInput,
  UpdateStructuralEmployeeInput,
  UpdateStructuralJobPositionInput,
  UpdateStructuralUnitInput,
  StructuralUnit,
} from "./structural.types";

const activeStatuses = new Set<StructuralStatus>(["active", "pending_validation"]);
const validStatuses = new Set<StructuralStatus>([
  "active",
  "pending_validation",
  "blocked",
  "inactive",
]);
const divergenceStatuses = new Set<EmployeeDivergenceStatus>(["pending", "approved", "rejected"]);

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

function normalizeDivergenceStatus(value: unknown): EmployeeDivergenceStatus {
  if (typeof value !== "string" || !divergenceStatuses.has(value as EmployeeDivergenceStatus)) {
    throw new BadRequestException("Status de divergencia invalido");
  }

  return value as EmployeeDivergenceStatus;
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

function now(): string {
  return new Date().toISOString();
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

    if (char === "\"" && quoted && nextChar === "\"") {
      current += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
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

function parseCsv(content: string, delimiter?: "," | ";"): Array<{
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
    cboCode: "7842-05",
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
    cboCode: "3516-05",
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
    cboCode: "5201-10",
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
    cboCode: "4141-05",
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
    const company = this.findCompany(input.companyId);
    const unit = input.unitId === undefined ? undefined : this.findUnit(input.unitId);
    const name = requireText(input.name, "name");

    if (unit !== undefined && unit.companyId !== company.id) {
      throw new BadRequestException("Unidade nao pertence a empresa informada");
    }

    this.ensureUniqueDepartmentName(company.id, name);

    const createdAt = now();
    const department: StructuralDepartment = {
      id: randomUUID(),
      companyId: company.id,
      companyTradeName: company.tradeName,
      unitId: unit?.id,
      unitName: unit?.name,
      name,
      code: optionalText(input.code, "code"),
      status: "active",
      createdAt,
      updatedAt: createdAt,
    };

    departments.unshift(department);
    company.departments += 1;
    company.updatedAt = createdAt;

    return department;
  }

  updateDepartment(
    id: string,
    input: UpdateStructuralDepartmentInput,
  ): StructuralDepartment {
    const department = this.findDepartment(id);
    const previousCompany = this.findCompany(department.companyId);
    const company =
      input.companyId === undefined ? previousCompany : this.findCompany(input.companyId);
    const unit = input.unitId === undefined ? undefined : this.findUnit(input.unitId);
    const name = optionalText(input.name, "name") ?? department.name;
    const nextStatus = normalizeStatus(input.status, "status") ?? department.status;

    if (unit !== undefined && unit.companyId !== company.id) {
      throw new BadRequestException("Unidade nao pertence a empresa informada");
    }

    this.ensureUniqueDepartmentName(company.id, name, department.id);

    if (company.id !== previousCompany.id) {
      previousCompany.departments = Math.max(previousCompany.departments - 1, 0);
      previousCompany.updatedAt = now();
      company.departments += 1;
    }

    if (department.status !== "inactive" && nextStatus === "inactive") {
      company.departments = Math.max(company.departments - 1, 0);
    }

    if (department.status === "inactive" && nextStatus !== "inactive") {
      company.departments += 1;
    }

    department.companyId = company.id;
    department.companyTradeName = company.tradeName;
    department.unitId = unit?.id ?? department.unitId;
    department.unitName = unit?.name ?? department.unitName;
    department.name = name;
    department.code = optionalText(input.code, "code") ?? department.code;
    department.status = nextStatus;
    department.updatedAt = now();
    company.updatedAt = department.updatedAt;

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
    const company = this.findCompany(input.companyId);
    const department =
      input.departmentId === undefined ? undefined : this.findDepartment(input.departmentId);
    const title = requireText(input.title, "title");

    if (department !== undefined && department.companyId !== company.id) {
      throw new BadRequestException("Setor nao pertence a empresa informada");
    }

    this.ensureUniqueJobTitle(company.id, title, department?.id);

    const createdAt = now();
    const jobPosition: StructuralJobPosition = {
      id: randomUUID(),
      companyId: company.id,
      companyTradeName: company.tradeName,
      departmentId: department?.id,
      departmentName: department?.name,
      title,
      cboCode: optionalText(input.cboCode, "cboCode"),
      description: optionalText(input.description, "description"),
      status: "active",
      createdAt,
      updatedAt: createdAt,
    };

    jobPositions.unshift(jobPosition);
    return jobPosition;
  }

  updateJobPosition(
    id: string,
    input: UpdateStructuralJobPositionInput,
  ): StructuralJobPosition {
    const jobPosition = this.findJobPosition(id);
    const company =
      input.companyId === undefined
        ? this.findCompany(jobPosition.companyId)
        : this.findCompany(input.companyId);
    const department =
      input.departmentId === undefined ? undefined : this.findDepartment(input.departmentId);
    const title = optionalText(input.title, "title") ?? jobPosition.title;

    if (department !== undefined && department.companyId !== company.id) {
      throw new BadRequestException("Setor nao pertence a empresa informada");
    }

    this.ensureUniqueJobTitle(company.id, title, department?.id ?? jobPosition.departmentId, id);

    jobPosition.companyId = company.id;
    jobPosition.companyTradeName = company.tradeName;
    jobPosition.departmentId = department?.id ?? jobPosition.departmentId;
    jobPosition.departmentName = department?.name ?? jobPosition.departmentName;
    jobPosition.title = title;
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
      department: requireText(input.department, "department"),
      jobPosition: requireText(input.jobPosition, "jobPosition"),
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
      normalizeStatus(input.registrationStatus, "registrationStatus") ?? employee.registrationStatus;

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

    if (company.id === employee.companyId && activeStatuses.has(previousStatus) && nextStatus === "inactive") {
      company.employees = Math.max(company.employees - 1, 0);
    }

    if (company.id === employee.companyId && previousStatus === "inactive" && activeStatuses.has(nextStatus)) {
      company.employees += 1;
    }

    employee.companyId = company.id;
    employee.companyTradeName = company.tradeName;
    employee.fullName = optionalText(input.fullName, "fullName") ?? employee.fullName;
    employee.cpf = cpf ?? employee.cpf;
    employee.department = optionalText(input.department, "department") ?? employee.department;
    employee.jobPosition = optionalText(input.jobPosition, "jobPosition") ?? employee.jobPosition;
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
    employee.updatedAt = createdAt;

    return divergence;
  }

  updateEmployeeDivergence(
    id: string,
    input: UpdateEmployeeDivergenceInput,
  ): EmployeeDivergenceRequest {
    const divergence = this.findEmployeeDivergence(id);
    const status = normalizeDivergenceStatus(input.status);

    divergence.status = status;
    divergence.reviewerName = optionalText(input.reviewerName, "reviewerName") ?? divergence.reviewerName;
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
            department,
            jobPosition,
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
    const companyId = pickRowValue(row, ["companyid", "empresaid", "idempresa"]) ?? defaultCompanyId;

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

  private findEmployeeDivergence(id: string): EmployeeDivergenceRequest {
    const divergence = employeeDivergences.find((item) => item.id === id);

    if (divergence === undefined) {
      throw new NotFoundException("Divergencia cadastral nao encontrada");
    }

    return divergence;
  }

  private toEmployeeAccessProfile(employee: StructuralEmployee): EmployeeAccessProfile {
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

  private ensureUniqueDepartmentName(companyId: string, name: string, currentId?: string): void {
    const normalizedName = name.toLowerCase();
    const duplicated = departments.some(
      (department) =>
        department.id !== currentId &&
        department.companyId === companyId &&
        department.name.toLowerCase() === normalizedName,
    );

    if (duplicated) {
      throw new ConflictException("Ja existe setor com este nome nesta empresa");
    }
  }

  private ensureUniqueJobTitle(
    companyId: string,
    title: string,
    departmentId?: string,
    currentId?: string,
  ): void {
    const normalizedTitle = title.toLowerCase();
    const duplicated = jobPositions.some(
      (jobPosition) =>
        jobPosition.id !== currentId &&
        jobPosition.companyId === companyId &&
        jobPosition.departmentId === departmentId &&
        jobPosition.title.toLowerCase() === normalizedTitle,
    );

    if (duplicated) {
      throw new ConflictException("Ja existe cargo com este titulo neste setor");
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
