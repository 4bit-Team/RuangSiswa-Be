import { Repository } from 'typeorm';
import { BkJurusan } from './entities/bk-jurusan.entity';
import { User } from '../users/entities/user.entity';
export declare class BkJurusanService {
    private bkJurusanRepository;
    private userRepository;
    constructor(bkJurusanRepository: Repository<BkJurusan>, userRepository: Repository<User>);
    addJurusan(bkId: number, jurusanId: number): Promise<BkJurusan>;
    getJurusanByBkId(bkId: number): Promise<BkJurusan[]>;
    updateJurusanList(bkId: number, jurusanIds: number[]): Promise<BkJurusan[]>;
    removeJurusan(bkId: number, jurusanId: number): Promise<{
        success: boolean;
    }>;
    hasJurusan(bkId: number, jurusanId: number): Promise<boolean>;
    getBKsByJurusanId(jurusanId: number): Promise<BkJurusan[]>;
    hasBkConfiguredAnyJurusan(bkId: number): Promise<boolean>;
}
