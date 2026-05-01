import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RequestWithUser, UserRole } from './auth-user';
import { ROLES_KEY } from './roles.decorator';

type HeaderValue = string | string[] | undefined;

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser & { headers: Record<string, HeaderValue> }>();
    const authorization = request.headers.authorization;
    const token = this.getBearerToken(Array.isArray(authorization) ? authorization[0] : authorization);
    const employeeId = this.verifyToken(token);

    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      throw new UnauthorizedException('Employee session is required.');
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { role: true },
    });

    if (!employee) {
      throw new UnauthorizedException('Employee session is invalid.');
    }

    const role = employee.role.name as UserRole;

    if (!requiredRoles.includes(role)) {
      throw new ForbiddenException('This role cannot access this resource.');
    }

    request.user = {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      login: employee.login,
      role,
    };

    return true;
  }

  private getBearerToken(authorization: string | undefined): string {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Employee session is required.');
    }

    return authorization.slice('Bearer '.length);
  }

  private verifyToken(token: string): number {
    const [employeeId, signature] = token.split('.');

    if (!employeeId || !signature) {
      throw new UnauthorizedException('Employee session is invalid.');
    }

    const secret = this.configService.get<string>('AUTH_SECRET', 'local-dev-secret');
    const expectedSignature = createHmac('sha256', secret).update(employeeId).digest('hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const actualBuffer = Buffer.from(signature, 'hex');

    if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
      throw new UnauthorizedException('Employee session is invalid.');
    }

    return Number(employeeId);
  }
}
