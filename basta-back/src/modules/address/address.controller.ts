import {
  Body,
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from 'src/common/dtos/address/create.dto';
import { UpdateAddressDto } from 'src/common/dtos/address/update.dto';
import type { AuthenticatedRequest } from 'src/auth/jwt-payload.type';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Roles(Role.USER)
@Controller('address')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Get()
  getAll(@Request() req: AuthenticatedRequest) {
    return this.addressService.getAll(req.user.sub);
  }

  @Get(':id')
  getOne(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addressService.getOne(req.user.sub, id);
  }

  @Post()
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateAddressDto) {
    return this.addressService.create(req.user.sub, dto);
  }

  @Put(':id')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.update(req.user.sub, id, dto);
  }

  @Delete(':id')
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addressService.remove(req.user.sub, id);
  }
}
