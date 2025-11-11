import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());


  app.setGlobalPrefix('api');


  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://ruangsiswa.my.id',
      'http://ruangsiswa.my.id',
      'https://be.ruangsiswa.my.id',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌐 Global API prefix: /api`);
}
bootstrap();
