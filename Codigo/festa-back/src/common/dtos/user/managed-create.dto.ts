import { IsEnum } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';
import { CreateUserDto } from './register.dto';

// Gestor-only account creation with an explicit role (e.g. another Gestor).
export class ManagedCreateUserDto extends CreateUserDto {
  @IsEnum(Role)
  role: Role;
}
