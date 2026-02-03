export declare class ToxicFilter {
    id: number;
    word: string;
    severity: 'low' | 'medium' | 'high';
    replacement: string;
    isActive: boolean;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}
