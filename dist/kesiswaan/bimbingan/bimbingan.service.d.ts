import { Repository } from 'typeorm';
import { WalasApiClient } from '../../walas/walas-api.client';
import { BimbinganCategory, BimbinganReferral, BimbinganSesi, BimbinganCatat, BimbinganIntervensi, BimbinganPerkembangan, BimbinganAbility, BimbinganTarget, BimbinganStatus, BimbinganStatistik } from './entities/bimbingan.entity';
interface CreateReferralDto {
    student_id: number;
    student_name: string;
    class_id: number;
    tahun: number;
    referral_reason: string;
    risk_level: string;
    referral_source?: {
        source: string;
        source_id: string;
        details: string;
    };
    notes?: string;
}
interface CreateSesiDto {
    referral_id: string;
    student_id: number;
    student_name: string;
    counselor_id: string;
    counselor_name: string;
    tanggal_sesi: string;
    jam_sesi?: string;
    topik_pembahasan: string;
    lokasi?: string;
}
interface CreateCatatDto {
    referral_id: string;
    student_id: number;
    student_name: string;
    counselor_id: string;
    counselor_name: string;
    jenis_catat: string;
    isi_catat: string;
    tanggal_catat: string;
    memerlukan_tindakan?: boolean;
    tindakan_lanjutan?: string;
}
interface CreateIntervensiDto {
    referral_id: string;
    student_id: number;
    student_name: string;
    counselor_id: string;
    counselor_name: string;
    jenis_intervensi: string;
    deskripsi_intervensi: string;
    tanggal_intervensi: string;
}
interface CreateTargetDto {
    referral_id: string;
    student_id: number;
    student_name: string;
    counselor_id: string;
    area_target: string;
    target_spesifik: string;
    tanggal_mulai: string;
    tanggal_target: string;
    strategi_pencapaian?: string;
}
export declare class BimbinganService {
    private categoryRepo;
    private referralRepo;
    private sesiRepo;
    private catatRepo;
    private intervensiRepo;
    private perkembanganRepo;
    private abilityRepo;
    private targetRepo;
    private statusRepo;
    private statistikRepo;
    private walasApiClient;
    private readonly logger;
    constructor(categoryRepo: Repository<BimbinganCategory>, referralRepo: Repository<BimbinganReferral>, sesiRepo: Repository<BimbinganSesi>, catatRepo: Repository<BimbinganCatat>, intervensiRepo: Repository<BimbinganIntervensi>, perkembanganRepo: Repository<BimbinganPerkembangan>, abilityRepo: Repository<BimbinganAbility>, targetRepo: Repository<BimbinganTarget>, statusRepo: Repository<BimbinganStatus>, statistikRepo: Repository<BimbinganStatistik>, walasApiClient: WalasApiClient);
    createReferral(dto: CreateReferralDto): Promise<BimbinganReferral>;
    syncGuidanceFromWalas(startDate: Date, endDate: Date, forceSync?: boolean): Promise<{
        success: boolean;
        synced_referrals: number;
        failed: number;
        errors: any[];
    }>;
    getReferrals(filters: {
        student_id?: number;
        counselor_id?: string;
        status?: string;
        risk_level?: string;
        tahun?: number;
        page?: number;
        limit?: number;
    }): Promise<{
        data: BimbinganReferral[];
        total: number;
        page: number;
        limit: number;
    }>;
    assignCounselor(referral_id: string, counselor_id: string, counselor_name: string): Promise<BimbinganReferral | null>;
    createSesi(dto: CreateSesiDto): Promise<BimbinganSesi>;
    completeSesi(sesi_id: string, siswa_hadir: boolean, orang_tua_hadir: boolean, hasil_akhir: string, follow_up_status?: string, follow_up_date?: string): Promise<BimbinganSesi | null>;
    getSesi(filters: {
        referral_id?: string;
        student_id?: number;
        counselor_id?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: BimbinganSesi[];
        total: number;
        page: number;
        limit: number;
    }>;
    addCatat(dto: CreateCatatDto): Promise<BimbinganCatat>;
    getCatat(filters: {
        referral_id?: string;
        student_id?: number;
        counselor_id?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: BimbinganCatat[];
        total: number;
        page: number;
        limit: number;
    }>;
    createIntervensi(dto: CreateIntervensiDto): Promise<BimbinganIntervensi>;
    evaluateIntervensi(intervensi_id: string, hasil_intervensi: string, efektivitas: string): Promise<BimbinganIntervensi | null>;
    getIntervensi(filters: {
        referral_id?: string;
        student_id?: number;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: BimbinganIntervensi[];
        total: number;
        page: number;
        limit: number;
    }>;
    recordPerkembangan(referral_id: string, student_id: number, student_name: string, counselor_id: string, evaluasi: {
        perilaku_skor?: number;
        perilaku_catatan?: string;
        akademik_skor?: number;
        akademik_catatan?: string;
        emosi_skor?: number;
        emosi_catatan?: string;
        kehadiran_skor?: number;
        kehadiran_catatan?: string;
        sesi_total_dijalankan?: number;
    }): Promise<BimbinganPerkembangan>;
    getPerkembangan(filters: {
        referral_id?: string;
        student_id?: number;
        page?: number;
        limit?: number;
    }): Promise<{
        data: BimbinganPerkembangan[];
        total: number;
        page: number;
        limit: number;
    }>;
    createTarget(dto: CreateTargetDto): Promise<BimbinganTarget>;
    getTarget(filters: {
        referral_id?: string;
        student_id?: number;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: BimbinganTarget[];
        total: number;
        page: number;
        limit: number;
    }>;
    getStudentStatus(student_id: number, tahun?: number): Promise<BimbinganStatus | null>;
    getAllStatuses(filters?: {
        tahun?: number;
        page?: number;
        limit?: number;
        risk_level?: string;
        status?: string;
    }): Promise<{
        data: BimbinganStatus[];
        total: number;
        page: number;
        limit: number;
    }>;
    private generateUUID;
    private updateStatus;
    private isReferralNeeded;
    private determineRiskLevel;
    private formatDate;
}
export {};
