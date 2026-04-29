import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.client.findUniqueOrThrow({
      where: { id },
    });
  }

  async create(createClientDto: CreateClientDto) {
    return this.prisma.client.create({
      data: {
        firstName: createClientDto.firstName,
        lastName: createClientDto.lastName,
        phone: createClientDto.phone,
        email: createClientDto.email,
        documentNumber: createClientDto.documentNumber,
      },
    });
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    return this.prisma.client.update({
      where: { id },
      data: {
        firstName: updateClientDto.firstName,
        lastName: updateClientDto.lastName,
        phone: updateClientDto.phone,
        email: updateClientDto.email,
        documentNumber: updateClientDto.documentNumber,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.client.delete({
      where: { id },
    });
  }
}
