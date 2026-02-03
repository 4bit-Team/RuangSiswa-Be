import { Repository } from 'typeorm';
import { CounselingCategory } from './entities/counseling-category.entity';
import { CreateCounselingCategoryDto, UpdateCounselingCategoryDto } from './dto/create-counseling-category.dto';
export declare class CounselingCategoryService {
    private readonly categoryRepository;
    constructor(categoryRepository: Repository<CounselingCategory>);
    create(createDto: CreateCounselingCategoryDto): Promise<CounselingCategory>;
    findAll(isActive?: boolean): Promise<CounselingCategory[]>;
    findById(id: number): Promise<CounselingCategory>;
    update(id: number, updateDto: UpdateCounselingCategoryDto): Promise<CounselingCategory>;
    delete(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    incrementUsage(id: number): Promise<void>;
    decrementUsage(id: number): Promise<void>;
}
