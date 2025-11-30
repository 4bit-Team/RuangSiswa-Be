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
const conversation_entity_1 = require("../../chat/entities/conversation.entity");
const message_entity_1 = require("../../chat/entities/message.entity");
const call_entity_1 = require("../../chat/entities/call.entity");
let User = class User {
    id;
    username;
    fullName;
    email;
    password;
    role;
    status;
    specialty;
    kartu_pelajar_file;
    phone_number;
    kelas_lengkap;
    kelas;
    jurusan;
    studentCards;
    sentConversations;
    receivedConversations;
    sentMessages;
    receivedMessages;
    initiatedCalls;
    receivedCalls;
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
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "fullName", void 0);
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
], User.prototype, "specialty", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "kartu_pelajar_file", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phone_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "kelas_lengkap", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => kelas_entity_1.Kelas, kelas => kelas.users, { nullable: true }),
    __metadata("design:type", kelas_entity_1.Kelas)
], User.prototype, "kelas", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => jurusan_entity_1.Jurusan, jurusan => jurusan.users, { nullable: true }),
    __metadata("design:type", jurusan_entity_1.Jurusan)
], User.prototype, "jurusan", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => student_card_entity_1.StudentCard, card => card.user),
    __metadata("design:type", Array)
], User.prototype, "studentCards", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => conversation_entity_1.Conversation, conversation => conversation.sender),
    __metadata("design:type", Array)
], User.prototype, "sentConversations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => conversation_entity_1.Conversation, conversation => conversation.receiver),
    __metadata("design:type", Array)
], User.prototype, "receivedConversations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, message => message.sender),
    __metadata("design:type", Array)
], User.prototype, "sentMessages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, message => message.receiver),
    __metadata("design:type", Array)
], User.prototype, "receivedMessages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => call_entity_1.Call, call => call.caller),
    __metadata("design:type", Array)
], User.prototype, "initiatedCalls", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => call_entity_1.Call, call => call.receiver),
    __metadata("design:type", Array)
], User.prototype, "receivedCalls", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map