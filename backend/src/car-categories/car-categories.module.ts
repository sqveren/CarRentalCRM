import { Module } from '@nestjs/common';
import { CarCategoriesController } from './car-categories.controller';
import { CarCategoriesService } from './car-categories.service';

@Module({
  controllers: [CarCategoriesController],
  providers: [CarCategoriesService],
})
export class CarCategoriesModule {}
