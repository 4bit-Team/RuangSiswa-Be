import { Repository } from 'typeorm';
import { Reservasi } from './entities/reservasi.entity';
import { CreateReservasiDto, UpdateReservasiStatusDto } from './dto/create-reservasi.dto';
import { CounselingCategory } from '../counseling-category/entities/counseling-category.entity';
import { ChatService } from '../chat/chat.service';
export declare class ReservasiService {
    private reservasiRepository;
    private categoryRepository;
    private chatService;
    constructor(reservasiRepository: Repository<Reservasi>, categoryRepository: Repository<CounselingCategory>, chatService: ChatService);
    create(createReservasiDto: CreateReservasiDto): Promise<Reservasi>;
    findAll(filters?: {
        studentId?: number;
        counselorId?: number;
        status?: string;
        from?: Date;
        to?: Date;
    }): Promise<Reservasi[]>;
    findOne(id: number): Promise<Reservasi | null>;
    findByStudentId(studentId: number): Promise<Reservasi[]>;
    findByCounselorId(counselorId: number): Promise<Reservasi[]>;
    updateStatus(id: number, updateStatusDto: UpdateReservasiStatusDto): Promise<Reservasi>;
    delete(id: number): Promise<boolean>;
    getPendingForCounselor(counselorId: number): Promise<Reservasi[]>;
    getSchedule(counselorId: number, from: Date, to: Date): Promise<Reservasi[]>;
    reschedule(id: number, rescheduleData: {
        preferredDate?: string;
        preferredTime?: string;
        counselorId?: number;
    }): Promise<Reservasi>;
    generateQRCode(id: number): Promise<string>;
    confirmAttendance(id: number, qrData: string): Promise<Reservasi>;
    markAsCompleted(id: number): Promise<Reservasi>;
    assignRoom(id: number, room?: string): Promise<Reservasi>;
}
