import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { Nr01Service } from "./nr01.service";
import type {
  CreateNr01ActionPlanItemInput,
  CreateNr01DocumentInput,
  CreateNr01EvidenceInput,
  CreateNr01RiskInput,
  UpdateNr01ActionPlanItemInput,
  UpdateNr01DocumentInput,
  UpdateNr01EvidenceInput,
  UpdateNr01RiskInput,
} from "./nr01.types";

@Controller("nr01")
export class Nr01Controller {
  constructor(private readonly nr01Service: Nr01Service) {}

  @Get("summary")
  getSummary() {
    return this.nr01Service.getSummary();
  }

  @Get("risks")
  listRisks() {
    return this.nr01Service.listRisks();
  }

  @Get("risks/:id")
  getRisk(@Param("id") id: string) {
    return this.nr01Service.getRisk(id);
  }

  @Post("risks")
  createRisk(@Body() body: CreateNr01RiskInput) {
    return this.nr01Service.createRisk(body);
  }

  @Patch("risks/:id")
  updateRisk(@Param("id") id: string, @Body() body: UpdateNr01RiskInput) {
    return this.nr01Service.updateRisk(id, body);
  }

  @Delete("risks/:id")
  archiveRisk(@Param("id") id: string) {
    return this.nr01Service.archiveRisk(id);
  }

  @Get("action-plan")
  listActionPlan() {
    return this.nr01Service.listActionPlan();
  }

  @Post("action-plan")
  createActionPlanItem(@Body() body: CreateNr01ActionPlanItemInput) {
    return this.nr01Service.createActionPlanItem(body);
  }

  @Patch("action-plan/:id")
  updateActionPlanItem(@Param("id") id: string, @Body() body: UpdateNr01ActionPlanItemInput) {
    return this.nr01Service.updateActionPlanItem(id, body);
  }

  @Get("evidences")
  listEvidences() {
    return this.nr01Service.listEvidences();
  }

  @Post("evidences")
  createEvidence(@Body() body: CreateNr01EvidenceInput) {
    return this.nr01Service.createEvidence(body);
  }

  @Patch("evidences/:id")
  updateEvidence(@Param("id") id: string, @Body() body: UpdateNr01EvidenceInput) {
    return this.nr01Service.updateEvidence(id, body);
  }

  @Get("documents")
  listDocuments() {
    return this.nr01Service.listDocuments();
  }

  @Post("documents")
  createDocument(@Body() body: CreateNr01DocumentInput) {
    return this.nr01Service.createDocument(body);
  }

  @Patch("documents/:id")
  updateDocument(@Param("id") id: string, @Body() body: UpdateNr01DocumentInput) {
    return this.nr01Service.updateDocument(id, body);
  }
}
