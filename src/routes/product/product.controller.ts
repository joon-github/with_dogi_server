import { Request } from 'express';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Product } from './entities/product.entity';
import { TokenPayload } from 'src/routes/auth/interfaces/token-payload.interface';

import { ResponesContainerDto } from 'src/global/dto/respones-container.dto';
import { FindAllProductQueryDto } from './dto/find_all_product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
@ApiTags('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: '상품 전체 조회' })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'productCode', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findAll(
    @Query() queryDto: FindAllProductQueryDto,
  ): Promise<ResponesContainerDto<Product[]>> {
    const data = await this.productService.findAll(
      queryDto.userId,
      queryDto.categoryId,
      queryDto.productCode,
      queryDto.limit,
      queryDto.offset,
    );
    return {
      statusCode: 200,
      message: '상품 전체 조회 성공',
      data: data.product,
      total: data.total,
      limit: queryDto.limit,
      offset: queryDto.offset,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '상품 단일 조회' })
  async findOne(
    @Param('id') id: string,
  ): Promise<ResponesContainerDto<Product>> {
    const data = await this.productService.findOne(+id);
    return {
      statusCode: 200,
      message: `${id}번 상품 조회 성공`,
      data: data,
    };
  }

  @Post()
  @ApiOperation({ summary: '상품 등록' })
  async create(
    @Body() createProductDto: CreateProductDto,
    @Req() request: Request,
  ): Promise<ResponesContainerDto<null>> {
    const user = request['user'] as TokenPayload;
    await this.productService.create(createProductDto, user.userId);
    return {
      statusCode: 201,
      message: '상품 등록 성공',
      data: null,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: '상품 수정' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() request: Request,
  ): Promise<ResponesContainerDto<null>> {
    const user = request['user'] as TokenPayload;
    await this.productService.update(+id, updateProductDto, user.email);
    return {
      statusCode: 200,
      message: `${id}번 상품 수정 성공`,
      data: null,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '상품 삭제' })
  async remove(
    @Param('id') id: string,
    @Req() request: Request,
  ): Promise<ResponesContainerDto<null>> {
    const user = request['user'] as TokenPayload;
    await this.productService.remove(+id, user.email);
    return {
      statusCode: 200,
      message: `${id}번 상품 삭제 성공`,
      data: null,
    };
  }
}