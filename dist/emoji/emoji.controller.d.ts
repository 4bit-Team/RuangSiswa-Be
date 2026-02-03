import { EmojiService } from './emoji.service';
import { CreateEmojiDto } from './dto/create-emoji.dto';
import { UpdateEmojiDto } from './dto/update-emoji.dto';
export declare class EmojiController {
    private readonly emojiService;
    constructor(emojiService: EmojiService);
    getAllEmojis(active?: string): Promise<import("./entities/emoji.entity").Emoji[]>;
    searchEmojis(query: string): Promise<import("./entities/emoji.entity").Emoji[]>;
    getCategories(): Promise<string[]>;
    getEmojiById(id: number): Promise<import("./entities/emoji.entity").Emoji>;
    createEmoji(dto: CreateEmojiDto): Promise<import("./entities/emoji.entity").Emoji>;
    updateEmoji(id: number, dto: UpdateEmojiDto): Promise<import("./entities/emoji.entity").Emoji | null>;
    deleteEmoji(id: number): Promise<{
        message: string;
    }>;
}
