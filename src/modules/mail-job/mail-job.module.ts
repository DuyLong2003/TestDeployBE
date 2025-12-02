import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MailJobController } from './mail-job.controller';
import { MailJobProcessor } from './mail-job.processor';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'mail-queue', // Tên hàng đợi
            limiter: {
                max: 10, // Chỉ cho phép xử lý tối đa 10 job
                duration: 1000, // Trong vòng 1 giây
            }
        }),
    ],
    controllers: [MailJobController],
    providers: [MailJobProcessor],
})
export class MailJobModule { }