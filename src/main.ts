import * as dotenv from 'dotenv';
dotenv.config(); // ✅ Load .env before anything else

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Prefix semua route dengan /api
  app.setGlobalPrefix('api');

  // ✅ Allow all origins supaya frontend bebas request
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌐 Global API prefix: /api`);
}
bootstrap();
