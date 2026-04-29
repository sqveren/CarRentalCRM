import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.payment.findMany({
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
    return this.prisma.payment.findUniqueOrThrow({
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

  async create(createPaymentDto: CreatePaymentDto) {
    return this.prisma.payment.create({
      data: {
        rentalId: createPaymentDto.rentalId,
        amount: createPaymentDto.amount,
        paymentDate: createPaymentDto.paymentDate ? new Date(createPaymentDto.paymentDate) : undefined,
      },
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

  async remove(id: number) {
    return this.prisma.payment.delete({
      where: { id },
    });
  }
}
