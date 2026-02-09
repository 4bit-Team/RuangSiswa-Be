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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcrypt"));
const jwt_1 = require("@nestjs/jwt");
const student_card_service_1 = require("../student-card/student-card.service");
const student_card_validation_service_1 = require("../student-card-validation/student-card-validation.service");
let AuthService = class AuthService {
    usersService;
    jwtService;
    cardService;
    cardValidator;
    getUsersService() {
        return this.usersService;
    }
    constructor(usersService, jwtService, cardService, cardValidator) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.cardService = cardService;
        this.cardValidator = cardValidator;
    }
    async register(registerDto, filePath) {
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.usersService.create({
            username: registerDto.username,
            email: registerDto.email,
            password: hashedPassword,
            role: 'siswa',
            status: 'nonaktif',
            kartu_pelajar_file: filePath || undefined,
            kelas_id: registerDto.kelas_id,
            jurusan_id: registerDto.jurusan_id,
            phone_number: registerDto.phone_number,
        });
        if (filePath) {
            const extractedData = await this.cardValidator.validate(filePath);
            await this.cardService.create({
                userId: user.id,
                file_path: filePath,
                extracted_data: extractedData,
            });
            return {
                message: 'Registrasi berhasil. Kartu pelajar berhasil diunggah.',
                user,
                studentCard: extractedData,
            };
        }
        return {
            message: 'Registrasi berhasil. Silakan upload kartu pelajar Anda untuk verifikasi.',
            user,
        };
    }
    async login(loginDto) {
        try {
            const user = await this.usersService.findOneByEmail(loginDto.email);
            if (!user) {
                console.error('[LOGIN ERROR] User not found for email:', loginDto.email);
                throw new common_1.BadRequestException('Akun tidak ditemukan');
            }
            const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
            if (!isPasswordValid) {
                console.error('[LOGIN ERROR] Invalid password for email:', loginDto.email);
                throw new common_1.BadRequestException('Password yang dimasukkan salah');
            }
            const payload = {
                sub: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                phone_number: user.phone_number,
                kelas: user.kelas?.nama,
                jurusan: user.jurusan?.nama,
                kelas_lengkap: user.kelas_lengkap,
            };
            const token = this.jwtService.sign(payload);
            const { password, ...result } = user;
            console.log('[LOGIN SUCCESS] User:', result);
            console.log('[LOGIN SUCCESS] Role:', result.role);
            return { ...result, token };
        }
        catch (err) {
            console.error('[LOGIN ERROR]', err);
            throw err;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        student_card_service_1.StudentCardService,
        student_card_validation_service_1.StudentCardValidationService])
], AuthService);
//# sourceMappingURL=auth.service.js.map