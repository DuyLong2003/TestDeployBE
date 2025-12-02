import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @IsNotEmpty({ message: 'Name không được để trống' })
    @IsString()
    name: string;

    @IsNotEmpty({ message: 'Price không được để trống' })
    @Min(0, { message: 'Price không được âm' })
    @IsNumber({}, { message: 'Price phải là dạng số' })
    @Type(() => Number) // Tự động convert string "100" -> number 100
    price: number;

    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    image: string;

    @IsOptional()
    @IsString()
    category: string;

    @IsOptional()
    @Min(0, { message: 'Stock không được âm' })
    @IsNumber({}, { message: 'Stock phải là dạng số' })
    @Type(() => Number)
    stock: number;
}