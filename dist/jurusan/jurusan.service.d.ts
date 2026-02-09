import { Repository } from 'typeorm';
import { Jurusan } from './entities/jurusan.entity';
export declare class JurusanService {
    private readonly jurusanRepo;
    constructor(jurusanRepo: Repository<Jurusan>);
    findOne(id: number): Promise<Jurusan | null>;
}
