import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class WalasApiClient {
    private httpService;
    private configService;
    private walasUrl;
    private apiToken;
    constructor(httpService: HttpService, configService: ConfigService);
    private getHeaders;
    private buildUrl;
    private handleError;
    getPelanggaranList(filters?: {
        student_id?: number;
        class_id?: number;
        walas_id?: number;
        start_date?: string;
        end_date?: string;
        page?: number;
        limit?: number;
    }): Promise<any>;
    syncPembinaanFromWalas(payload: {
        walas_id: number;
        walas_name?: string;
        siswas_id: number;
        siswas_name?: string;
        kasus: string;
        tindak_lanjut?: string;
        keterangan?: string;
        tanggal_pembinaan: string;
        class_id?: number;
        class_name?: string;
    }): Promise<any>;
    getPelanggaranStats(filters?: {
        class_id?: number;
        walas_id?: number;
        start_date?: string;
        end_date?: string;
    }): Promise<any>;
    getPelanggaranDetail(pelanggaranId: number): Promise<any>;
    getPelanggaranByStudent(studentId: number, limit?: number): Promise<any>;
    getPelanggaranByWalas(walasId: number, page?: number, limit?: number): Promise<any>;
    healthCheck(): Promise<boolean>;
}
