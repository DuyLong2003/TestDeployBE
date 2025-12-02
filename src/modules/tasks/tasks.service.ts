import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { Model } from 'mongoose';
import aqp from 'api-query-params';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksGateway } from './tasks.gateway';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Logger } from '@nestjs/common';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private tasksGateway: TasksGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache, // Inject Cache Manager
  ) { }

  async create(dto: CreateTaskDto) {
    const doc: any = {
      title: dto.title,
      description: dto.description ?? '',
      status: dto.status ?? 'todo',
      assignee: dto.assignee ?? null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
    };
    const task = await this.taskModel.create(doc);

    // Socket emit
    this.tasksGateway.emitTaskCreated({
      _id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      assignee: task.assignee,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
    });

    // INVALIDATE CACHE: Có task mới -> Xóa cache list cũ
    await this.clearCache();

    return { _id: task._id };
  }

  async findAll(query: any, current: number, pageSize: number) {
    // 1. Gán mặc định ngay từ đầu để tránh NaN
    const page = current ? Number(current) : 1;
    const size = pageSize ? Number(pageSize) : 10;

    // 2. Tạo Key Cache
    const cacheKey = `tasks:${JSON.stringify(query)}:${page}:${size}`;

    // 3. Check Cache
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      this.logger.warn('HIT CACHE:', cacheKey);
      //console.log('HIT CACHE:', cacheKey);
      // return cachedData;
      return { data: cachedData, isCacheHit: true };
    }

    // console.log('MISS CACHE -> Query DB');
    this.logger.warn(`MISS CACHE -> Query DB`); // Dùng warn cho nổi bật

    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current || isNaN(current)) current = 1;
    if (!pageSize || isNaN(pageSize)) pageSize = 10;

    if (filter.search) {
      filter.title = { $regex: filter.search, $options: 'i' };
      delete filter.search;
    }
    if (filter.title && typeof filter.title === 'string') {
      filter.title = { $regex: filter.title, $options: 'i' };
    }
    if (filter.assignee && typeof filter.assignee === 'string') {
      filter.assignee = { $regex: filter.assignee, $options: 'i' };
    }

    const totalItems = await this.taskModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const results = await this.taskModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .lean();

    const response = {
      meta: {
        current,
        pageSize,
        pages: totalPages,
        total: totalItems,
      },
      results,
    };

    // 3. Lưu vào Cache (TTL 60 giây)
    await this.cacheManager.set(cacheKey, response, 60000);

    // return response;
    return { data: response, isCacheHit: false };
  }

  async findOne(id: string) {
    return await this.taskModel.findById(id).lean();
  }

  async update(dto: UpdateTaskDto) {
    const { _id, ...rest } = dto as any;
    const res = await this.taskModel.updateOne({ _id }, { ...rest });

    this.tasksGateway.emitTaskUpdated(dto);

    // INVALIDATE CACHE: Dữ liệu thay đổi -> Xóa cache
    await this.clearCache();

    return res;
  }

  async remove(_id: string) {
    if (!_id) throw new BadRequestException('Id required');
    this.tasksGateway.emitTaskDeleted(_id);

    const res = await this.taskModel.deleteOne({ _id });

    // INVALIDATE CACHE
    await this.clearCache();

    return res;
  }

  private async clearCache() {
    // Ép kiểu 'this.cacheManager' về 'any' để truy cập được vào 'store'
    const store = (this.cacheManager as any).store;

    // Kiểm tra xem store có hàm keys không
    if (store && typeof store.keys === 'function') {
      const keys: string[] = await store.keys('tasks:*');
      if (keys.length > 0) {
        await store.del(keys);
        console.log('Cleared cache keys:', keys);
      }
    } else {
      console.warn('Cache store does not support "keys" method. Skipping cache invalidation.');
    }
  }
}