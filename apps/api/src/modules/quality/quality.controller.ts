import { Controller, Get } from "@nestjs/common";
import { QualityService } from "./quality.service";

@Controller("quality")
export class QualityController {
  constructor(private readonly qualityService: QualityService) {}

  @Get("summary")
  getSummary() {
    return this.qualityService.getSummary();
  }

  @Get("automated-tests")
  listAutomatedTestSuites() {
    return this.qualityService.listAutomatedTestSuites();
  }

  @Get("lgpd-governance")
  getLgpdGovernance() {
    return this.qualityService.getLgpdGovernance();
  }

  @Get("esocial-sst-queue")
  listESocialSstQueue() {
    return this.qualityService.listESocialSstQueue();
  }
}
