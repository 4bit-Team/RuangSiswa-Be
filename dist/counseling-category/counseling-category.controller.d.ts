import { CounselingCategoryService } from './counseling-category.service';
import { CreateCounselingCategoryDto, UpdateCounselingCategoryDto } from './dto/create-counseling-category.dto';
export declare class CounselingCategoryController {
    private readonly categoryService;
    constructor(categoryService: CounselingCategoryService);
    create(createDto: CreateCounselingCategoryDto): Promise<import("./entities/counseling-category.entity").CounselingCategory>;
    findAll(): Promise<import("./entities/counseling-category.entity").CounselingCategory[]>;
    findAllIncludeInactive(): Promise<import("./entities/counseling-category.entity").CounselingCategory[]>;
    findById(id: number): Promise<import("./entities/counseling-category.entity").CounselingCategory>;
    update(id: number, updateDto: UpdateCounselingCategoryDto): Promise<import("./entities/counseling-category.entity").CounselingCategory>;
    delete(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
