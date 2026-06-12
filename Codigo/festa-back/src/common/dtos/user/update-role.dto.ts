import { IsEnum } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

// Gestor reassigns a user's privilege level.
export class UpdateRoleDto {
  @IsEnum(Role)
  role: Role;
}
