import { Body, Controller, Get, Post } from "@nestjs/common";
import { RegulatoryIntelligenceService } from "./regulatory-intelligence.service";
import type { AssessCompanyInput } from "./regulatory-intelligence.types";

@Controller("regulatory-intelligence")
export class RegulatoryIntelligenceController {
  constructor(private readonly regulatoryIntelligenceService: RegulatoryIntelligenceService) {}

  @Get("cnaes")
  listCnaes() {
    return this.regulatoryIntelligenceService.listCnaes();
  }

  @Get("risk-degrees")
  listRiskDegrees() {
    return this.regulatoryIntelligenceService.listRiskDegrees();
  }

  @Get("obligations")
  listObligations() {
    return this.regulatoryIntelligenceService.listObligations();
  }

  @Post("assess-company")
  assessCompany(@Body() body: AssessCompanyInput) {
    return this.regulatoryIntelligenceService.assessCompany(body);
  }
}
