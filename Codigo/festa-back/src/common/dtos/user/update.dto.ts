import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './register.dto';

// Self-service profile update: name/email only, never password or role here.
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {}
