import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { ReturnRentalDto } from './dto/return-rental.dto';
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
      if (createRentalDto.endMileage !== undefined) {
        throw new BadRequestException('End mileage is recorded only during vehicle return.');
      }

      const car = await tx.car.findUniqueOrThrow({
        where: { id: createRentalDto.carId },
      });

      if (car.status !== 'available') {
        throw new BadRequestException('Only available cars can be rented.');
      }

      const rental = await tx.rental.create({
        data: {
          clientId: createRentalDto.clientId,
          carId: createRentalDto.carId,
          employeeId: createRentalDto.employeeId,
          startDate: new Date(createRentalDto.startDate),
          endDate: new Date(createRentalDto.endDate),
          startMileage: createRentalDto.startMileage ?? car.mileage,
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

  async returnRental(id: number, returnRentalDto: ReturnRentalDto) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const currentRental = await tx.rental.findUniqueOrThrow({
        where: { id },
      });

      if (currentRental.status === 'completed') {
        throw new BadRequestException('Rental is already completed.');
      }

      if (currentRental.startMileage !== null && returnRentalDto.endMileage < currentRental.startMileage) {
        throw new BadRequestException('End mileage cannot be less than start mileage.');
      }

      const rental = await tx.rental.update({
        where: { id },
        data: {
          status: 'completed',
          endMileage: returnRentalDto.endMileage,
        },
      });

      await tx.car.update({
        where: { id: rental.carId },
        data: {
          mileage: returnRentalDto.endMileage,
          status: returnRentalDto.carStatus,
        },
      });

      if (returnRentalDto.paymentAmount) {
        await tx.payment.create({
          data: {
            rentalId: id,
            amount: returnRentalDto.paymentAmount,
          },
        });
      }

      if (returnRentalDto.fineAmount) {
        await tx.fine.create({
          data: {
            rentalId: id,
            amount: returnRentalDto.fineAmount,
            description: returnRentalDto.fineDescription,
          },
        });
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
