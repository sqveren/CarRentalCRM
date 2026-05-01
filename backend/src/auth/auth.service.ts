import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { login: loginDto.login },
      include: { role: true },
    });

    if (!employee || employee.passwordHash !== loginDto.password) {
      throw new UnauthorizedException('Invalid login or password.');
    }

    return this.toSession(employee);
  }

  async register(registerDto: RegisterDto) {
    const role = await this.prisma.role.findUniqueOrThrow({
      where: { name: registerDto.role },
    });

    const employee = await this.prisma.employee.create({
      data: {
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        login: registerDto.login,
        passwordHash: registerDto.password,
        roleId: role.id,
      },
      include: { role: true },
    });

    return this.toSession(employee);
  }

  private toSession(employee: {
    id: number;
    firstName: string;
    lastName: string;
    login: string;
    role: { name: string };
  }) {
    const employeeId = String(employee.id);

    return {
      token: this.signEmployeeId(employeeId),
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        login: employee.login,
        role: employee.role.name,
      },
    };
  }

  private signEmployeeId(employeeId: string): string {
    const secret = this.configService.get<string>('AUTH_SECRET', 'local-dev-secret');
    const signature = createHmac('sha256', secret).update(employeeId).digest('hex');

    return `${employeeId}.${signature}`;
  }
}
