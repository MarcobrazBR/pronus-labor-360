import { Module } from "@nestjs/common";
import { EmployeeAccessController } from "./employee-access/employee-access.controller";
import { HealthController } from "./health/health.controller";
import { Nr01Controller } from "./nr01/nr01.controller";
import { Nr01Service } from "./nr01/nr01.service";
import { PsychosocialController } from "./psychosocial/psychosocial.controller";
import { PsychosocialService } from "./psychosocial/psychosocial.service";
import { StructuralController } from "./structural/structural.controller";
import { StructuralService } from "./structural/structural.service";

@Module({
  controllers: [
    HealthController,
    StructuralController,
    EmployeeAccessController,
    Nr01Controller,
    PsychosocialController,
  ],
  providers: [StructuralService, Nr01Service, PsychosocialService],
})
export class AppModule {}
