import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { StructuralService } from "../structural/structural.service";
import type {
  EmployeeAccessConfirmRegistrationInput,
  EmployeeAccessLoginInput,
  EmployeeAccessLookupInput,
  EmployeeAccessPasswordChangeInput,
  EmployeePasswordResetRequestInput,
  SubmitEmployeeDivergenceInput,
  UpdateEmployeeDivergenceInput,
} from "../structural/structural.types";

@Controller("employee-access")
export class EmployeeAccessController {
  constructor(private readonly structuralService: StructuralService) {}

  @Post("lookup")
  lookup(@Body() body: EmployeeAccessLookupInput) {
    return this.structuralService.lookupEmployeeAccess(body);
  }

  @Post("login")
  login(@Body() body: EmployeeAccessLoginInput) {
    return this.structuralService.loginEmployeeAccess(body);
  }

  @Patch("password")
  changePassword(@Body() body: EmployeeAccessPasswordChangeInput) {
    return this.structuralService.changeEmployeePassword(body);
  }

  @Post("confirm-registration")
  confirmRegistration(@Body() body: EmployeeAccessConfirmRegistrationInput) {
    return this.structuralService.confirmEmployeeRegistration(body);
  }

  @Get("password-reset-requests")
  listPasswordResetRequests() {
    return this.structuralService.listEmployeePasswordResetRequests();
  }

  @Post("password-reset-requests")
  requestPasswordReset(@Body() body: EmployeePasswordResetRequestInput) {
    return this.structuralService.requestEmployeePasswordReset(body);
  }

  @Patch("password-reset-requests/:id/resolve")
  resolvePasswordReset(@Param("id") id: string) {
    return this.structuralService.resolveEmployeePasswordReset(id);
  }

  @Get("divergences")
  listDivergences() {
    return this.structuralService.listEmployeeDivergences();
  }

  @Post("divergences")
  submitDivergence(@Body() body: SubmitEmployeeDivergenceInput) {
    return this.structuralService.submitEmployeeDivergence(body);
  }

  @Patch("divergences/:id")
  updateDivergence(@Param("id") id: string, @Body() body: UpdateEmployeeDivergenceInput) {
    return this.structuralService.updateEmployeeDivergence(id, body);
  }
}
