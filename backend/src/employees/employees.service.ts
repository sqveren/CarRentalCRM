import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.employee.findMany({
      include: {
        role: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.employee.findUniqueOrThrow({
      where: { id },
      include: {
        role: true,
      },
    });
  }

  async create(createEmployeeDto: CreateEmployeeDto) {
    return this.prisma.employee.create({
      data: {
        firstName: createEmployeeDto.firstName,
        lastName: createEmployeeDto.lastName,
        roleId: createEmployeeDto.roleId,
        login: createEmployeeDto.login,
        passwordHash: createEmployeeDto.passwordHash,
      },
      include: {
        role: true,
      },
    });
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    return this.prisma.employee.update({
      where: { id },
      data: {
        firstName: updateEmployeeDto.firstName,
        lastName: updateEmployeeDto.lastName,
        roleId: updateEmployeeDto.roleId,
        login: updateEmployeeDto.login,
        passwordHash: updateEmployeeDto.passwordHash,
      },
      include: {
        role: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.employee.delete({
      where: { id },
    });
  }
}
