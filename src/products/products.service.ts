import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Products, ProductsDocument } from './schema/product.schema';
import apiQueryParams from 'api-query-params';
import mongoose from 'mongoose';
import { MinioService } from '@/modules/files/minio.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Products.name) private productModel: Model<ProductsDocument>,
    private readonly minioService: MinioService
  ) { }

  async create(createProductDto: CreateProductDto) {
    const newProduct = await this.productModel.create(createProductDto);
    return {
      _id: newProduct._id,
      createdAt: newProduct.createdAt
    };
  }

  async findAll(query: any, current: number, pageSize: number) {
    const { filter, sort } = apiQueryParams(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.productModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const results = await this.productModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any);

    return {
      meta: {
        current: current,
        pageSize: pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result: results,
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return `Product not found`;
    return this.productModel.findOne({ _id: id });
  }

  // === Xử lý URL chuẩn xác ===
  private parseUrl(url: string) {
    if (!url) return null;
    try {
      // Tự động tách bucket và tên file từ URL
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(p => p.length > 0);
      if (pathParts.length >= 2) {
        const bucketName = pathParts[0];
        const fileName = decodeURIComponent(pathParts.slice(1).join('/'));
        return { bucketName, fileName };
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    if (!mongoose.Types.ObjectId.isValid(id)) return `Product not found`;

    const oldProduct = await this.productModel.findById(id);
    if (!oldProduct) return `Product not found`;
    if (updateProductDto.image !== undefined) {

      // Nếu sản phẩm cũ ĐANG CÓ ảnh
      if (oldProduct.image) {
        if (updateProductDto.image !== oldProduct.image) {
          const parsed = this.parseUrl(oldProduct.image);
          if (parsed) {
            await this.minioService.deleteFile(parsed.fileName, parsed.bucketName);
          }
        }
      }
    }

    return await this.productModel.updateOne({ _id: id }, { ...updateProductDto });
  }

  // === DELETE PRODUCT ===
  async remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return `Product not found`;

    const product = await this.productModel.findById(id);
    if (product && product.image) {
      const parsed = this.parseUrl(product.image);
      if (parsed) {
        await this.minioService.deleteFile(parsed.fileName, parsed.bucketName);
      }
    }

    return this.productModel.deleteOne({ _id: id });
  }
}