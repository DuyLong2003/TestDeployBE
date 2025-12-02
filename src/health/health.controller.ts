import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, MongooseHealthIndicator } from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health';
import { Public } from '@/decorator/customize';

@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private db: MongooseHealthIndicator,
        private redis: RedisHealthIndicator,
    ) { }

    @Public()
    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            // 1. Check MongoDB
            () => this.db.pingCheck('database'),

            // 2. Check Redis
            () => this.redis.isHealthy('redis-cache'),
        ]);
    }
}