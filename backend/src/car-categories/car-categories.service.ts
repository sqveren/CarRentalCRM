import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarCategoryDto } from './dto/create-car-category.dto';
import { UpdateCarCategoryDto } from './dto/update-car-category.dto';

@Injectable()
export class CarCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.carCategory.findMany({
      include: {
        cars: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.carCategory.findUniqueOrThrow({
      where: { id },
      include: {
        cars: true,
      },
    });
  }

  async create(createCarCategoryDto: CreateCarCategoryDto) {
    return this.prisma.carCategory.create({
      data: {
        name: createCarCategoryDto.name,
        pricePerDay: createCarCategoryDto.pricePerDay,
      },
    });
  }

  async update(id: number, updateCarCategoryDto: UpdateCarCategoryDto) {
    return this.prisma.carCategory.update({
      where: { id },
      data: {
        name: updateCarCategoryDto.name,
        pricePerDay: updateCarCategoryDto.pricePerDay,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.carCategory.delete({
      where: { id },
    });
  }
}
