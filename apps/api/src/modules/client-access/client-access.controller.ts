import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { StructuralService } from "../structural/structural.service";
import type {
  ClientAccessLoginInput,
  ClientAccessPasswordChangeInput,
  ClientPasswordResetRequestInput,
} from "../structural/structural.types";

@Controller("client-access")
export class ClientAccessController {
  constructor(private readonly structuralService: StructuralService) {}

  @Post("login")
  login(@Body() body: ClientAccessLoginInput) {
    return this.structuralService.loginClientAccess(body);
  }

  @Patch("password")
  changePassword(@Body() body: ClientAccessPasswordChangeInput) {
    return this.structuralService.changeClientPassword(body);
  }

  @Get("password-reset-requests")
  listPasswordResetRequests() {
    return this.structuralService.listClientPasswordResetRequests();
  }

  @Post("password-reset-requests")
  requestPasswordReset(@Body() body: ClientPasswordResetRequestInput) {
    return this.structuralService.requestClientPasswordReset(body);
  }

  @Patch("password-reset-requests/:id/resolve")
  resolvePasswordReset(@Param("id") id: string) {
    return this.structuralService.resolveClientPasswordReset(id);
  }
}
