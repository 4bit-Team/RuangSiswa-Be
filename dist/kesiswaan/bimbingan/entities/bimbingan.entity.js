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
exports.GuidanceStatistics = exports.GuidanceStatus = exports.GuidanceTarget = exports.GuidanceAbility = exports.GuidanceProgress = exports.GuidanceIntervention = exports.GuidanceNote = exports.GuidanceSession = exports.GuidanceReferral = exports.GuidanceCategory = exports.BimbinganStatus = exports.BimbinganTarget = exports.BimbinganAbility = exports.BimbinganStatistik = exports.BimbinganReferral = exports.BimbinganPerkembangan = exports.GuidanceParentCommunication = exports.BimbinganIntervensi = exports.BimbinganCatat = exports.BimbinganSesi = exports.GuidanceCase = exports.BimbinganCategory = void 0;
const typeorm_1 = require("typeorm");
let BimbinganCategory = class BimbinganCategory {
    id;
    name;
    code;
    description;
    priority_level;
    recommended_duration_weeks;
    is_active;
    created_at;
    updated_at;
};
exports.BimbinganCategory = BimbinganCategory;
exports.GuidanceCategory = BimbinganCategory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BimbinganCategory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], BimbinganCategory.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, unique: true }),
    __metadata("design:type", String)
], BimbinganCategory.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BimbinganCategory.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], BimbinganCategory.prototype, "priority_level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], BimbinganCategory.prototype, "recommended_duration_weeks", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], BimbinganCategory.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BimbinganCategory.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BimbinganCategory.prototype, "updated_at", void 0);
exports.GuidanceCategory = exports.BimbinganCategory = BimbinganCategory = __decorate([
    (0, typeorm_1.Entity)('bimbingan_categories'),
    (0, typeorm_1.Index)(['code'], { unique: true }),
    (0, typeorm_1.Index)(['is_active'])
], BimbinganCategory);
let GuidanceCase = class GuidanceCase {
    id;
    student_id;
    student_name;
    class_id;
    class_name;
    guidance_category_id;
    category_code;
    referred_from;
    referred_from_id;
    case_description;
    background_info;
    case_opened_date;
    case_closed_date;
    status;
    risk_level;
    risk_score;
    attendance_risk_score;
    tardiness_risk_score;
    violation_risk_score;
    recommended_interventions;
    total_sessions_planned;
    total_sessions_completed;
    tahun;
    assigned_to_bk;
    assigned_to_bk_name;
    is_escalated;
    escalation_reason;
    created_at;
    updated_at;
};
exports.GuidanceCase = GuidanceCase;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GuidanceCase.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], GuidanceCase.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], GuidanceCase.prototype, "student_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], GuidanceCase.prototype, "class_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], GuidanceCase.prototype, "class_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], GuidanceCase.prototype, "guidance_category_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], GuidanceCase.prototype, "category_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], GuidanceCase.prototype, "referred_from", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], GuidanceCase.prototype, "referred_from_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], GuidanceCase.prototype, "case_description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceCase.prototype, "background_info", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], GuidanceCase.prototype, "case_opened_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], GuidanceCase.prototype, "case_closed_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['open', 'in_progress', 'suspended', 'closed', 'referred'],
        default: 'open',
    }),
    __metadata("design:type", String)
], GuidanceCase.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
    }),
    __metadata("design:type", String)
], GuidanceCase.prototype, "risk_level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GuidanceCase.prototype, "risk_score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GuidanceCase.prototype, "attendance_risk_score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GuidanceCase.prototype, "tardiness_risk_score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GuidanceCase.prototype, "violation_risk_score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceCase.prototype, "recommended_interventions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GuidanceCase.prototype, "total_sessions_planned", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GuidanceCase.prototype, "total_sessions_completed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], GuidanceCase.prototype, "tahun", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], GuidanceCase.prototype, "assigned_to_bk", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], GuidanceCase.prototype, "assigned_to_bk_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], GuidanceCase.prototype, "is_escalated", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceCase.prototype, "escalation_reason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceCase.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceCase.prototype, "updated_at", void 0);
exports.GuidanceCase = GuidanceCase = __decorate([
    (0, typeorm_1.Entity)('guidance_cases'),
    (0, typeorm_1.Index)(['student_id', 'tahun']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['risk_level']),
    (0, typeorm_1.Index)(['created_at'])
], GuidanceCase);
let BimbinganSesi = class BimbinganSesi {
    id;
    guidance_case_id;
    referral_id;
    student_id;
    sesi_ke;
    bk_staff_id;
    bk_staff_name;
    session_date;
    tanggal_sesi;
    duration_minutes;
    status;
    session_type;
    location;
    agenda;
    notes;
    student_response;
    recommendations;
    student_attended;
    siswa_hadir;
    outcome;
    effectiveness_rating;
    followup_actions;
    next_session_date;
    follow_up_date;
    orang_tua_hadir;
    hasil_akhir;
    follow_up_status;
    created_at;
    updated_at;
};
exports.BimbinganSesi = BimbinganSesi;
exports.GuidanceSession = BimbinganSesi;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BimbinganSesi.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], BimbinganSesi.prototype, "guidance_case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", String)
], BimbinganSesi.prototype, "referral_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], BimbinganSesi.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], BimbinganSesi.prototype, "sesi_ke", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], BimbinganSesi.prototype, "bk_staff_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], BimbinganSesi.prototype, "bk_staff_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", String)
], BimbinganSesi.prototype, "session_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BimbinganSesi.prototype, "tanggal_sesi", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 30 }),
    __metadata("design:type", Number)
], BimbinganSesi.prototype, "duration_minutes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
        default: 'scheduled',
    }),
    __metadata("design:type", String)
], BimbinganSesi.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], BimbinganSesi.prototype, "session_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], BimbinganSesi.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BimbinganSesi.prototype, "agenda", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BimbinganSesi.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BimbinganSesi.prototype, "student_response", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BimbinganSesi.prototype, "recommendations", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], BimbinganSesi.prototype, "student_attended", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], BimbinganSesi.prototype, "siswa_hadir", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], BimbinganSesi.prototype, "outcome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], BimbinganSesi.prototype, "effectiveness_rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BimbinganSesi.prototype, "followup_actions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], BimbinganSesi.prototype, "next_session_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], BimbinganSesi.prototype, "follow_up_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata("design:type", Boolean)
], BimbinganSesi.prototype, "orang_tua_hadir", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BimbinganSesi.prototype, "hasil_akhir", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], BimbinganSesi.prototype, "follow_up_status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BimbinganSesi.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BimbinganSesi.prototype, "updated_at", void 0);
exports.GuidanceSession = exports.BimbinganSesi = BimbinganSesi = __decorate([
    (0, typeorm_1.Entity)('bimbingan_sesi'),
    (0, typeorm_1.Index)(['guidance_case_id']),
    (0, typeorm_1.Index)(['student_id', 'session_date']),
    (0, typeorm_1.Index)(['status'])
], BimbinganSesi);
let BimbinganCatat = class BimbinganCatat {
    id;
    guidance_case_id;
    student_id;
    note_content;
    note_type;
    sentiment;
    created_by;
    created_by_name;
    created_by_role;
    attachments;
    status;
    created_at;
    updated_at;
};
exports.BimbinganCatat = BimbinganCatat;
exports.GuidanceNote = BimbinganCatat;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BimbinganCatat.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], BimbinganCatat.prototype, "guidance_case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], BimbinganCatat.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], BimbinganCatat.prototype, "note_content", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['observation', 'progress_update', 'parent_communication', 'incident', 'breakthrough'],
        default: 'observation',
    }),
    __metadata("design:type", String)
], BimbinganCatat.prototype, "note_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], BimbinganCatat.prototype, "sentiment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], BimbinganCatat.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], BimbinganCatat.prototype, "created_by_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], BimbinganCatat.prototype, "created_by_role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], BimbinganCatat.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], BimbinganCatat.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BimbinganCatat.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BimbinganCatat.prototype, "updated_at", void 0);
exports.GuidanceNote = exports.BimbinganCatat = BimbinganCatat = __decorate([
    (0, typeorm_1.Entity)('bimbingan_catat'),
    (0, typeorm_1.Index)(['guidance_case_id']),
    (0, typeorm_1.Index)(['created_by']),
    (0, typeorm_1.Index)(['created_at'])
], BimbinganCatat);
let BimbinganIntervensi = class BimbinganIntervensi {
    id;
    guidance_case_id;
    student_id;
    intervention_name;
    intervention_description;
    intervention_type;
    start_date;
    end_date;
    status;
    responsible_party_id;
    responsible_party_name;
    progress_notes;
    completion_percentage;
    outcomes;
    hasil_intervensi;
    tanggal_evaluasi;
    efektivitas;
    orang_tua_hadir;
    created_at;
    updated_at;
};
exports.BimbinganIntervensi = BimbinganIntervensi;
exports.GuidanceIntervention = BimbinganIntervensi;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BimbinganIntervensi.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], BimbinganIntervensi.prototype, "guidance_case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], BimbinganIntervensi.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], BimbinganIntervensi.prototype, "intervention_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], BimbinganIntervensi.prototype, "intervention_description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['counseling', 'tutoring', 'skills_training', 'parent_involvement', 'referral_external', 'monitoring'],
        default: 'counseling',
    }),
    __metadata("design:type", String)
], BimbinganIntervensi.prototype, "intervention_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], BimbinganIntervensi.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], BimbinganIntervensi.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['planned', 'in_progress', 'completed', 'discontinued'],
        default: 'planned',
    }),
    __metadata("design:type", String)
], BimbinganIntervensi.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], BimbinganIntervensi.prototype, "responsible_party_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], BimbinganIntervensi.prototype, "responsible_party_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BimbinganIntervensi.prototype, "progress_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], BimbinganIntervensi.prototype, "completion_percentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BimbinganIntervensi.prototype, "outcomes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BimbinganIntervensi.prototype, "hasil_intervensi", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], BimbinganIntervensi.prototype, "tanggal_evaluasi", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], BimbinganIntervensi.prototype, "efektivitas", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata("design:type", Boolean)
], BimbinganIntervensi.prototype, "orang_tua_hadir", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BimbinganIntervensi.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BimbinganIntervensi.prototype, "updated_at", void 0);
exports.GuidanceIntervention = exports.BimbinganIntervensi = BimbinganIntervensi = __decorate([
    (0, typeorm_1.Entity)('bimbingan_intervensi'),
    (0, typeorm_1.Index)(['guidance_case_id']),
    (0, typeorm_1.Index)(['student_id']),
    (0, typeorm_1.Index)(['status'])
], BimbinganIntervensi);
let GuidanceParentCommunication = class GuidanceParentCommunication {
    id;
    guidance_case_id;
    student_id;
    parent_name;
    parent_contact;
    communication_date;
    communication_type;
    communication_content;
    parent_response;
    parent_agreed_to_involve;
    communicated_by;
    communicated_by_name;
    created_at;
    updated_at;
};
exports.GuidanceParentCommunication = GuidanceParentCommunication;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GuidanceParentCommunication.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], GuidanceParentCommunication.prototype, "guidance_case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], GuidanceParentCommunication.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], GuidanceParentCommunication.prototype, "parent_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], GuidanceParentCommunication.prototype, "parent_contact", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", String)
], GuidanceParentCommunication.prototype, "communication_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['call', 'sms', 'email', 'meeting', 'letter'],
        default: 'call',
    }),
    __metadata("design:type", String)
], GuidanceParentCommunication.prototype, "communication_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], GuidanceParentCommunication.prototype, "communication_content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceParentCommunication.prototype, "parent_response", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], GuidanceParentCommunication.prototype, "parent_agreed_to_involve", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], GuidanceParentCommunication.prototype, "communicated_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], GuidanceParentCommunication.prototype, "communicated_by_name", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceParentCommunication.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceParentCommunication.prototype, "updated_at", void 0);
exports.GuidanceParentCommunication = GuidanceParentCommunication = __decorate([
    (0, typeorm_1.Entity)('guidance_parent_communications'),
    (0, typeorm_1.Index)(['guidance_case_id']),
    (0, typeorm_1.Index)(['student_id']),
    (0, typeorm_1.Index)(['communication_date'])
], GuidanceParentCommunication);
let BimbinganPerkembangan = class BimbinganPerkembangan {
    id;
    guidance_case_id;
    referral_id;
    student_id;
    student_name;
    counselor_id;
    assessment_date;
    tanggal_evaluasi;
    status_keseluruhan;
    previous_attendance_percentage;
    current_attendance_percentage;
    previous_tardiness_count;
    current_tardiness_count;
    previous_violation_count;
    current_violation_count;
    previous_gpa;
    current_gpa;
    behavioral_observations;
    overall_improvement_score;
    progress_assessment;
    assessment_comments;
    assessed_by;
    assessed_by_name;
    created_at;
    updated_at;
};
exports.BimbinganPerkembangan = BimbinganPerkembangan;
exports.GuidanceProgress = BimbinganPerkembangan;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BimbinganPerkembangan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], BimbinganPerkembangan.prototype, "guidance_case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], BimbinganPerkembangan.prototype, "referral_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], BimbinganPerkembangan.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], BimbinganPerkembangan.prototype, "student_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], BimbinganPerkembangan.prototype, "counselor_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], BimbinganPerkembangan.prototype, "assessment_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], BimbinganPerkembangan.prototype, "tanggal_evaluasi", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], BimbinganPerkembangan.prototype, "status_keseluruhan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], BimbinganPerkembangan.prototype, "previous_attendance_percentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], BimbinganPerkembangan.prototype, "current_attendance_percentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], BimbinganPerkembangan.prototype, "previous_tardiness_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], BimbinganPerkembangan.prototype, "current_tardiness_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], BimbinganPerkembangan.prototype, "previous_violation_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], BimbinganPerkembangan.prototype, "current_violation_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], BimbinganPerkembangan.prototype, "previous_gpa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], BimbinganPerkembangan.prototype, "current_gpa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BimbinganPerkembangan.prototype, "behavioral_observations", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], BimbinganPerkembangan.prototype, "overall_improvement_score", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['excellent', 'good', 'fair', 'poor', 'no_change'],
        default: 'fair',
    }),
    __metadata("design:type", String)
], BimbinganPerkembangan.prototype, "progress_assessment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BimbinganPerkembangan.prototype, "assessment_comments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], BimbinganPerkembangan.prototype, "assessed_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], BimbinganPerkembangan.prototype, "assessed_by_name", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BimbinganPerkembangan.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BimbinganPerkembangan.prototype, "updated_at", void 0);
exports.GuidanceProgress = exports.BimbinganPerkembangan = BimbinganPerkembangan = __decorate([
    (0, typeorm_1.Entity)('bimbingan_perkembangan'),
    (0, typeorm_1.Index)(['guidance_case_id']),
    (0, typeorm_1.Index)(['student_id', 'assessment_date'])
], BimbinganPerkembangan);
let BimbinganReferral = class BimbinganReferral {
    id;
    guidance_case_id;
    student_id;
    student_name;
    class_id;
    tahun;
    referral_type;
    referral_reason;
    risk_level;
    external_agency;
    contact_person;
    contact_number;
    referral_date;
    referral_status;
    status;
    completed_date;
    notes;
    referral_source;
    first_appointment_date;
    counselor_id;
    counselor_name;
    assigned_date;
    external_assessment_report;
    recommendations_from_external;
    referred_by;
    created_at;
    updated_at;
};
exports.BimbinganReferral = BimbinganReferral;
exports.GuidanceReferral = BimbinganReferral;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BimbinganReferral.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], BimbinganReferral.prototype, "guidance_case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], BimbinganReferral.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], BimbinganReferral.prototype, "student_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], BimbinganReferral.prototype, "class_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], BimbinganReferral.prototype, "tahun", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], BimbinganReferral.prototype, "referral_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], BimbinganReferral.prototype, "referral_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], BimbinganReferral.prototype, "risk_level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], BimbinganReferral.prototype, "external_agency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], BimbinganReferral.prototype, "contact_person", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], BimbinganReferral.prototype, "contact_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], BimbinganReferral.prototype, "referral_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pending', 'accepted', 'in_progress', 'completed', 'declined'],
        default: 'pending',
    }),
    __metadata("design:type", String)
], BimbinganReferral.prototype, "referral_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], BimbinganReferral.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], BimbinganReferral.prototype, "completed_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BimbinganReferral.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], BimbinganReferral.prototype, "referral_source", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], BimbinganReferral.prototype, "first_appointment_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], BimbinganReferral.prototype, "counselor_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], BimbinganReferral.prototype, "counselor_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], BimbinganReferral.prototype, "assigned_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BimbinganReferral.prototype, "external_assessment_report", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BimbinganReferral.prototype, "recommendations_from_external", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], BimbinganReferral.prototype, "referred_by", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BimbinganReferral.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BimbinganReferral.prototype, "updated_at", void 0);
exports.GuidanceReferral = exports.BimbinganReferral = BimbinganReferral = __decorate([
    (0, typeorm_1.Entity)('bimbingan_referral'),
    (0, typeorm_1.Index)(['student_id', 'tahun']),
    (0, typeorm_1.Index)(['referral_status']),
    (0, typeorm_1.Index)(['risk_level'])
], BimbinganReferral);
let BimbinganStatistik = class BimbinganStatistik {
    id;
    tahun;
    total_cases_open;
    total_cases_closed;
    total_cases_referred;
    total_sessions_completed;
    critical_risk_count;
    high_risk_count;
    medium_risk_count;
    low_risk_count;
    average_case_duration_weeks;
    case_resolution_rate_percentage;
    average_improvement_score;
    most_common_category;
    parent_involvement_percentage;
    created_at;
    updated_at;
};
exports.BimbinganStatistik = BimbinganStatistik;
exports.GuidanceStatistics = BimbinganStatistik;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BimbinganStatistik.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], BimbinganStatistik.prototype, "tahun", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BimbinganStatistik.prototype, "total_cases_open", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BimbinganStatistik.prototype, "total_cases_closed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BimbinganStatistik.prototype, "total_cases_referred", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BimbinganStatistik.prototype, "total_sessions_completed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BimbinganStatistik.prototype, "critical_risk_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BimbinganStatistik.prototype, "high_risk_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BimbinganStatistik.prototype, "medium_risk_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BimbinganStatistik.prototype, "low_risk_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], BimbinganStatistik.prototype, "average_case_duration_weeks", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], BimbinganStatistik.prototype, "case_resolution_rate_percentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], BimbinganStatistik.prototype, "average_improvement_score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], BimbinganStatistik.prototype, "most_common_category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BimbinganStatistik.prototype, "parent_involvement_percentage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BimbinganStatistik.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BimbinganStatistik.prototype, "updated_at", void 0);
exports.GuidanceStatistics = exports.BimbinganStatistik = BimbinganStatistik = __decorate([
    (0, typeorm_1.Entity)('bimbingan_statistik'),
    (0, typeorm_1.Index)(['tahun'])
], BimbinganStatistik);
let BimbinganAbility = class BimbinganAbility {
    id;
    guidance_case_id;
    skill_type;
    proficiency_level;
    assessment_notes;
    created_at;
    updated_at;
};
exports.BimbinganAbility = BimbinganAbility;
exports.GuidanceAbility = BimbinganAbility;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BimbinganAbility.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], BimbinganAbility.prototype, "guidance_case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], BimbinganAbility.prototype, "skill_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], BimbinganAbility.prototype, "proficiency_level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BimbinganAbility.prototype, "assessment_notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BimbinganAbility.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BimbinganAbility.prototype, "updated_at", void 0);
exports.GuidanceAbility = exports.BimbinganAbility = BimbinganAbility = __decorate([
    (0, typeorm_1.Entity)('bimbingan_ability'),
    (0, typeorm_1.Index)(['guidance_case_id']),
    (0, typeorm_1.Index)(['skill_type'])
], BimbinganAbility);
let BimbinganTarget = class BimbinganTarget {
    id;
    guidance_case_id;
    target_description;
    status;
    target_date;
    progress_percentage;
    created_at;
    updated_at;
};
exports.BimbinganTarget = BimbinganTarget;
exports.GuidanceTarget = BimbinganTarget;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BimbinganTarget.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], BimbinganTarget.prototype, "guidance_case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], BimbinganTarget.prototype, "target_description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'pending' }),
    __metadata("design:type", String)
], BimbinganTarget.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], BimbinganTarget.prototype, "target_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BimbinganTarget.prototype, "progress_percentage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BimbinganTarget.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BimbinganTarget.prototype, "updated_at", void 0);
exports.GuidanceTarget = exports.BimbinganTarget = BimbinganTarget = __decorate([
    (0, typeorm_1.Entity)('bimbingan_target'),
    (0, typeorm_1.Index)(['guidance_case_id']),
    (0, typeorm_1.Index)(['status'])
], BimbinganTarget);
let BimbinganStatus = class BimbinganStatus {
    id;
    guidance_case_id;
    student_id;
    tahun;
    status_type;
    status;
    previous_status;
    current_risk_level;
    status_notes;
    total_referrals;
    total_sessions;
    total_interventions;
    first_referral_date;
    latest_referral_id;
    last_session_date;
    next_session_date;
    created_at;
    updated_at;
};
exports.BimbinganStatus = BimbinganStatus;
exports.GuidanceStatus = BimbinganStatus;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BimbinganStatus.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], BimbinganStatus.prototype, "guidance_case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], BimbinganStatus.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], BimbinganStatus.prototype, "tahun", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], BimbinganStatus.prototype, "status_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], BimbinganStatus.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], BimbinganStatus.prototype, "previous_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], BimbinganStatus.prototype, "current_risk_level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BimbinganStatus.prototype, "status_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BimbinganStatus.prototype, "total_referrals", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BimbinganStatus.prototype, "total_sessions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BimbinganStatus.prototype, "total_interventions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], BimbinganStatus.prototype, "first_referral_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", String)
], BimbinganStatus.prototype, "latest_referral_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], BimbinganStatus.prototype, "last_session_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], BimbinganStatus.prototype, "next_session_date", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BimbinganStatus.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BimbinganStatus.prototype, "updated_at", void 0);
exports.GuidanceStatus = exports.BimbinganStatus = BimbinganStatus = __decorate([
    (0, typeorm_1.Entity)('bimbingan_status'),
    (0, typeorm_1.Index)(['student_id', 'tahun']),
    (0, typeorm_1.Index)(['status_type'])
], BimbinganStatus);
//# sourceMappingURL=bimbingan.entity.js.map