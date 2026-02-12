import { Repository } from 'typeorm';
import { Pembinaan } from './entities/pembinaan.entity';
import { PointPelanggaran } from '../point-pelanggaran/entities/point-pelanggaran.entity';
import { SyncPembinaanDto } from './dto/sync-pembinaan.dto';
import { UpdatePembinaanDto } from './dto/update-pembinaan.dto';
import { WalasApiClient } from '../../walas/walas-api.client';
import { NotificationService } from '../../notifications/notification.service';
import { UsersService } from '../../users/users.service';
import { KelasService } from '../../kelas/kelas.service';
import { JurusanService } from '../../jurusan/jurusan.service';
export declare class PembinaanService {
    private pembinaanRepository;
    private pointPelanggaranRepository;
    private walasApiClient;
    private usersService;
    private kelasService;
    private jurusanService;
    private notificationService?;
    private readonly logger;
    constructor(pembinaanRepository: Repository<Pembinaan>, pointPelanggaranRepository: Repository<PointPelanggaran>, walasApiClient: WalasApiClient, usersService: UsersService, kelasService: KelasService, jurusanService: JurusanService, notificationService?: NotificationService | undefined);
    fetchAndSyncFromWalas(filters?: {
        student_id?: number;
        class_id?: number;
        walas_id?: number;
        start_date?: string;
        end_date?: string;
    }): Promise<{
        synced: number;
        skipped: number;
        errors: {
            pelanggaran_id?: number;
            siswas_id?: number;
            error: string;
        }[];
    }>;
    syncFromWalas(dto: SyncPembinaanDto): Promise<Pembinaan>;
    private matchPointPelanggaran;
    private getCategoryMatches;
    findAll(filters?: {
        status?: string;
        siswas_id?: number;
        walas_id?: number;
    }): Promise<Pembinaan[]>;
    findById(id: number): Promise<Pembinaan>;
    findByStudent(siswas_id: number): Promise<Pembinaan[]>;
    findByWalas(walas_id: number): Promise<Pembinaan[]>;
    update(id: number, dto: UpdatePembinaanDto): Promise<Pembinaan>;
    delete(id: number): Promise<void>;
    getStatistics(filters?: {
        startDate?: string;
        endDate?: string;
        siswas_id?: number;
        walas_id?: number;
    }): Promise<any>;
    getUnmatched(): Promise<Pembinaan[]>;
    private createOrUpdateStudentUser;
    private parseClassName;
    getWalasStatistics(filters?: {
        class_id?: number;
        walas_id?: number;
        start_date?: string;
        end_date?: string;
    }): Promise<any>;
    updateStatus(ids: number[], status: string): Promise<void>;
    search(query: string): Promise<Pembinaan[]>;
}
