import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { StructuralService } from "./structural.service";
import type {
  CreateStructuralCompanyInput,
  CreateStructuralDepartmentInput,
  CreateStructuralEmployeeInput,
  CreateStructuralJobPositionInput,
  CreateStructuralUnitInput,
  ImportStructuralEmployeesInput,
  UpdateStructuralCompanyInput,
  UpdateStructuralDepartmentInput,
  UpdateStructuralEmployeeInput,
  UpdateStructuralJobPositionInput,
  UpdateStructuralUnitInput,
} from "./structural.types";

@Controller("structural")
export class StructuralController {
  constructor(private readonly structuralService: StructuralService) {}

  @Get("summary")
  getSummary() {
    return this.structuralService.getSummary();
  }

  @Get("companies")
  listCompanies() {
    return this.structuralService.listCompanies();
  }

  @Get("companies/:id")
  getCompany(@Param("id") id: string) {
    return this.structuralService.getCompany(id);
  }

  @Post("companies")
  createCompany(@Body() body: CreateStructuralCompanyInput) {
    return this.structuralService.createCompany(body);
  }

  @Patch("companies/:id")
  updateCompany(@Param("id") id: string, @Body() body: UpdateStructuralCompanyInput) {
    return this.structuralService.updateCompany(id, body);
  }

  @Delete("companies/:id")
  deactivateCompany(@Param("id") id: string) {
    return this.structuralService.deactivateCompany(id);
  }

  @Get("units")
  listUnits() {
    return this.structuralService.listUnits();
  }

  @Get("units/:id")
  getUnit(@Param("id") id: string) {
    return this.structuralService.getUnit(id);
  }

  @Post("units")
  createUnit(@Body() body: CreateStructuralUnitInput) {
    return this.structuralService.createUnit(body);
  }

  @Patch("units/:id")
  updateUnit(@Param("id") id: string, @Body() body: UpdateStructuralUnitInput) {
    return this.structuralService.updateUnit(id, body);
  }

  @Delete("units/:id")
  deactivateUnit(@Param("id") id: string) {
    return this.structuralService.deactivateUnit(id);
  }

  @Get("departments")
  listDepartments() {
    return this.structuralService.listDepartments();
  }

  @Get("departments/:id")
  getDepartment(@Param("id") id: string) {
    return this.structuralService.getDepartment(id);
  }

  @Post("departments")
  createDepartment(@Body() body: CreateStructuralDepartmentInput) {
    return this.structuralService.createDepartment(body);
  }

  @Patch("departments/:id")
  updateDepartment(@Param("id") id: string, @Body() body: UpdateStructuralDepartmentInput) {
    return this.structuralService.updateDepartment(id, body);
  }

  @Delete("departments/:id")
  deactivateDepartment(@Param("id") id: string) {
    return this.structuralService.deactivateDepartment(id);
  }

  @Get("job-positions")
  listJobPositions() {
    return this.structuralService.listJobPositions();
  }

  @Get("job-positions/:id")
  getJobPosition(@Param("id") id: string) {
    return this.structuralService.getJobPosition(id);
  }

  @Post("job-positions")
  createJobPosition(@Body() body: CreateStructuralJobPositionInput) {
    return this.structuralService.createJobPosition(body);
  }

  @Patch("job-positions/:id")
  updateJobPosition(@Param("id") id: string, @Body() body: UpdateStructuralJobPositionInput) {
    return this.structuralService.updateJobPosition(id, body);
  }

  @Delete("job-positions/:id")
  deactivateJobPosition(@Param("id") id: string) {
    return this.structuralService.deactivateJobPosition(id);
  }

  @Get("employees")
  listEmployees() {
    return this.structuralService.listEmployees();
  }

  @Get("employees/:id")
  getEmployee(@Param("id") id: string) {
    return this.structuralService.getEmployee(id);
  }

  @Post("employees")
  createEmployee(@Body() body: CreateStructuralEmployeeInput) {
    return this.structuralService.createEmployee(body);
  }

  @Post("employees/import")
  importEmployees(@Body() body: ImportStructuralEmployeesInput) {
    return this.structuralService.importEmployees(body);
  }

  @Patch("employees/:id")
  updateEmployee(@Param("id") id: string, @Body() body: UpdateStructuralEmployeeInput) {
    return this.structuralService.updateEmployee(id, body);
  }

  @Delete("employees/:id")
  deactivateEmployee(@Param("id") id: string) {
    return this.structuralService.deactivateEmployee(id);
  }
}
