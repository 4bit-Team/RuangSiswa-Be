export declare class CreateNewsDto {
    title: string;
    summary: string;
    content: string;
    categoryIds: number[];
    imageUrl?: string;
    status: 'draft' | 'published' | 'scheduled';
    scheduledDate?: string;
}
export declare class NewsQueryDto {
    status?: 'draft' | 'published' | 'scheduled';
    categoryId?: string;
    search?: string;
    sortBy?: 'newest' | 'oldest' | 'mostViewed';
    page?: string;
    limit?: string;
}
