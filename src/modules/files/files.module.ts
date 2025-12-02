import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { MinioService } from './minio.service';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';

@Module({
    imports: [
        ConfigModule,
        // Đăng ký hàng đợi tên là 'files-queue'
        BullModule.registerQueue({
            name: 'files-queue',
        }),
    ],
    controllers: [FilesController],
    providers: [
        MinioService,
    ],
    exports: [MinioService]
})
export class FilesModule { }