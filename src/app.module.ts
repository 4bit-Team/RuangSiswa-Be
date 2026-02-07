import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { diskStorage } from 'multer';
import { AuthModule } from './auth/auth.module';
import { StudentCardModule } from './student-card/student-card.module';
import { KelasModule } from './kelas/kelas.module';
import { JurusanModule } from './jurusan/jurusan.module';
import { UsersModule } from './users/users.module';
import { LoggerModule } from './logger/logger.module';
import { ChatModule } from './chat/chat.module';
import { ReservasiModule } from './reservasi/reservasi.module';
import { BkScheduleModule } from './bk-schedule/bk-schedule.module';
import { BkJurusanModule } from './bk-jurusan/bk-jurusan.module';
import { NewsModule } from './news/news.module';
import { UploadModule } from './upload/upload.module';
import { AdminModule } from './admin/admin.module';
import { EmojiModule } from './emoji/emoji.module';
import { ToxicFilterModule } from './toxic-filter/toxic-filter.module';
import { KonsultasiModule } from './konsultasi/konsultasi.module';
import { LaporanBkModule } from './laporan-bk/laporan-bk.module';
import { StatisticsModule } from './statistics/statistics.module';
import { ConsultationCategoryModule } from './consultation-category/consultation-category.module';
import { CounselingCategoryModule } from './counseling-category/counseling-category.module';
import { NewsCategoryModule } from './news-category/news-category.module';
import { BimbinganModule } from './kesiswaan/bimbingan/bimbingan.module';
import { AttendanceModule } from './kesiswaan/attendance/attendance.module';
import { ViolationsModule } from './kesiswaan/violations/violations.module';
import { TardinessModule } from './kesiswaan/tardiness/tardiness.module';
import { WalasModule } from './walas/walas.module';
import * as fs from 'fs';
import * as path from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),

    // Setup global Multer
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(__dirname, '..', 'uploads', 'student-card');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + '-' + file.originalname);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          cb(new Error('Only image files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
    }),

    // Core Modules
    AuthModule,
    StudentCardModule,
    UsersModule,
    LoggerModule,
    KelasModule,
    JurusanModule,
    ChatModule,
    ReservasiModule,
    BkScheduleModule,
    BkJurusanModule,
    NewsModule,
    UploadModule,
    AdminModule,
    EmojiModule,
    ToxicFilterModule,
    KonsultasiModule,
    LaporanBkModule,
    StatisticsModule,
    ConsultationCategoryModule,
    CounselingCategoryModule,
    NewsCategoryModule,

    // Kesiswaan Modules
    BimbinganModule,
    AttendanceModule,
    ViolationsModule,
    TardinessModule,

    // External Integration Modules
    WalasModule,
  ],
})
export class AppModule {}
