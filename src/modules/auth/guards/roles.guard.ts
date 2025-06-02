import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/common/enum/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    if (user.rol === Role.ADMIN) return true;

    return roles.includes(user.rol);
  }
}
