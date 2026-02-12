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
exports.BkJurusan = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const jurusan_entity_1 = require("../../jurusan/entities/jurusan.entity");
let BkJurusan = class BkJurusan {
    id;
    bkId;
    bk;
    jurusanId;
    jurusan;
    createdAt;
    updatedAt;
};
exports.BkJurusan = BkJurusan;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BkJurusan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], BkJurusan.prototype, "bkId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'bkId' }),
    __metadata("design:type", user_entity_1.User)
], BkJurusan.prototype, "bk", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], BkJurusan.prototype, "jurusanId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => jurusan_entity_1.Jurusan, { eager: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'jurusanId' }),
    __metadata("design:type", jurusan_entity_1.Jurusan)
], BkJurusan.prototype, "jurusan", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BkJurusan.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BkJurusan.prototype, "updatedAt", void 0);
exports.BkJurusan = BkJurusan = __decorate([
    (0, typeorm_1.Entity)('bk_jurusan'),
    (0, typeorm_1.Index)(['bkId', 'jurusanId'], { unique: true })
], BkJurusan);
//# sourceMappingURL=bk-jurusan.entity.js.map