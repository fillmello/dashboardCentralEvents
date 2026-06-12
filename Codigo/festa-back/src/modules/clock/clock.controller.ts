import { Controller, Get } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

// RF-18: the official synchronized clock. Clients sync to server time and apply
// the measured offset locally so every screen shows the same time.
@Roles(Role.GESTAO, Role.PAINEL, Role.INDIVIDUAL)
@Controller('clock')
export class ClockController {
  @Get()
  now() {
    return { now: new Date().toISOString() };
  }
}
