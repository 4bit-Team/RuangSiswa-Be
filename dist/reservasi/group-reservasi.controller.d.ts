import { GroupReservasiService } from './group-reservasi.service';
import { CreateGroupReservasiDto, UpdateGroupReservasiStatusDto } from './dto/create-group-reservasi.dto';
export declare class GroupReservasiController {
    private readonly groupReservasiService;
    constructor(groupReservasiService: GroupReservasiService);
    create(createGroupReservasiDto: CreateGroupReservasiDto, req: any): Promise<import("./entities/group-reservasi.entity").GroupReservasi>;
    findAll(creatorId?: string, counselorId?: string, status?: string): Promise<import("./entities/group-reservasi.entity").GroupReservasi[]>;
    getMyGroupReservations(req: any): Promise<import("./entities/group-reservasi.entity").GroupReservasi[]>;
    getByStudentId(studentId: string): Promise<import("./entities/group-reservasi.entity").GroupReservasi[]>;
    getByCounselorId(req: any): Promise<import("./entities/group-reservasi.entity").GroupReservasi[]>;
    getPendingGroupReservations(req: any): Promise<import("./entities/group-reservasi.entity").GroupReservasi[]>;
    findOne(id: string): Promise<import("./entities/group-reservasi.entity").GroupReservasi | null>;
    updateStatus(id: string, updateStatusDto: UpdateGroupReservasiStatusDto, req: any): Promise<import("./entities/group-reservasi.entity").GroupReservasi>;
    remove(id: string, req: any): Promise<import("./entities/group-reservasi.entity").GroupReservasi>;
}
