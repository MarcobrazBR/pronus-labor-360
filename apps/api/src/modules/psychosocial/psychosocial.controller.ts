import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { PsychosocialService } from "./psychosocial.service";
import type {
  CreatePsychosocialCampaignInput,
  SavePsychosocialProgressInput,
  SubmitPsychosocialAnswerInput,
  UpdatePsychosocialCampaignInput,
} from "./psychosocial.types";

@Controller("psychosocial")
export class PsychosocialController {
  constructor(private readonly psychosocialService: PsychosocialService) {}

  @Get("summary")
  getSummary() {
    return this.psychosocialService.getSummary();
  }

  @Get("questions")
  listQuestions() {
    return this.psychosocialService.listQuestions();
  }

  @Get("campaigns")
  listCampaigns() {
    return this.psychosocialService.listCampaigns();
  }

  @Get("campaigns/:id")
  getCampaign(@Param("id") id: string) {
    return this.psychosocialService.getCampaign(id);
  }

  @Post("campaigns")
  createCampaign(@Body() body: CreatePsychosocialCampaignInput) {
    return this.psychosocialService.createCampaign(body);
  }

  @Patch("campaigns/:id")
  updateCampaign(@Param("id") id: string, @Body() body: UpdatePsychosocialCampaignInput) {
    return this.psychosocialService.updateCampaign(id, body);
  }

  @Get("sector-signals")
  listSectorSignals() {
    return this.psychosocialService.listSectorSignals();
  }

  @Get("copsoq-analysis")
  listCopsoqAnalysis() {
    return this.psychosocialService.listCopsoqAnalysis();
  }

  @Get("technical-reports")
  listTechnicalReports() {
    return this.psychosocialService.listTechnicalReports();
  }

  @Get("answers")
  listAnswers() {
    return this.psychosocialService.listAnswers();
  }

  @Get("answers/employee/:employeeId")
  getEmployeeAnswer(@Param("employeeId") employeeId: string) {
    return this.psychosocialService.getEmployeeAnswer(employeeId);
  }

  @Get("progress/employee/:employeeId")
  getEmployeeProgress(@Param("employeeId") employeeId: string) {
    return this.psychosocialService.getEmployeeProgress(employeeId);
  }

  @Post("progress")
  saveProgress(@Body() body: SavePsychosocialProgressInput) {
    return this.psychosocialService.saveProgress(body);
  }

  @Post("answers")
  submitAnswer(@Body() body: SubmitPsychosocialAnswerInput) {
    return this.psychosocialService.submitAnswer(body);
  }
}
