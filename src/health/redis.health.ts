import { Injectable, Inject } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {
        super();
    }

    async isHealthy(key: string): Promise<HealthIndicatorResult> {
        try {
            // Thử set một key 'health-check' và cho hết hạn ngay sau 1 giây
            await this.cacheManager.set('health-check', 'ok', 1);

            // Nếu không lỗi gì thì trả về trạng thái UP
            return this.getStatus(key, true);
        } catch (error) {
            // Nếu lỗi (Redis sập, sai password...) thì ném lỗi HealthCheckError
            throw new HealthCheckError(
                'Redis check failed',
                this.getStatus(key, false, { message: error.message })
            );
        }
    }
}