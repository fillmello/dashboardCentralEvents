import { PartialType } from '@nestjs/mapped-types';
import { CreateAddressDto } from './create.dto';

export class UpdateAddressDto extends PartialType(CreateAddressDto) {}
