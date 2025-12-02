import { Module, RequestMethod } from '@nestjs/common'; // Bỏ RequestMethod
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { UsersModule } from '@/modules/users/users.module';
import { LikesModule } from '@/modules/likes/likes.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuItemOptionsModule } from '@/modules/menu.item.options/menu.item.options.module';
import { MenuItemsModule } from '@/modules/menu.items/menu.items.module';
import { MenusModule } from '@/modules/menus/menus.module';
import { OrderDetailModule } from '@/modules/order.detail/order.detail.module';
import { OrdersModule } from '@/modules/orders/orders.module';
import { RestaurantsModule } from '@/modules/restaurants/restaurants.module';
import { ReviewsModule } from '@/modules/reviews/reviews.module';
import { AuthModule } from '@/auth/auth.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './auth/passport/jwt-auth.guard';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { TransformInterceptor } from '@/core/transform.interceptor';
import { TasksModule } from './modules/tasks/tasks.module';
import { FilesModule } from './modules/files/files.module';
import { ProductsModule } from './products/products.module';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import * as redisStore from 'cache-manager-redis-store';
import { HealthModule } from './health/health.module';
import { MailJobModule } from './modules/mail-job/mail-job.module';
import { LoggerModule } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    UsersModule,
    LikesModule,
    MenuItemOptionsModule,
    MenuItemsModule,
    MenusModule,
    OrderDetailModule,
    OrdersModule,
    RestaurantsModule,
    ReviewsModule,
    TasksModule,
    AuthModule,
    FilesModule,
    ConfigModule.forRoot({ isGlobal: true }),

    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule], // Inject ConfigModule
      useFactory: async (config: ConfigService) => ({ // Inject ConfigService
        store: redisStore,
        // Đọc từ env, nếu không có thì mới fallback về localhost (để chạy local vẫn được)
        host: config.get('REDIS_HOST') || 'localhost',
        port: config.get('REDIS_PORT') || 6379,
        ttl: 60,
      }),
      inject: [ConfigService],
    }),

    BullModule.forRootAsync({ // Đổi sang forRootAsync
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST') || 'localhost',
          port: config.get('REDIS_PORT') || 6379,
        },
      }),
      inject: [ConfigService],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
          connectionTimeout: 10000,
          greetingTimeout: 5000, // 5000ms = 5s
          socketTimeout: 10000,
        },
        defaults: { from: '"No Reply" <no-reply@localhost>' },
        template: {
          // dir: process.cwd() + '/src/mail/templates/',
          dir: join(__dirname, 'mail/templates'),
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
      inject: [ConfigService],
    }),

    ProductsModule,
    HealthModule,
    MailJobModule,

    // --- CẤU HÌNH LOGGER CHUẨN ---
    LoggerModule.forRoot({
      pinoHttp: {
        // 1. Sinh Request ID (Correlation ID)
        genReqId: (req) => req.headers['x-request-id'] || uuidv4(),

        // 2. Cấu hình Pretty Print
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,       // Log trên 1 dòng
            translateTime: 'SYS:standard', // Hiển thị giờ hệ thống 
            ignore: 'pid,hostname', // Ẩn PID và Hostname
            colorize: true,
          },
        },

        autoLogging: true,
        // 4. Map các trường req/res vào log object
        serializers: {
          req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
          }),
        },
      },
    }),

    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    }
  ],
})
export class AppModule { }