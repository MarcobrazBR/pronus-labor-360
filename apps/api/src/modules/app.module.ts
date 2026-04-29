import { Module } from "@nestjs/common";
import { ClientAccessController } from "./client-access/client-access.controller";
import { DocumentsController } from "./documents/documents.controller";
import { DocumentsService } from "./documents/documents.service";
import { EmployeeAccessController } from "./employee-access/employee-access.controller";
import { HealthController } from "./health/health.controller";
import { Nr01Controller } from "./nr01/nr01.controller";
import { Nr01Service } from "./nr01/nr01.service";
import { PsychosocialController } from "./psychosocial/psychosocial.controller";
import { PsychosocialService } from "./psychosocial/psychosocial.service";
import { RegulatoryIntelligenceController } from "./regulatory-intelligence/regulatory-intelligence.controller";
import { RegulatoryIntelligenceService } from "./regulatory-intelligence/regulatory-intelligence.service";
import { StructuralController } from "./structural/structural.controller";
import { StructuralService } from "./structural/structural.service";

@Module({
  controllers: [
    HealthController,
    StructuralController,
    EmployeeAccessController,
    ClientAccessController,
    Nr01Controller,
    PsychosocialController,
    DocumentsController,
    RegulatoryIntelligenceController,
  ],
  providers: [
    StructuralService,
    Nr01Service,
    PsychosocialService,
    DocumentsService,
    RegulatoryIntelligenceService,
  ],
})
export class AppModule {}
