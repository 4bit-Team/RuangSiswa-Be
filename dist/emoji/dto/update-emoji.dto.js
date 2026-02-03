"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEmojiDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_emoji_dto_1 = require("./create-emoji.dto");
class UpdateEmojiDto extends (0, mapped_types_1.PartialType)(create_emoji_dto_1.CreateEmojiDto) {
}
exports.UpdateEmojiDto = UpdateEmojiDto;
//# sourceMappingURL=update-emoji.dto.js.map