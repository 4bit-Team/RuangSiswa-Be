"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateReservasiDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_reservasi_dto_1 = require("./create-reservasi.dto");
class UpdateReservasiDto extends (0, mapped_types_1.PartialType)(create_reservasi_dto_1.CreateReservasiDto) {
}
exports.UpdateReservasiDto = UpdateReservasiDto;
//# sourceMappingURL=update-reservasi.dto.js.map