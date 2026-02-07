"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const platform_express_1 = require("@nestjs/platform-express");
const serve_static_1 = require("@nestjs/serve-static");
const multer_1 = require("multer");
const auth_module_1 = require("./auth/auth.module");
const student_card_module_1 = require("./student-card/student-card.module");
const kelas_module_1 = require("./kelas/kelas.module");
const jurusan_module_1 = require("./jurusan/jurusan.module");
const users_module_1 = require("./users/users.module");
const logger_module_1 = require("./logger/logger.module");
const chat_module_1 = require("./chat/chat.module");
const reservasi_module_1 = require("./reservasi/reservasi.module");
const bk_schedule_module_1 = require("./bk-schedule/bk-schedule.module");
const bk_jurusan_module_1 = require("./bk-jurusan/bk-jurusan.module");
const news_module_1 = require("./news/news.module");
const upload_module_1 = require("./upload/upload.module");
const admin_module_1 = require("./admin/admin.module");
const emoji_module_1 = require("./emoji/emoji.module");
const toxic_filter_module_1 = require("./toxic-filter/toxic-filter.module");
const konsultasi_module_1 = require("./konsultasi/konsultasi.module");
const laporan_bk_module_1 = require("./laporan-bk/laporan-bk.module");
const statistics_module_1 = require("./statistics/statistics.module");
const consultation_category_module_1 = require("./consultation-category/consultation-category.module");
const counseling_category_module_1 = require("./counseling-category/counseling-category.module");
const news_category_module_1 = require("./news-category/news-category.module");
const bimbingan_module_1 = require("./kesiswaan/bimbingan/bimbingan.module");
const attendance_module_1 = require("./kesiswaan/attendance/attendance.module");
const violations_module_1 = require("./kesiswaan/violations/violations.module");
const tardiness_module_1 = require("./kesiswaan/tardiness/tardiness.module");
const walas_module_1 = require("./walas/walas.module");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: path.join(__dirname, '..', 'uploads'),
                serveRoot: '/uploads',
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT || '5432'),
                username: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME,
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: true,
            }),
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.diskStorage)({
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
                    }
                    else {
                        cb(null, true);
                    }
                },
            }),
            auth_module_1.AuthModule,
            student_card_module_1.StudentCardModule,
            users_module_1.UsersModule,
            logger_module_1.LoggerModule,
            kelas_module_1.KelasModule,
            jurusan_module_1.JurusanModule,
            chat_module_1.ChatModule,
            reservasi_module_1.ReservasiModule,
            bk_schedule_module_1.BkScheduleModule,
            bk_jurusan_module_1.BkJurusanModule,
            news_module_1.NewsModule,
            upload_module_1.UploadModule,
            admin_module_1.AdminModule,
            emoji_module_1.EmojiModule,
            toxic_filter_module_1.ToxicFilterModule,
            konsultasi_module_1.KonsultasiModule,
            laporan_bk_module_1.LaporanBkModule,
            statistics_module_1.StatisticsModule,
            consultation_category_module_1.ConsultationCategoryModule,
            counseling_category_module_1.CounselingCategoryModule,
            news_category_module_1.NewsCategoryModule,
            bimbingan_module_1.BimbinganModule,
            attendance_module_1.AttendanceModule,
            violations_module_1.ViolationsModule,
            tardiness_module_1.TardinessModule,
            walas_module_1.WalasModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map