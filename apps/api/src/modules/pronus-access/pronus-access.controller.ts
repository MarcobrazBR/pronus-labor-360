import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { StructuralService } from "../structural/structural.service";
import type {
  PronusAccessLoginInput,
  PronusAccessPasswordChangeInput,
} from "../structural/structural.types";

@Controller("pronus-access")
export class PronusAccessController {
  constructor(private readonly structuralService: StructuralService) {}

  @Post("login")
  login(@Body() body: PronusAccessLoginInput) {
    return this.structuralService.loginPronusAccess(body);
  }

  @Patch("password")
  changePassword(@Body() body: PronusAccessPasswordChangeInput) {
    return this.structuralService.changePronusPassword(body);
  }

  @Get("users")
  listUsers() {
    return this.structuralService.listPronusAccessUsers();
  }

  @Patch("users/:id/reset-password")
  resetPassword(@Param("id") id: string) {
    return this.structuralService.resetPronusAccessUserPassword(id);
  }
}
