import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filter/logger.filter';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './configs/swagger.config';
import * as admin from 'firebase-admin';
// import { initializeApp } from 'firebase-admin/app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({});
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());

  const serviceAccount = require('../src/firebase/firebaseService.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-document', app, document);

  await app.listen(3000);
}
bootstrap();
