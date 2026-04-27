import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { StructuralService } from "../structural/structural.service";
import type {
  EmployeeAccessLookupInput,
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
