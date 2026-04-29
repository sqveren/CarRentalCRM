import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';

const rentalInclude = {
  client: true,
  car: {
    include: {
      category: true,
    },
  },
  employee: {
    include: {
      role: true,
    },
  },
  payments: true,
  rentalServices: {
    include: {
      service: true,
    },
  },
  fines: true,
};

@Injectable()
export class RentalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.rental.findMany({
      include: rentalInclude,
      orderBy: {
        id: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.rental.findUniqueOrThrow({
      where: { id },
      include: rentalInclude,
    });
  }

  async create(createRentalDto: CreateRentalDto) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const rental = await tx.rental.create({
        data: {
          clientId: createRentalDto.clientId,
          carId: createRentalDto.carId,
          employeeId: createRentalDto.employeeId,
          startDate: new Date(createRentalDto.startDate),
          endDate: new Date(createRentalDto.endDate),
          startMileage: createRentalDto.startMileage,
          endMileage: createRentalDto.endMileage,
          status: createRentalDto.status ?? 'active',
        },
      });

      if (createRentalDto.serviceIds?.length) {
        await tx.rentalService.createMany({
          data: createRentalDto.serviceIds.map((serviceId) => ({
            rentalId: rental.id,
            serviceId,
          })),
        });
      }

      return tx.rental.findUniqueOrThrow({
        where: { id: rental.id },
        include: rentalInclude,
      });
    });
  }

  async update(id: number, updateRentalDto: UpdateRentalDto) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.rental.update({
        where: { id },
        data: {
          clientId: updateRentalDto.clientId,
          carId: updateRentalDto.carId,
          employeeId: updateRentalDto.employeeId,
          startDate: updateRentalDto.startDate ? new Date(updateRentalDto.startDate) : undefined,
          endDate: updateRentalDto.endDate ? new Date(updateRentalDto.endDate) : undefined,
          startMileage: updateRentalDto.startMileage,
          endMileage: updateRentalDto.endMileage,
          status: updateRentalDto.status,
        },
      });

      if (updateRentalDto.serviceIds) {
        await tx.rentalService.deleteMany({
          where: { rentalId: id },
        });

        if (updateRentalDto.serviceIds.length) {
          await tx.rentalService.createMany({
            data: updateRentalDto.serviceIds.map((serviceId) => ({
              rentalId: id,
              serviceId,
            })),
          });
        }
      }

      return tx.rental.findUniqueOrThrow({
        where: { id },
        include: rentalInclude,
      });
    });
  }

  async remove(id: number) {
    return this.prisma.rental.delete({
      where: { id },
    });
  }
}
