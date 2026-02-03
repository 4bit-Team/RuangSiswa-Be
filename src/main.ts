import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  const ioAdapter = new IoAdapter(app);
  app.useWebSocketAdapter(ioAdapter);

  app.setGlobalPrefix('api');


  const allowedOrigins = [
    'http://localhost:3000',
    'https://ruangsiswa.my.id', 
    'http://ruangsiswa.my.id',  
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        // request tanpa Origin (misal: curl, server-to-server)
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn('❌ CORS blocked origin:', origin);
      return callback(new Error(`Not allowed by CORS: ${origin}`), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌐 Global API prefix: /api`);
}
bootstrap();
