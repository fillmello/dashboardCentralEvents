import type { Request } from 'express';
import { Role } from 'src/common/enums/role.enum';

export interface JwtPayload {
  sub: number;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
