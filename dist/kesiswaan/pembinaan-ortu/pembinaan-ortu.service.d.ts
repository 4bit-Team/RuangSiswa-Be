import { Repository } from 'typeorm';
import { PembinaanOrtu } from './entities/pembinaan-ortu.entity';
import { CreatePembinaanOrtuDto, UpdatePembinaanOrtuDto, SendLetterDto, RecordMeetingDto, RespondFromParentDto } from './dto/create-pembinaan-ortu.dto';
import { Pembinaan } from '../pembinaan/entities/pembinaan.entity';
export declare class PembinaanOrtuService {
    private pembinaanOrtuRepo;
    private pembinaanRepo;
    private readonly logger;
    constructor(pembinaanOrtuRepo: Repository<PembinaanOrtu>, pembinaanRepo: Repository<Pembinaan>);
    create(createDto: CreatePembinaanOrtuDto): Promise<PembinaanOrtu>;
    findAll(): Promise<PembinaanOrtu[]>;
    findOne(id: number): Promise<PembinaanOrtu>;
    findByParentId(parentId: number): Promise<any[]>;
    findByStudentId(studentId: number): Promise<PembinaanOrtu[]>;
    update(id: number, updateDto: UpdatePembinaanOrtuDto): Promise<PembinaanOrtu>;
    sendLetter(id: number, sendDto: SendLetterDto): Promise<PembinaanOrtu>;
    recordParentResponse(id: number, respondDto: RespondFromParentDto): Promise<PembinaanOrtu>;
    recordMeeting(id: number, recordDto: RecordMeetingDto): Promise<PembinaanOrtu>;
    getPendingLetters(): Promise<PembinaanOrtu[]>;
    getStatistics(): Promise<any>;
}
