import { Repository } from 'typeorm';
import { Kelas } from './entities/kelas.entity';
export declare class KelasController {
    private readonly kelasRepo;
    constructor(kelasRepo: Repository<Kelas>);
    findAll(): Promise<Kelas[]>;
}
