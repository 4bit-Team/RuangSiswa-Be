import { PembinaanOrtuService } from './pembinaan-ortu.service';
import { CreatePembinaanOrtuDto, UpdatePembinaanOrtuDto, SendLetterDto, RecordMeetingDto, RespondFromParentDto } from './dto/create-pembinaan-ortu.dto';
export declare class PembinaanOrtuController {
    private readonly pembinaanOrtuService;
    private readonly logger;
    constructor(pembinaanOrtuService: PembinaanOrtuService);
    create(createDto: CreatePembinaanOrtuDto): Promise<import("./entities/pembinaan-ortu.entity").PembinaanOrtu>;
    findAll(): Promise<import("./entities/pembinaan-ortu.entity").PembinaanOrtu[]>;
    findByParentId(parentId: number, user: any): Promise<any[]>;
    findOne(id: number): Promise<import("./entities/pembinaan-ortu.entity").PembinaanOrtu>;
    update(id: number, updateDto: UpdatePembinaanOrtuDto): Promise<import("./entities/pembinaan-ortu.entity").PembinaanOrtu>;
    sendLetter(id: number, sendDto: SendLetterDto): Promise<import("./entities/pembinaan-ortu.entity").PembinaanOrtu>;
    recordParentResponse(id: number, respondDto: RespondFromParentDto): Promise<import("./entities/pembinaan-ortu.entity").PembinaanOrtu>;
    recordMeeting(id: number, recordDto: RecordMeetingDto): Promise<import("./entities/pembinaan-ortu.entity").PembinaanOrtu>;
    getPendingLetters(): Promise<import("./entities/pembinaan-ortu.entity").PembinaanOrtu[]>;
    getStatistics(): Promise<any>;
    findByStudentId(studentId: number): Promise<import("./entities/pembinaan-ortu.entity").PembinaanOrtu[]>;
}
