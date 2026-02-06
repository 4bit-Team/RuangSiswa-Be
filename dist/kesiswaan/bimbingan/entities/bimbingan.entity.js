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
exports.BimbinganStatistik = exports.BimbinganStatus = exports.BimbinganTarget = exports.BimbinganAbility = exports.BimbinganPerkembangan = exports.BimbinganIntervensi = exports.BimbinganCatat = exports.BimbinganSesi = exports.BimbinganReferral = exports.BimbinganCategory = exports.GuidanceStatus = exports.GuidanceTarget = exports.GuidanceAbility = exports.GuidanceStatistics = exports.GuidanceReferral = exports.GuidanceProgress = exports.GuidanceParentCommunication = exports.GuidanceIntervention = exports.GuidanceNote = exports.GuidanceSession = exports.GuidanceCase = exports.GuidanceCategory = void 0;
const typeorm_1 = require("typeorm");
let GuidanceCategory = class GuidanceCategory {
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
exports.GuidanceCategory = GuidanceCategory;
exports.BimbinganCategory = GuidanceCategory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GuidanceCategory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], GuidanceCategory.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, unique: true }),
    __metadata("design:type", String)
], GuidanceCategory.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceCategory.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], GuidanceCategory.prototype, "priority_level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], GuidanceCategory.prototype, "recommended_duration_weeks", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], GuidanceCategory.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceCategory.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceCategory.prototype, "updated_at", void 0);
exports.BimbinganCategory = exports.GuidanceCategory = GuidanceCategory = __decorate([
    (0, typeorm_1.Entity)('guidance_categories'),
    (0, typeorm_1.Index)('idx_guidance_code', ['code'], { unique: true }),
    (0, typeorm_1.Index)('idx_guidance_active', ['is_active'])
], GuidanceCategory);
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
    (0, typeorm_1.Index)('idx_guidance_case_student_tahun', ['student_id', 'tahun']),
    (0, typeorm_1.Index)('idx_guidance_case_status', ['status']),
    (0, typeorm_1.Index)('idx_guidance_case_risk', ['risk_level']),
    (0, typeorm_1.Index)('idx_guidance_case_created', ['created_at'])
], GuidanceCase);
let GuidanceSession = class GuidanceSession {
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
exports.GuidanceSession = GuidanceSession;
exports.BimbinganSesi = GuidanceSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GuidanceSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], GuidanceSession.prototype, "guidance_case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", String)
], GuidanceSession.prototype, "referral_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], GuidanceSession.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GuidanceSession.prototype, "sesi_ke", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], GuidanceSession.prototype, "bk_staff_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], GuidanceSession.prototype, "bk_staff_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", String)
], GuidanceSession.prototype, "session_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], GuidanceSession.prototype, "tanggal_sesi", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 30 }),
    __metadata("design:type", Number)
], GuidanceSession.prototype, "duration_minutes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
        default: 'scheduled',
    }),
    __metadata("design:type", String)
], GuidanceSession.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], GuidanceSession.prototype, "session_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], GuidanceSession.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceSession.prototype, "agenda", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceSession.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceSession.prototype, "student_response", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceSession.prototype, "recommendations", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], GuidanceSession.prototype, "student_attended", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], GuidanceSession.prototype, "siswa_hadir", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], GuidanceSession.prototype, "outcome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GuidanceSession.prototype, "effectiveness_rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceSession.prototype, "followup_actions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], GuidanceSession.prototype, "next_session_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], GuidanceSession.prototype, "follow_up_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata("design:type", Boolean)
], GuidanceSession.prototype, "orang_tua_hadir", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceSession.prototype, "hasil_akhir", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], GuidanceSession.prototype, "follow_up_status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceSession.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceSession.prototype, "updated_at", void 0);
exports.BimbinganSesi = exports.GuidanceSession = GuidanceSession = __decorate([
    (0, typeorm_1.Entity)('guidance_sessions'),
    (0, typeorm_1.Index)('idx_session_case', ['guidance_case_id']),
    (0, typeorm_1.Index)('idx_session_student_date', ['student_id', 'session_date']),
    (0, typeorm_1.Index)('idx_session_status', ['status'])
], GuidanceSession);
let GuidanceNote = class GuidanceNote {
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
exports.GuidanceNote = GuidanceNote;
exports.BimbinganCatat = GuidanceNote;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GuidanceNote.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], GuidanceNote.prototype, "guidance_case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], GuidanceNote.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], GuidanceNote.prototype, "note_content", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['observation', 'progress_update', 'parent_communication', 'incident', 'breakthrough'],
        default: 'observation',
    }),
    __metadata("design:type", String)
], GuidanceNote.prototype, "note_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], GuidanceNote.prototype, "sentiment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], GuidanceNote.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], GuidanceNote.prototype, "created_by_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], GuidanceNote.prototype, "created_by_role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceNote.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], GuidanceNote.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceNote.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceNote.prototype, "updated_at", void 0);
exports.BimbinganCatat = exports.GuidanceNote = GuidanceNote = __decorate([
    (0, typeorm_1.Entity)('guidance_notes'),
    (0, typeorm_1.Index)('idx_note_case', ['guidance_case_id']),
    (0, typeorm_1.Index)('idx_note_by', ['created_by']),
    (0, typeorm_1.Index)('idx_note_created', ['created_at'])
], GuidanceNote);
let GuidanceIntervention = class GuidanceIntervention {
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
exports.GuidanceIntervention = GuidanceIntervention;
exports.BimbinganIntervensi = GuidanceIntervention;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GuidanceIntervention.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], GuidanceIntervention.prototype, "guidance_case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], GuidanceIntervention.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], GuidanceIntervention.prototype, "intervention_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], GuidanceIntervention.prototype, "intervention_description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['counseling', 'tutoring', 'skills_training', 'parent_involvement', 'referral_external', 'monitoring'],
        default: 'counseling',
    }),
    __metadata("design:type", String)
], GuidanceIntervention.prototype, "intervention_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], GuidanceIntervention.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], GuidanceIntervention.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['planned', 'in_progress', 'completed', 'discontinued'],
        default: 'planned',
    }),
    __metadata("design:type", String)
], GuidanceIntervention.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], GuidanceIntervention.prototype, "responsible_party_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], GuidanceIntervention.prototype, "responsible_party_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceIntervention.prototype, "progress_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GuidanceIntervention.prototype, "completion_percentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceIntervention.prototype, "outcomes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceIntervention.prototype, "hasil_intervensi", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], GuidanceIntervention.prototype, "tanggal_evaluasi", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GuidanceIntervention.prototype, "efektivitas", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata("design:type", Boolean)
], GuidanceIntervention.prototype, "orang_tua_hadir", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceIntervention.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceIntervention.prototype, "updated_at", void 0);
exports.BimbinganIntervensi = exports.GuidanceIntervention = GuidanceIntervention = __decorate([
    (0, typeorm_1.Entity)('guidance_interventions'),
    (0, typeorm_1.Index)('idx_intervention_case', ['guidance_case_id']),
    (0, typeorm_1.Index)('idx_intervention_student', ['student_id']),
    (0, typeorm_1.Index)('idx_intervention_status', ['status'])
], GuidanceIntervention);
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
    (0, typeorm_1.Index)('idx_comm_case', ['guidance_case_id']),
    (0, typeorm_1.Index)('idx_comm_student', ['student_id']),
    (0, typeorm_1.Index)('idx_comm_date', ['communication_date'])
], GuidanceParentCommunication);
let GuidanceProgress = class GuidanceProgress {
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
exports.GuidanceProgress = GuidanceProgress;
exports.BimbinganPerkembangan = GuidanceProgress;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GuidanceProgress.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], GuidanceProgress.prototype, "guidance_case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], GuidanceProgress.prototype, "referral_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], GuidanceProgress.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], GuidanceProgress.prototype, "student_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], GuidanceProgress.prototype, "counselor_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], GuidanceProgress.prototype, "assessment_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], GuidanceProgress.prototype, "tanggal_evaluasi", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], GuidanceProgress.prototype, "status_keseluruhan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GuidanceProgress.prototype, "previous_attendance_percentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GuidanceProgress.prototype, "current_attendance_percentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GuidanceProgress.prototype, "previous_tardiness_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GuidanceProgress.prototype, "current_tardiness_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GuidanceProgress.prototype, "previous_violation_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GuidanceProgress.prototype, "current_violation_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], GuidanceProgress.prototype, "previous_gpa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], GuidanceProgress.prototype, "current_gpa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceProgress.prototype, "behavioral_observations", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GuidanceProgress.prototype, "overall_improvement_score", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['excellent', 'good', 'fair', 'poor', 'no_change'],
        default: 'fair',
    }),
    __metadata("design:type", String)
], GuidanceProgress.prototype, "progress_assessment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceProgress.prototype, "assessment_comments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], GuidanceProgress.prototype, "assessed_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], GuidanceProgress.prototype, "assessed_by_name", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceProgress.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceProgress.prototype, "updated_at", void 0);
exports.BimbinganPerkembangan = exports.GuidanceProgress = GuidanceProgress = __decorate([
    (0, typeorm_1.Entity)('guidance_progress'),
    (0, typeorm_1.Index)('idx_progress_case', ['guidance_case_id']),
    (0, typeorm_1.Index)('idx_progress_student_date', ['student_id', 'assessment_date'])
], GuidanceProgress);
let GuidanceReferral = class GuidanceReferral {
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
exports.GuidanceReferral = GuidanceReferral;
exports.BimbinganReferral = GuidanceReferral;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GuidanceReferral.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], GuidanceReferral.prototype, "guidance_case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], GuidanceReferral.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], GuidanceReferral.prototype, "student_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GuidanceReferral.prototype, "class_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], GuidanceReferral.prototype, "tahun", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], GuidanceReferral.prototype, "referral_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], GuidanceReferral.prototype, "referral_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], GuidanceReferral.prototype, "risk_level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], GuidanceReferral.prototype, "external_agency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], GuidanceReferral.prototype, "contact_person", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], GuidanceReferral.prototype, "contact_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], GuidanceReferral.prototype, "referral_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pending', 'accepted', 'in_progress', 'completed', 'declined'],
        default: 'pending',
    }),
    __metadata("design:type", String)
], GuidanceReferral.prototype, "referral_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], GuidanceReferral.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], GuidanceReferral.prototype, "completed_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceReferral.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceReferral.prototype, "referral_source", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], GuidanceReferral.prototype, "first_appointment_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], GuidanceReferral.prototype, "counselor_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], GuidanceReferral.prototype, "counselor_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], GuidanceReferral.prototype, "assigned_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceReferral.prototype, "external_assessment_report", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceReferral.prototype, "recommendations_from_external", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], GuidanceReferral.prototype, "referred_by", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceReferral.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceReferral.prototype, "updated_at", void 0);
exports.BimbinganReferral = exports.GuidanceReferral = GuidanceReferral = __decorate([
    (0, typeorm_1.Entity)('guidance_referrals'),
    (0, typeorm_1.Index)('idx_referral_student_tahun', ['student_id', 'tahun']),
    (0, typeorm_1.Index)('idx_referral_status', ['referral_status']),
    (0, typeorm_1.Index)('idx_referral_risk', ['risk_level'])
], GuidanceReferral);
let GuidanceStatistics = class GuidanceStatistics {
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
exports.GuidanceStatistics = GuidanceStatistics;
exports.BimbinganStatistik = GuidanceStatistics;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GuidanceStatistics.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], GuidanceStatistics.prototype, "tahun", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GuidanceStatistics.prototype, "total_cases_open", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GuidanceStatistics.prototype, "total_cases_closed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GuidanceStatistics.prototype, "total_cases_referred", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GuidanceStatistics.prototype, "total_sessions_completed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GuidanceStatistics.prototype, "critical_risk_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GuidanceStatistics.prototype, "high_risk_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GuidanceStatistics.prototype, "medium_risk_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GuidanceStatistics.prototype, "low_risk_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], GuidanceStatistics.prototype, "average_case_duration_weeks", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], GuidanceStatistics.prototype, "case_resolution_rate_percentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], GuidanceStatistics.prototype, "average_improvement_score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], GuidanceStatistics.prototype, "most_common_category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GuidanceStatistics.prototype, "parent_involvement_percentage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceStatistics.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceStatistics.prototype, "updated_at", void 0);
exports.BimbinganStatistik = exports.GuidanceStatistics = GuidanceStatistics = __decorate([
    (0, typeorm_1.Entity)('guidance_statistics'),
    (0, typeorm_1.Index)('idx_stat_tahun', ['tahun'])
], GuidanceStatistics);
let GuidanceAbility = class GuidanceAbility {
    id;
    guidance_case_id;
    skill_type;
    proficiency_level;
    assessment_notes;
    created_at;
    updated_at;
};
exports.GuidanceAbility = GuidanceAbility;
exports.BimbinganAbility = GuidanceAbility;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GuidanceAbility.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], GuidanceAbility.prototype, "guidance_case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], GuidanceAbility.prototype, "skill_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], GuidanceAbility.prototype, "proficiency_level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceAbility.prototype, "assessment_notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceAbility.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceAbility.prototype, "updated_at", void 0);
exports.BimbinganAbility = exports.GuidanceAbility = GuidanceAbility = __decorate([
    (0, typeorm_1.Entity)('guidance_abilities'),
    (0, typeorm_1.Index)('idx_ability_case', ['guidance_case_id']),
    (0, typeorm_1.Index)('idx_ability_skill', ['skill_type'])
], GuidanceAbility);
let GuidanceTarget = class GuidanceTarget {
    id;
    guidance_case_id;
    target_description;
    status;
    target_date;
    progress_percentage;
    created_at;
    updated_at;
};
exports.GuidanceTarget = GuidanceTarget;
exports.BimbinganTarget = GuidanceTarget;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GuidanceTarget.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], GuidanceTarget.prototype, "guidance_case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], GuidanceTarget.prototype, "target_description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'pending' }),
    __metadata("design:type", String)
], GuidanceTarget.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], GuidanceTarget.prototype, "target_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GuidanceTarget.prototype, "progress_percentage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceTarget.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceTarget.prototype, "updated_at", void 0);
exports.BimbinganTarget = exports.GuidanceTarget = GuidanceTarget = __decorate([
    (0, typeorm_1.Entity)('guidance_targets'),
    (0, typeorm_1.Index)('idx_target_case', ['guidance_case_id']),
    (0, typeorm_1.Index)('idx_target_status', ['status'])
], GuidanceTarget);
let GuidanceStatus = class GuidanceStatus {
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
exports.GuidanceStatus = GuidanceStatus;
exports.BimbinganStatus = GuidanceStatus;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GuidanceStatus.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], GuidanceStatus.prototype, "guidance_case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GuidanceStatus.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GuidanceStatus.prototype, "tahun", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], GuidanceStatus.prototype, "status_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], GuidanceStatus.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], GuidanceStatus.prototype, "previous_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], GuidanceStatus.prototype, "current_risk_level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GuidanceStatus.prototype, "status_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GuidanceStatus.prototype, "total_referrals", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GuidanceStatus.prototype, "total_sessions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GuidanceStatus.prototype, "total_interventions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], GuidanceStatus.prototype, "first_referral_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", String)
], GuidanceStatus.prototype, "latest_referral_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], GuidanceStatus.prototype, "last_session_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], GuidanceStatus.prototype, "next_session_date", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceStatus.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GuidanceStatus.prototype, "updated_at", void 0);
exports.BimbinganStatus = exports.GuidanceStatus = GuidanceStatus = __decorate([
    (0, typeorm_1.Entity)('guidance_statuses'),
    (0, typeorm_1.Index)('idx_gstatus_student_tahun', ['student_id', 'tahun']),
    (0, typeorm_1.Index)('idx_gstatus_type', ['status_type'])
], GuidanceStatus);
//# sourceMappingURL=bimbingan.entity.js.map