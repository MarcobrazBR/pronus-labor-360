export type StructuralStatus = "active" | "pending_validation" | "blocked" | "inactive";

export interface StructuralCompany {
  id: string;
  groupName: string;
  tradeName: string;
  legalName: string;
  cnpj: string;
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
  department: string;
  jobPosition: string;
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
  companyId: string;
  companyTradeName: string;
  unitId?: string;
  unitName?: string;
  name: string;
  code?: string;
  status: StructuralStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StructuralJobPosition {
  id: string;
  companyId: string;
  companyTradeName: string;
  departmentId?: string;
  departmentName?: string;
  title: string;
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
  companyId: string;
  unitId?: string;
  name: string;
  code?: string;
}

export type UpdateStructuralDepartmentInput = Partial<
  Pick<CreateStructuralDepartmentInput, "companyId" | "unitId" | "name" | "code">
> & {
  status?: StructuralStatus;
};

export interface CreateStructuralJobPositionInput {
  companyId: string;
  departmentId?: string;
  title: string;
  cboCode?: string;
  description?: string;
}

export type UpdateStructuralJobPositionInput = Partial<
  Pick<
    CreateStructuralJobPositionInput,
    "companyId" | "departmentId" | "title" | "cboCode" | "description"
  >
> & {
  status?: StructuralStatus;
};

export type UpdateStructuralCompanyInput = Partial<
  Pick<
    CreateStructuralCompanyInput,
    "groupName" | "tradeName" | "legalName" | "cnpj" | "units" | "departments"
  >
> & {
  status?: StructuralStatus;
};

export interface CreateStructuralEmployeeInput {
  companyId: string;
  fullName: string;
  cpf: string;
  department: string;
  jobPosition: string;
  email?: string;
  phone?: string;
}

export type UpdateStructuralEmployeeInput = Partial<
  Pick<
    CreateStructuralEmployeeInput,
    "companyId" | "fullName" | "cpf" | "department" | "jobPosition" | "email" | "phone"
  >
> & {
  registrationStatus?: StructuralStatus;
};
