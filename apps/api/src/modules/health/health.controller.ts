import { Controller, Get } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

@Controller("health")
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async getHealth() {
    return {
      database: await this.databaseService.getConnectionStatus(),
      service: "pronus-labor-360-api",
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
