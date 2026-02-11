import { ReservasiService } from './reservasi.service';
import { CreateReservasiDto, UpdateReservasiStatusDto, CreatePembinaanReservasiDto } from './dto/create-reservasi.dto';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
export declare class ReservasiController {
    private readonly reservasiService;
    private readonly feedbackService;
    constructor(reservasiService: ReservasiService, feedbackService: FeedbackService);
    create(createReservasiDto: CreateReservasiDto, req: any): Promise<import("./entities/reservasi.entity").Reservasi>;
    createPembinaanReservasi(createPembinaanDto: CreatePembinaanReservasiDto, req: any): Promise<import("./entities/reservasi.entity").Reservasi>;
    getByCounselingType(type: string, req: any): Promise<import("./entities/reservasi.entity").Reservasi[]>;
    getByPembinaanId(pembinaanId: string): Promise<import("./entities/reservasi.entity").Reservasi | null>;
    getByPembinaanType(type: string, req: any): Promise<import("./entities/reservasi.entity").Reservasi[]>;
    findAll(studentId?: string, counselorId?: string, status?: string): Promise<import("./entities/reservasi.entity").Reservasi[]>;
    getMyReservations(req: any): Promise<import("./entities/reservasi.entity").Reservasi[]>;
    getByStudentId(studentId: string): Promise<import("./entities/reservasi.entity").Reservasi[]>;
    getPendingReservations(req: any): Promise<import("./entities/reservasi.entity").Reservasi[]>;
    getSchedule(req: any, from?: string, to?: string): Promise<import("./entities/reservasi.entity").Reservasi[]>;
    findOne(id: string): Promise<import("./entities/reservasi.entity").Reservasi | null>;
    updateStatus(id: string, updateStatusDto: UpdateReservasiStatusDto, req: any): Promise<import("./entities/reservasi.entity").Reservasi>;
    approveReservasi(id: string, req: any): Promise<import("./entities/reservasi.entity").Reservasi>;
    rejectReservasi(id: string, body: {
        reason?: string;
    }, req: any): Promise<import("./entities/reservasi.entity").Reservasi>;
    delete(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    cancelReservasi(id: string, body: {
        reason?: string;
    }, req: any): Promise<import("./entities/reservasi.entity").Reservasi>;
    rescheduleReservasi(id: string, body: {
        preferredDate?: string;
        preferredTime?: string;
        counselorId?: number;
    }, req: any): Promise<import("./entities/reservasi.entity").Reservasi>;
    generateQRCode(id: string, body: {
        room?: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            qrCode: string;
            room: string;
        };
    }>;
    confirmAttendance(id: string, body: {
        qrData: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/reservasi.entity").Reservasi;
    }>;
    markAsCompleted(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/reservasi.entity").Reservasi;
    }>;
    createFeedback(createFeedbackDto: CreateFeedbackDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/feedback.entity").Feedback;
    }>;
    getFeedback(reservasiId: string, req: any): Promise<{
        success: boolean;
        data: import("./entities/feedback.entity").Feedback;
    }>;
    getCounselorFeedback(counselorId: string, req: any): Promise<{
        success: boolean;
        data: {
            feedbacks: import("./entities/feedback.entity").Feedback[];
            averageRating: number;
            totalFeedbacks: number;
        };
    }>;
    getStudentFeedback(studentId: string, req: any): Promise<{
        success: boolean;
        data: import("./entities/feedback.entity").Feedback[];
    }>;
}
