export declare class UploadController {
    uploadNewsImage(file: Express.Multer.File): Promise<{
        message: string;
        filename: string;
        url: string;
        size: number;
    }>;
}
