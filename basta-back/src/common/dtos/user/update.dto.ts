import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './register.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['cpf', 'password'] as const),
) {}
