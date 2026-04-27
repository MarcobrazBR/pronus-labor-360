import { Module } from "@nestjs/common";
import { HealthController } from "./health/health.controller";
import { StructuralController } from "./structural/structural.controller";
import { StructuralService } from "./structural/structural.service";

@Module({
  controllers: [HealthController, StructuralController],
  providers: [StructuralService],
})
export class AppModule {}
