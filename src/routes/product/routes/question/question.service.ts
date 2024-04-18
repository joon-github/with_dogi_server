import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductQuestion } from './entities/productQuestion.entity';
import { Repository } from 'typeorm';
import { AddQuestionDto } from './dto/AddQuestionDto.dto';
import { AuthService } from 'src/routes/auth/services/auth.service';
import { OptionsService } from '../options/options.service';
import { ProductService } from '../../product.service';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(ProductQuestion)
    private productQuestionRepository: Repository<ProductQuestion>,

    private readonly authService: AuthService,
    private readonly optionsService: OptionsService,
    private readonly productService: ProductService,
  ) {}

  private async questionQueryBuilder() {
    return this.productQuestionRepository
      .createQueryBuilder('ProductQuestion')
      .leftJoin('ProductQuestion.user', 'User')
      .leftJoin('ProductQuestion.option', 'Option')
      .leftJoin('Option.product', 'Product')
      .select(['ProductQuestion', 'User.name', 'Option', 'Product']);
  }

  async addQuestion(addQuestionDto: AddQuestionDto, userId: number) {
    const findUser = await this.authService.findUserById(userId);
    const option = await this.optionsService.findOptionByOptionId(
      addQuestionDto.optionId,
    );
    const question = new ProductQuestion();

    question.user = findUser;
    question.option = option;
    question.questionTitle = addQuestionDto.questionTitle;
    question.questionContent = addQuestionDto.questionContent;

    await this.productQuestionRepository.save(question);
  }

  async getQuestionByProductId(
    productId: number,
    userId: number,
    isOwner: boolean,
  ) {
    const queryBuilder = await this.questionQueryBuilder();
    queryBuilder.where('Product.productId = :productId', { productId });
    if (isOwner) {
      await this.productService.checkProductOwner(productId, userId);
    } else {
      queryBuilder.andWhere('User.userId = :userId', { userId });
    }
    const question = await queryBuilder.getMany();
    return question;
  }

  async getQuestionByUserId(userId: number) {
    const queryBuilder = await this.questionQueryBuilder();
    queryBuilder.where('User.userId = :userId', { userId });
    const question = await queryBuilder.getMany();
    return question;
  }
}