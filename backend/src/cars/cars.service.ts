import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';

@Injectable()
export class CarsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.car.findMany({
      include: {
        category: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.car.findUniqueOrThrow({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  async create(createCarDto: CreateCarDto) {
    return this.prisma.car.create({
      data: {
        brand: createCarDto.brand,
        model: createCarDto.model,
        manufactureYear: createCarDto.manufactureYear,
        mileage: createCarDto.mileage ?? 0,
        status: createCarDto.status ?? 'available',
        categoryId: createCarDto.categoryId,
      },
      include: {
        category: true,
      },
    });
  }

  async update(id: number, updateCarDto: UpdateCarDto) {
    return this.prisma.car.update({
      where: { id },
      data: {
        brand: updateCarDto.brand,
        model: updateCarDto.model,
        manufactureYear: updateCarDto.manufactureYear,
        mileage: updateCarDto.mileage,
        status: updateCarDto.status,
        categoryId: updateCarDto.categoryId,
      },
      include: {
        category: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.car.delete({
      where: { id },
    });
  }
}
