import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";

const localFrontendOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
];

function getAllowedOrigins() {
  const configuredOrigins = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return Array.from(new Set([...localFrontendOrigins, ...configuredOrigins]));
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = getAllowedOrigins();

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const port = Number(process.env.API_PORT ?? 3333);
  await app.listen(port);
}

void bootstrap();
