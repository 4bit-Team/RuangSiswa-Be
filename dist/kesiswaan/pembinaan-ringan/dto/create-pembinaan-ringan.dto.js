"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePembinaanRinganDto = exports.CompletePembinaanRinganDto = exports.ApprovePembinaanRinganDto = exports.CreatePembinaanRinganDto = void 0;
class CreatePembinaanRinganDto {
    reservasi_id;
    pembinaan_id;
    student_id;
    student_name;
    counselor_id;
    hasil_pembinaan;
    catatan_bk;
    scheduled_date;
    scheduled_time;
    sp_level;
}
exports.CreatePembinaanRinganDto = CreatePembinaanRinganDto;
class ApprovePembinaanRinganDto {
    status;
    bk_feedback;
    bk_notes;
    sp_level;
}
exports.ApprovePembinaanRinganDto = ApprovePembinaanRinganDto;
class CompletePembinaanRinganDto {
    status;
    bk_feedback;
    bk_notes;
    has_follow_up;
    follow_up_notes;
}
exports.CompletePembinaanRinganDto = CompletePembinaanRinganDto;
class UpdatePembinaanRinganDto {
    hasil_pembinaan;
    catatan_bk;
    scheduled_date;
    scheduled_time;
    bk_feedback;
    bk_notes;
    sp_level;
}
exports.UpdatePembinaanRinganDto = UpdatePembinaanRinganDto;
//# sourceMappingURL=create-pembinaan-ringan.dto.js.map