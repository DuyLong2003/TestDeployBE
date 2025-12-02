import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino'; // <--- Import từ nestjs-pino
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 8080;

  // Cấu hình Global Prefix => /health nằm ngoài /api/v1
  app.setGlobalPrefix('api/v1', { exclude: ['health'] });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }));

  // Config CORS
  app.enableCors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    credentials: true
  });

  // Kích hoạt Logger JSON
  app.useLogger(app.get(Logger));

  //config helmet
  app.use(helmet());

  await app.listen(port);

  // Log bằng Logger của hệ thống để test ngay khi start
  const logger = app.get(Logger);
  logger.log(`Application is running on: http://localhost:${port}/api/v1`);
}
bootstrap();