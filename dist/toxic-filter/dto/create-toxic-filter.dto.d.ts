export declare enum SeverityLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high"
}
export declare class CreateToxicFilterDto {
    word: string;
    severity?: SeverityLevel;
    replacement?: string;
    isActive?: boolean;
    description?: string;
}
