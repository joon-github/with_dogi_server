import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Products } from './entities/products.entity';
import { ProductsException } from './exceptions/products-exceptions';
import { AuthService } from 'src/auth/services/auth.service';
import { AuthException } from 'src/auth/exceptions/auth-exceptions';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Products)
    private productRepository: Repository<Products>,

    private readonly authService: AuthService,
  ) {}

  private getProducts(): SelectQueryBuilder<Products> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('Products')
      .leftJoinAndSelect('Products.brand', 'Brand')
      .leftJoinAndSelect('Brand.user', 'Members')
      .leftJoinAndSelect('Products.category_detail', 'CategoriesDetail')
      .leftJoinAndSelect('CategoriesDetail.category', 'Categories')
      .select([
        'Products',
        'Brand',
        'Members.name',
        'Members.user_id',
        'CategoriesDetail',
        'Categories',
      ]);
    return queryBuilder;
  }

  private async findProduct(id: number) {
    const product = await this.getProducts()
      .where(`Products.product_id = :id`, { id })
      .getOne();
    if (!product) {
      throw new ProductsException(ProductsException.PRODUCT_NOT_FOUND);
    }
    return product;
  }

  private async checkProductOwner(id: number, email: string): Promise<void> {
    const findUser = await this.authService.findUserByEmail(email);
    const findProduct = await this.findProduct(id);
    if (findUser.user_id !== findProduct.brand.user.user_id) {
      throw new AuthException(AuthException.LOGIN_FAIL);
    }
  }

  async create(createProductDto: CreateProductDto, email: string) {
    try {
      const findUser = await this.authService.findUserByEmail(email);
      if (findUser.role === 'user') {
        throw new AuthException(AuthException.IS_NOT_AUTHORIZED);
      }
      const productCode = uuidv4();
      const product = {
        ...createProductDto,
        product_code: productCode,
      };
      console.log(product);
      return this.productRepository.save(product);
    } catch (e) {
      console.log('e,', e);
    }
  }

  async findAll(
    user_id: number,
    category_detail_id: number,
    category_id: number,
    product_code: string,
  ) {
    const products = this.getProducts();
    const where = {};
    const like = {};
    if (user_id) {
      where['Members.user_id'] = user_id;
    }
    if (category_detail_id) {
      where['CategoriesDetail.category_detail_id'] = category_detail_id;
    }
    if (category_id) {
      where['Categories.category_id'] = category_id;
    }

    if (product_code) {
      like['Products.product_code'] = product_code;
    }
    Object.entries(where).forEach(([key, value]) => {
      products.andWhere(`${key} = :value`, { value });
    });
    Object.entries(like).forEach(([key, value]) => {
      products.andWhere(`${key} LIKE :value`, { value: `%${value}%` });
    });
    const data = await products.getMany();
    return data;
  }

  async findOne(id: number) {
    const product = await this.findProduct(id);
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto, email: string) {
    await this.checkProductOwner(id, email);
    updateProductDto.updated_at = new Date();
    return await this.productRepository.update(id, updateProductDto);
  }

  async remove(id: number, email: string) {
    await this.checkProductOwner(id, email);
    return await this.productRepository.delete(id);
  }
}
