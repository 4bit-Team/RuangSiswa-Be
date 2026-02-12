"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateToxicFilterDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_toxic_filter_dto_1 = require("./create-toxic-filter.dto");
class UpdateToxicFilterDto extends (0, mapped_types_1.PartialType)(create_toxic_filter_dto_1.CreateToxicFilterDto) {
}
exports.UpdateToxicFilterDto = UpdateToxicFilterDto;
//# sourceMappingURL=update-toxic-filter.dto.js.map