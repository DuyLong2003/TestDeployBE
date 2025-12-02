import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService implements OnModuleInit {
    private minioClient: Minio.Client;
    private bucketName: string;

    constructor(private configService: ConfigService) {
        this.bucketName = this.configService.get('MINIO_BUCKET') || 'agritech-files';

        this.minioClient = new Minio.Client({
            endPoint: this.configService.get('MINIO_ENDPOINT') || 'localhost',
            port: parseInt(this.configService.get('MINIO_PORT') || '9000'),
            useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
            accessKey: this.configService.get('MINIO_ACCESS_KEY'),
            secretKey: this.configService.get('MINIO_SECRET_KEY'),
        });
    }

    async onModuleInit() {
        // Tự động tạo bucket nếu chưa tồn tại
        const exists = await this.minioClient.bucketExists(this.bucketName);
        if (!exists) {
            await this.minioClient.makeBucket(this.bucketName, 'us-east-1');

        }
        // Set policy public để xem được ảnh
        const policy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Effect: 'Allow',
                    Principal: { AWS: ['*'] },
                    Action: ['s3:GetObject'],
                    Resource: [`arn:aws:s3:::${this.bucketName}/*`],
                },
            ],
        };
        await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));

    }

    async uploadFile(file: Express.Multer.File) {
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.originalname}`;

        await this.minioClient.putObject(
            this.bucketName,
            fileName,
            file.buffer,
            file.size,
            { 'Content-Type': file.mimetype }
        );

        // Trả về URL công khai của file
        const protocol = this.configService.get('MINIO_USE_SSL') === 'true' ? 'https' : 'http';
        const host = this.configService.get('MINIO_ENDPOINT');
        const port = this.configService.get('MINIO_PORT');

        return {
            url: `${protocol}://${host}:${port}/${this.bucketName}/${fileName}`,
            fileName: fileName
        };
    }

    async deleteFile(fileName: string, bucketName?: string) {
        const targetBucket = bucketName || this.bucketName;
        try {
            await this.minioClient.removeObject(targetBucket, fileName);
            console.log(`Deleted file: ${fileName} from bucket: ${targetBucket}`);
        } catch (error) {
            console.error(`Failed to delete file ${fileName} from ${targetBucket}:`, error);
        }
    }
}