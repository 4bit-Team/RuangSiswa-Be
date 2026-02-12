import { User } from '../../users/entities/user.entity';
import { Reservasi } from './reservasi.entity';
export declare class Feedback {
    id: number;
    reservasiId: number;
    reservasi: Reservasi;
    studentId: number;
    student: User;
    counselorId: number;
    counselor: User;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}
