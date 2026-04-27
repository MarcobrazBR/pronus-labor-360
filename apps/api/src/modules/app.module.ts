import { Module } from "@nestjs/common";
import { EmployeeAccessController } from "./employee-access/employee-access.controller";
import { HealthController } from "./health/health.controller";
import { StructuralController } from "./structural/structural.controller";
import { StructuralService } from "./structural/structural.service";

@Module({
  controllers: [HealthController, StructuralController, EmployeeAccessController],
  providers: [StructuralService],
})
export class AppModule {}
