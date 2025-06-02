import { applyDecorators, UseGuards } from '@nestjs/common';
import { Role } from 'src/common/enum/roles.enum';
import { Roles } from './roles.decorator';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

export function Auth(role?: Role | Role[]) {
  return applyDecorators(
    Roles(role),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
  );
}
