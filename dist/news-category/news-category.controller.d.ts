import { NewsCategoryService } from './news-category.service';
import { CreateNewsCategoryDto, UpdateNewsCategoryDto } from './dto/create-news-category.dto';
export declare class NewsCategoryController {
    private readonly categoryService;
    constructor(categoryService: NewsCategoryService);
    create(createDto: CreateNewsCategoryDto): Promise<import("./entities/news-category.entity").NewsCategory>;
    findAll(): Promise<import("./entities/news-category.entity").NewsCategory[]>;
    findAllIncludeInactive(): Promise<import("./entities/news-category.entity").NewsCategory[]>;
    findById(id: number): Promise<import("./entities/news-category.entity").NewsCategory>;
    update(id: number, updateDto: UpdateNewsCategoryDto): Promise<import("./entities/news-category.entity").NewsCategory>;
    delete(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
