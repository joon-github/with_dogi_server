import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CategoriesDetail } from '../detail/entities/CategoriesDetail.entity';
import { CategoriesType } from '../enums/categories_type.enum';

@Entity('Categories')
export class Categories {
  @PrimaryGeneratedColumn()
  category_id: number;

  @Column({ length: 50 })
  category_name: string;

  @Column({
    type: 'enum',
    enum: CategoriesType,
    default: CategoriesType.Products,
  })
  type: string;

  @OneToMany(() => CategoriesDetail, (category) => category.category)
  categoriesDetail: CategoriesDetail[];
}