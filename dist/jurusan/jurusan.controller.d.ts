import { Repository } from 'typeorm';
import { Jurusan } from './entities/jurusan.entity';
export declare class JurusanController {
    private readonly jurusanRepo;
    constructor(jurusanRepo: Repository<Jurusan>);
    findAll(): Promise<Jurusan[]>;
}
