import { User } from '../../users/entities/user.entity';
import { Jurusan } from '../../jurusan/entities/jurusan.entity';
export declare class BkJurusan {
    id: number;
    bkId: number;
    bk: User;
    jurusanId: number;
    jurusan: Jurusan;
    createdAt: Date;
    updatedAt: Date;
}
