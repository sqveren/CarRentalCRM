import { Module } from '@nestjs/common';
import { CarCategoriesModule } from './car-categories/car-categories.module';
import { ConfigModule } from '@nestjs/config';
import { CarsModule } from './cars/cars.module';
import { ClientsModule } from './clients/clients.module';
import { EmployeesModule } from './employees/employees.module';
import { FinesModule } from './fines/fines.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { RentalsModule } from './rentals/rentals.module';
import { RolesModule } from './roles/roles.module';
import { ServicesModule } from './services/services.module';
import { validateEnvironment } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    PrismaModule,
    RolesModule,
    EmployeesModule,
    CarCategoriesModule,
    CarsModule,
    ClientsModule,
    RentalsModule,
    PaymentsModule,
    ServicesModule,
    FinesModule,
  ],
})
export class AppModule {}
