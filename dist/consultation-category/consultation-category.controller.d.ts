import { ConsultationCategoryService } from './consultation-category.service';
import { CreateConsultationCategoryDto, UpdateConsultationCategoryDto } from './dto/create-consultation-category.dto';
export declare class ConsultationCategoryController {
    private readonly categoryService;
    constructor(categoryService: ConsultationCategoryService);
    create(createDto: CreateConsultationCategoryDto): Promise<import("./entities/consultation-category.entity").ConsultationCategory>;
    findAll(): Promise<import("./entities/consultation-category.entity").ConsultationCategory[]>;
    findAllIncludeInactive(): Promise<import("./entities/consultation-category.entity").ConsultationCategory[]>;
    findById(id: number): Promise<import("./entities/consultation-category.entity").ConsultationCategory>;
    update(id: number, updateDto: UpdateConsultationCategoryDto): Promise<import("./entities/consultation-category.entity").ConsultationCategory>;
    delete(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
