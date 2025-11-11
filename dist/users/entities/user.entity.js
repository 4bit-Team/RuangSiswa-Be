"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const typeorm_1 = require("typeorm");
const student_card_entity_1 = require("../../student-card/entities/student-card.entity");
const kelas_entity_1 = require("../../kelas/entities/kelas.entity");
const jurusan_entity_1 = require("../../jurusan/entities/jurusan.entity");
let User = class User {
    id;
    username;
    email;
    password;
    role;
    status;
    kartu_pelajar_file;
    kelas;
    jurusan;
    studentCards;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['kesiswaan', 'siswa', 'admin', 'bk'], default: 'siswa' }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['aktif', 'nonaktif'], default: 'aktif' }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "kartu_pelajar_file", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => kelas_entity_1.Kelas, (kelas) => kelas.users, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'kelas_id' }),
    __metadata("design:type", kelas_entity_1.Kelas)
], User.prototype, "kelas", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => jurusan_entity_1.Jurusan, (jurusan) => jurusan.users, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'jurusan_id' }),
    __metadata("design:type", jurusan_entity_1.Jurusan)
], User.prototype, "jurusan", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => student_card_entity_1.StudentCard, card => card.user),
    __metadata("design:type", Array)
], User.prototype, "studentCards", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map