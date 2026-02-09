import { Repository } from 'typeorm';
import { NewsCategory } from './entities/news-category.entity';
import { CreateNewsCategoryDto, UpdateNewsCategoryDto } from './dto/create-news-category.dto';
export declare class NewsCategoryService {
    private readonly categoryRepository;
    constructor(categoryRepository: Repository<NewsCategory>);
    create(createDto: CreateNewsCategoryDto): Promise<NewsCategory>;
    findAll(isActive?: boolean): Promise<NewsCategory[]>;
    findById(id: number): Promise<NewsCategory>;
    update(id: number, updateDto: UpdateNewsCategoryDto): Promise<NewsCategory>;
    delete(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    incrementUsage(id: number): Promise<void>;
    decrementUsage(id: number): Promise<void>;
}
