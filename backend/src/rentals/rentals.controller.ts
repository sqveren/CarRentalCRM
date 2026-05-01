import { Body, Controller, Delete, ForbiddenException, Get, Param, ParseIntPipe, Patch, Post, Req } from '@nestjs/common';
import { RequestWithUser } from '../auth/auth-user';
import { Roles } from '../auth/roles.decorator';
import { CreateRentalDto } from './dto/create-rental.dto';
import { ReturnRentalDto } from './dto/return-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';
import { RentalsService } from './rentals.service';

@Controller('rentals')
@Roles('admin', 'manager', 'operator')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Get()
  findAll() {
    return this.rentalsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rentalsService.findOne(id);
  }

  @Post()
  @Roles('admin', 'manager')
  create(@Body() createRentalDto: CreateRentalDto, @Req() request: RequestWithUser) {
    return this.rentalsService.create({
      ...createRentalDto,
      employeeId: request.user.role === 'manager' ? request.user.id : createRentalDto.employeeId,
    });
  }

  @Patch(':id/return')
  @Roles('admin', 'operator')
  returnRental(
    @Param('id', ParseIntPipe) id: number,
    @Body() returnRentalDto: ReturnRentalDto,
  ) {
    return this.rentalsService.returnRental(id, returnRentalDto);
  }

  @Patch(':id')
  @Roles('admin', 'manager', 'operator')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRentalDto: UpdateRentalDto,
    @Req() request: RequestWithUser,
  ) {
    if (request.user.role === 'operator') {
      const allowedKeys = ['status', 'endMileage'];
      const requestedKeys = Object.keys(updateRentalDto);
      const hasForbiddenChange = requestedKeys.some((key) => !allowedKeys.includes(key));

      if (hasForbiddenChange || updateRentalDto.status !== 'completed') {
        throw new ForbiddenException('Operators can only complete rentals and set end mileage.');
      }
    }

    return this.rentalsService.update(id, updateRentalDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rentalsService.remove(id);
  }
}
