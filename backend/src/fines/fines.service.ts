import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFineDto } from './dto/create-fine.dto';
import { UpdateFineDto } from './dto/update-fine.dto';

@Injectable()
export class FinesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.fine.findMany({
      include: {
        rental: {
          include: {
            client: true,
            car: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.fine.findUniqueOrThrow({
      where: { id },
      include: {
        rental: {
          include: {
            client: true,
            car: true,
          },
        },
      },
    });
  }

  async create(createFineDto: CreateFineDto) {
    return this.prisma.fine.create({
      data: {
        rentalId: createFineDto.rentalId,
        description: createFineDto.description,
        amount: createFineDto.amount,
      },
      include: {
        rental: true,
      },
    });
  }

  async update(id: number, updateFineDto: UpdateFineDto) {
    return this.prisma.fine.update({
      where: { id },
      data: {
        rentalId: updateFineDto.rentalId,
        description: updateFineDto.description,
        amount: updateFineDto.amount,
      },
      include: {
        rental: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.fine.delete({
      where: { id },
    });
  }
}
