import { Repository } from 'typeorm';
import { Kelas } from './entities/kelas.entity';
export declare class KelasService {
    private readonly kelasRepo;
    constructor(kelasRepo: Repository<Kelas>);
    findOne(id: number): Promise<Kelas | null>;
}
