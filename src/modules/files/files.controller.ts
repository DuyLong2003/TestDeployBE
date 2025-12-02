import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from './minio.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Controller('files')
export class FilesController {
    constructor(
        private readonly minioService: MinioService,
        @InjectQueue('files-queue') private fileQueue: Queue // Inject Queue
    ) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        // 1. Upload lên MinIO như bình thường
        const result = await this.minioService.uploadFile(file);

        // 2. Thêm một Job vào hàng đợi để xử lý ngầm (Non-blocking)
        await this.fileQueue.add('upload-task', {
            fileName: result.fileName,
            url: result.url,
            size: file.size,
            uploadedAt: new Date()
        }, {
            delay: 1000, // Đợi 1s sau mới chạy 
            attempts: 3, // Nếu lỗi thử lại 3 lần
            removeOnComplete: true // Xong việc thì xóa job khỏi Redis cho đỡ rác
        });

        console.log('Đã thêm job xử lý file vào hàng đợi');

        return result;
    }
}