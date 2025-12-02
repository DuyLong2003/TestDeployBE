import { Controller, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Public } from '@/decorator/customize';

@Controller('mail-job')
export class MailJobController {
    constructor(@InjectQueue('mail-queue') private mailQueue: Queue) { }

    @Public()
    @Post('welcome')
    async sendWelcomeEmail(@Body() body: { email: string }) {
        console.log('Data nhận từ Postman:', body);

        // 2. Validate thủ công
        if (!body.email) {
            throw new BadRequestException('Bạn chưa gửi field "email" trong Body!');
        }

        // 3. Đẩy vào hàng đợi
        await this.mailQueue.add('send-welcome', {
            email: body.email, // Lấy từ body.email
            subject: 'Chào mừng đến với AgriTech (Test Queue)',
            name: 'Bạn mới',
        }, {
            attempts: 3,
            backoff: 5000,
            removeOnComplete: true,
            removeOnFail: false
        });

        return {
            message: 'Đã nhận yêu cầu!',
            timestamp: new Date()
        };
    }
}