export type StructuralStatus = "active" | "pending_validation" | "blocked" | "inactive";
export type CompanyContractStatus =
  | "prospecting"
  | "onboarding"
  | "active"
  | "suspended"
  | "closed";
export type StructuralAudience =
  | "client"
  | "client_hr"
  | "client_manager"
  | "pronus_administrative"
  | "pronus_clinical";

export interface StructuralCompany {
  id: string;
  groupName: string;
  tradeName: string;
  legalName: string;
  cnpj: string;
  contractStatus: CompanyContractStatus;
  contractDueDate?: string;
  selectedPackage?: string;
  eSocialValidFrom?: string;
  eSocialValidTo?: string;
  taxClassification?: string;
  cooperativeIndicator?: string;
  constructionCompanyIndicator?: string;
  payrollExemptionIndicator?: string;
  electronicRegistrationIndicator?: string;
  educationalEntityIndicator?: string;
  temporaryWorkCompanyIndicator?: string;
  temporaryWorkRegistration?: string;
  primaryCnae?: string;
  contactName?: string;
  contactCpf?: string;
  contactPhone?: string;
  contactMobile?: string;
  contactEmail?: string;
  units: number;
  departments: number;
  employees: number;
  status: StructuralStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StructuralEmployee {
  id: string;
  companyId: string;
  companyTradeName: string;
  fullName: string;
  cpf: string;
  birthDate?: string;
  inclusionDate?: string;
  exclusionDate?: string;
  department: string;
  jobPosition: string;
  cboCode?: string;
  email?: string;
  phone?: string;
  registrationStatus: StructuralStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StructuralUnit {
  id: string;
  companyId: string;
  companyTradeName: string;
  name: string;
  code?: string;
  status: StructuralStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StructuralDepartment {
  id: string;
  companyId?: string;
  companyTradeName?: string;
  unitId?: string;
  unitName?: string;
  name: string;
  code?: string;
  audience: StructuralAudience;
  status: StructuralStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StructuralJobPosition {
  id: string;
  companyId?: string;
  companyTradeName?: string;
  departmentId?: string;
  departmentName?: string;
  title: string;
  audience: StructuralAudience;
  eSocialCode?: string;
  cboCode?: string;
  description?: string;
  status: StructuralStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StructuralSummary {
  generatedAt: string;
  companies: number;
  units: number;
  departments: number;
  jobPositions: number;
  employees: number;
  pendingValidations: number;
}

export interface CreateStructuralCompanyInput {
  groupName: string;
  tradeName: string;
  legalName: string;
  cnpj: string;
  contractStatus?: CompanyContractStatus;
  contractDueDate?: string;
  selectedPackage?: string;
  eSocialValidFrom?: string;
  eSocialValidTo?: string;
  taxClassification?: string;
  cooperativeIndicator?: string;
  constructionCompanyIndicator?: string;
  payrollExemptionIndicator?: string;
  electronicRegistrationIndicator?: string;
  educationalEntityIndicator?: string;
  temporaryWorkCompanyIndicator?: string;
  temporaryWorkRegistration?: string;
  primaryCnae?: string;
  contactName?: string;
  contactCpf?: string;
  contactPhone?: string;
  contactMobile?: string;
  contactEmail?: string;
  units?: number;
  departments?: number;
}

export interface CreateStructuralUnitInput {
  companyId: string;
  name: string;
  code?: string;
}

export type UpdateStructuralUnitInput = Partial<
  Pick<CreateStructuralUnitInput, "companyId" | "name" | "code">
> & {
  status?: StructuralStatus;
};

export interface CreateStructuralDepartmentInput {
  companyId?: string;
  unitId?: string;
  name: string;
  code?: string;
  audience?: StructuralAudience;
}

export type UpdateStructuralDepartmentInput = Partial<
  Pick<CreateStructuralDepartmentInput, "companyId" | "unitId" | "name" | "code" | "audience">
> & {
  status?: StructuralStatus;
};

export interface CreateStructuralJobPositionInput {
  companyId?: string;
  departmentId?: string;
  title: string;
  audience?: StructuralAudience;
  eSocialCode?: string;
  cboCode?: string;
  description?: string;
}

export type UpdateStructuralJobPositionInput = Partial<
  Pick<
    CreateStructuralJobPositionInput,
    "companyId" | "departmentId" | "title" | "audience" | "eSocialCode" | "cboCode" | "description"
  >
> & {
  status?: StructuralStatus;
};

export type UpdateStructuralCompanyInput = Partial<
  Pick<
    CreateStructuralCompanyInput,
    | "groupName"
    | "tradeName"
    | "legalName"
    | "cnpj"
    | "contractStatus"
    | "contractDueDate"
    | "selectedPackage"
    | "eSocialValidFrom"
    | "eSocialValidTo"
    | "taxClassification"
    | "cooperativeIndicator"
    | "constructionCompanyIndicator"
    | "payrollExemptionIndicator"
    | "electronicRegistrationIndicator"
    | "educationalEntityIndicator"
    | "temporaryWorkCompanyIndicator"
    | "temporaryWorkRegistration"
    | "primaryCnae"
    | "contactName"
    | "contactCpf"
    | "contactPhone"
    | "contactMobile"
    | "contactEmail"
    | "units"
    | "departments"
  >
> & {
  status?: StructuralStatus;
};

export interface CreateStructuralEmployeeInput {
  companyId: string;
  fullName: string;
  cpf: string;
  birthDate?: string;
  inclusionDate?: string;
  exclusionDate?: string;
  department: string;
  jobPosition: string;
  cboCode?: string;
  email?: string;
  phone?: string;
}

export type UpdateStructuralEmployeeInput = Partial<
  Pick<
    CreateStructuralEmployeeInput,
    | "companyId"
    | "fullName"
    | "cpf"
    | "birthDate"
    | "inclusionDate"
    | "exclusionDate"
    | "department"
    | "jobPosition"
    | "cboCode"
    | "email"
    | "phone"
  >
> & {
  registrationStatus?: StructuralStatus;
};

export type EmployeeMovementType = "inclusion" | "update" | "termination";
export type EmployeeMovementStatus = "pending" | "approved" | "rejected";
export type EmployeeMovementSource = "client_portal" | "pronus_portal";

export interface EmployeeMovementRequest {
  id: string;
  type: EmployeeMovementType;
  status: EmployeeMovementStatus;
  source: EmployeeMovementSource;
  companyId: string;
  companyTradeName: string;
  employeeId?: string;
  fullName: string;
  cpf: string;
  birthDate?: string;
  inclusionDate?: string;
  exclusionDate?: string;
  department: string;
  jobPosition: string;
  cboCode?: string;
  email?: string;
  phone?: string;
  notes?: string;
  requestedBy?: string;
  reviewerName?: string;
  createdAt: string;
  updatedAt: string;
  decidedAt?: string;
  slaDueAt: string;
}

export interface CreateEmployeeMovementInput {
  type: EmployeeMovementType;
  source?: EmployeeMovementSource;
  companyId: string;
  employeeId?: string;
  fullName?: string;
  cpf?: string;
  birthDate?: string;
  inclusionDate?: string;
  exclusionDate?: string;
  department?: string;
  jobPosition?: string;
  cboCode?: string;
  email?: string;
  phone?: string;
  notes?: string;
  requestedBy?: string;
}

export interface UpdateEmployeeMovementInput {
  status: EmployeeMovementStatus;
  reviewerName?: string;
}

export interface ImportStructuralEmployeesInput {
  content: string;
  delimiter?: "," | ";";
  dryRun?: boolean;
  defaultCompanyId?: string;
}

export interface StructuralEmployeeImportIssue {
  rowNumber: number;
  message: string;
  row: Record<string, string>;
}

export interface StructuralEmployeeImportResult {
  dryRun: boolean;
  totalRows: number;
  validRows: number;
  createdRows: number;
  skippedRows: number;
  errorRows: number;
  createdEmployees: StructuralEmployee[];
  skipped: StructuralEmployeeImportIssue[];
  errors: StructuralEmployeeImportIssue[];
}

export interface EmployeeAccessLookupInput {
  cpf: string;
}

export interface EmployeeAccessProfile {
  employeeId: string;
  companyTradeName: string;
  fullName: string;
  cpf: string;
  department: string;
  jobPosition: string;
  email?: string;
  phone?: string;
  registrationStatus: StructuralStatus;
}

export type EmployeeDivergenceField = "email" | "phone" | "department" | "jobPosition";

export interface EmployeeAccessSubmittedData {
  email?: string;
  phone?: string;
  department?: string;
  jobPosition?: string;
}

export interface SubmitEmployeeDivergenceInput {
  employeeId: string;
  submittedData: EmployeeAccessSubmittedData;
}

export interface EmployeeDivergenceChange {
  field: EmployeeDivergenceField;
  currentValue: string;
  submittedValue: string;
}

export type EmployeeDivergenceStatus = "pending" | "approved" | "rejected";

export interface EmployeeDivergenceRequest {
  id: string;
  employeeId: string;
  companyTradeName: string;
  fullName: string;
  cpf: string;
  changes: EmployeeDivergenceChange[];
  status: EmployeeDivergenceStatus;
  reviewerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateEmployeeDivergenceInput {
  status: EmployeeDivergenceStatus;
  reviewerName?: string;
}
