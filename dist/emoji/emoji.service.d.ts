import { Repository } from 'typeorm';
import { Emoji } from './entities/emoji.entity';
import { CreateEmojiDto } from './dto/create-emoji.dto';
import { UpdateEmojiDto } from './dto/update-emoji.dto';
export declare class EmojiService {
    private emojiRepository;
    constructor(emojiRepository: Repository<Emoji>);
    create(dto: CreateEmojiDto): Promise<Emoji>;
    findAll(active?: boolean): Promise<Emoji[]>;
    findById(id: number): Promise<Emoji | null>;
    findByEmoji(emoji: string): Promise<Emoji | null>;
    findByCategory(category: string): Promise<Emoji[]>;
    search(query: string): Promise<Emoji[]>;
    update(id: number, dto: UpdateEmojiDto): Promise<Emoji | null>;
    delete(id: number): Promise<void>;
    getCategories(): Promise<string[]>;
}
