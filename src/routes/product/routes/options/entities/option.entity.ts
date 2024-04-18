import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../../entities/product.entity';
import { ProductQuestion } from '../../question/entities/productQuestion.entity';

@Entity('ProductOptions')
export class Option {
  @PrimaryGeneratedColumn()
  optionId?: number;

  @ManyToOne(() => Product, (product) => product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ length: 20 })
  optionName: string;

  @Column()
  addPrice: number;

  @Column()
  stock: number;

  @OneToMany(() => ProductQuestion, (question) => question.option)
  productQuestions?: ProductQuestion[];
}