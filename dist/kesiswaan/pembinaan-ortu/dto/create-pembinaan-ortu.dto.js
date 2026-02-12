"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParentViewDto = exports.RespondFromParentDto = exports.RecordMeetingDto = exports.SendLetterDto = exports.UpdatePembinaanOrtuDto = exports.CreatePembinaanOrtuDto = void 0;
class CreatePembinaanOrtuDto {
    pembinaan_id;
    student_id;
    student_name;
    student_class;
    parent_id;
    parent_name;
    parent_phone;
    violation_details;
    letter_content;
    scheduled_date;
    scheduled_time;
    location;
    communication_method;
    kesiswaan_notes;
}
exports.CreatePembinaanOrtuDto = CreatePembinaanOrtuDto;
class UpdatePembinaanOrtuDto {
    parent_response;
    meeting_result;
    requires_follow_up;
    follow_up_notes;
    status;
    scheduled_date;
    scheduled_time;
}
exports.UpdatePembinaanOrtuDto = UpdatePembinaanOrtuDto;
class SendLetterDto {
    communication_method;
}
exports.SendLetterDto = SendLetterDto;
class RecordMeetingDto {
    meeting_result;
    parent_response;
    requires_follow_up;
    follow_up_notes;
}
exports.RecordMeetingDto = RecordMeetingDto;
class RespondFromParentDto {
    parent_response;
}
exports.RespondFromParentDto = RespondFromParentDto;
class ParentViewDto {
    id;
    student_name;
    student_class;
    violation_details;
    letter_content;
    scheduled_date;
    scheduled_time;
    location;
    status;
}
exports.ParentViewDto = ParentViewDto;
//# sourceMappingURL=create-pembinaan-ortu.dto.js.map