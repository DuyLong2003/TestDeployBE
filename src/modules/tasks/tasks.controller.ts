import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Public } from '@/decorator/customize';
import { Response } from 'express'; // Import từ express

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @Post()
  async create(@Body() dto: CreateTaskDto) {
    const r = await this.tasksService.create(dto);
    return { statusCode: 201, message: 'Created', data: r };
  }

  @Public()
  @Get()
  async findAll(
    @Query() queryParams: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Res({ passthrough: true }) res: Response // Inject Response
  ) {
    const result = await this.tasksService.findAll(queryParams, +current, +pageSize);

    // Set Header dựa trên cờ
    res.set('X-Cache', result.isCacheHit ? 'HIT' : 'MISS');

    // Trả về data gốc
    return { statusCode: 200, message: 'OK', data: result.data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const r = await this.tasksService.findOne(id);
    return { statusCode: 200, message: 'OK', data: r };
  }

  @Patch()
  async update(@Body() dto: UpdateTaskDto) {
    const r = await this.tasksService.update(dto);
    return { statusCode: 200, message: 'Updated', data: r };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const r = await this.tasksService.remove(id);
    return { statusCode: 200, message: 'Deleted', data: r };
  }

}
