import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        employees: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.role.findUniqueOrThrow({
      where: { id },
      include: {
        employees: true,
      },
    });
  }

  async create(createRoleDto: CreateRoleDto) {
    return this.prisma.role.create({
      data: {
        name: createRoleDto.name,
      },
    });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    return this.prisma.role.update({
      where: { id },
      data: {
        name: updateRoleDto.name,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.role.delete({
      where: { id },
    });
  }
}
