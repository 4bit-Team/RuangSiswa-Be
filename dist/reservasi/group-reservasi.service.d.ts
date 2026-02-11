import { Repository } from 'typeorm';
import { GroupReservasi } from './entities/group-reservasi.entity';
import { CreateGroupReservasiDto, UpdateGroupReservasiStatusDto } from './dto/create-group-reservasi.dto';
import { CounselingCategory } from '../counseling-category/entities/counseling-category.entity';
import { User } from '../users/entities/user.entity';
import { ChatService } from '../chat/chat.service';
export declare class GroupReservasiService {
    private groupReservasiRepository;
    private categoryRepository;
    private userRepository;
    private chatService;
    constructor(groupReservasiRepository: Repository<GroupReservasi>, categoryRepository: Repository<CounselingCategory>, userRepository: Repository<User>, chatService: ChatService);
    create(createGroupReservasiDto: CreateGroupReservasiDto): Promise<GroupReservasi>;
    findAll(filters?: {
        creatorId?: number;
        counselorId?: number;
        status?: string;
        from?: Date;
        to?: Date;
    }): Promise<GroupReservasi[]>;
    findOne(id: number): Promise<GroupReservasi | null>;
    findByStudentId(studentId: number): Promise<GroupReservasi[]>;
    findByCounselorId(counselorId: number): Promise<GroupReservasi[]>;
    getPendingForCounselor(counselorId: number): Promise<GroupReservasi[]>;
    updateStatus(id: number, updateStatusDto: UpdateGroupReservasiStatusDto): Promise<GroupReservasi>;
    initializeSessionResources(id: number): Promise<GroupReservasi>;
    remove(id: number): Promise<GroupReservasi>;
}
