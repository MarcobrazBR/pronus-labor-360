import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [/^http:\/\/localhost:300\d$/],
    credentials: true,
  });

  const port = Number(process.env.API_PORT ?? 3333);
  await app.listen(port);
}

void bootstrap();
