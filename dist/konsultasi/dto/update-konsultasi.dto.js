"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateKonsultasiDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_konsultasi_dto_1 = require("./create-konsultasi.dto");
class UpdateKonsultasiDto extends (0, mapped_types_1.PartialType)(create_konsultasi_dto_1.CreateKonsultasiDto) {
}
exports.UpdateKonsultasiDto = UpdateKonsultasiDto;
//# sourceMappingURL=update-konsultasi.dto.js.map