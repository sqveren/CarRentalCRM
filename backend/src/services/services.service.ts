import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.service.findMany({
      include: {
        rentalServices: {
          include: {
            rental: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.service.findUniqueOrThrow({
      where: { id },
      include: {
        rentalServices: {
          include: {
            rental: true,
          },
        },
      },
    });
  }

  async create(createServiceDto: CreateServiceDto) {
    return this.prisma.service.create({
      data: {
        name: createServiceDto.name,
        price: createServiceDto.price,
      },
    });
  }

  async update(id: number, updateServiceDto: UpdateServiceDto) {
    return this.prisma.service.update({
      where: { id },
      data: {
        name: updateServiceDto.name,
        price: updateServiceDto.price,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.service.delete({
      where: { id },
    });
  }
}
