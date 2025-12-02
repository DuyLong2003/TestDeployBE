import { IsNotEmpty, IsOptional, IsEnum, IsString, IsISO8601 } from 'class-validator';

export class CreateTaskDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(['todo', 'doing', 'done'])
    status?: 'todo' | 'doing' | 'done';

    @IsOptional()
    @IsString()
    assignee?: string;

    @IsOptional()
    @IsISO8601()
    dueDate?: string; // ISO string -> convert in service if needed
}
