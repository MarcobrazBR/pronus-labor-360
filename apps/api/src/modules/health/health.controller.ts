import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: "ok",
      service: "pronus-labor-360-api",
      timestamp: new Date().toISOString(),
    };
  }
}
