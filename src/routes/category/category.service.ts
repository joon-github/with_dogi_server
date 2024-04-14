import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/Category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from 'src/routes/auth/services/auth.service';
import { CategoryException } from './exceptions/category-exceptions';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,

    private authService: AuthService,
  ) {}

  public async findCategoryByCategoriId(categoriId: number) {
    const category = await this.categoryRepository
      .createQueryBuilder('Category')
      .where('Category.categoriId = :categoriId', { categoriId })
      .getOne();
    if (!category) {
      throw new CategoryException(CategoryException.Category_NOT_FOUND);
    }
    return category;
  }

  async create(createCategoryDto: CreateCategoryDto, userId: number) {
    await this.authService.adminCheck(userId);
    const category: Category = {
      categoryName: createCategoryDto.categoryName,
      type: createCategoryDto.type,
    };
    if (createCategoryDto.parentsCategoryId) {
      const findCategory = await this.findCategoryByCategoriId(
        createCategoryDto.parentsCategoryId,
      );
      category.parent = findCategory;
    }
    return this.categoryRepository.save(category);
  }

  async findByType(type: string) {
    const queryBuilder = this.categoryRepository
      .createQueryBuilder('Category')
      .where('Category.type = :type', { type });
    return queryBuilder.getMany();
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    userId: number,
  ) {
    await this.authService.adminCheck(userId);
    await this.findCategoryByCategoriId(id);
    return this.categoryRepository.update(id, updateCategoryDto);
  }

  async remove(id: number, userId: number) {
    await this.authService.adminCheck(userId);
    await this.findCategoryByCategoriId(id);
    return this.categoryRepository.delete(id);
  }
}