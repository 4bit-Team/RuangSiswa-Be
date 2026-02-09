"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStatisticDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_statistic_dto_1 = require("./create-statistic.dto");
class UpdateStatisticDto extends (0, mapped_types_1.PartialType)(create_statistic_dto_1.CreateStatisticDto) {
}
exports.UpdateStatisticDto = UpdateStatisticDto;
//# sourceMappingURL=update-statistic.dto.js.map