import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('FullStop Api Document')
  .setDescription('FullStop Swagger API Document')
  .setVersion('0.1')
  .addTag('Fullstops')
  .build();
