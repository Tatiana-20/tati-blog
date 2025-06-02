import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/common/enum/roles.enum';

export const ROLES_KEY = 'roles';
export const Roles = (role: Role | Role[]) => SetMetadata(ROLES_KEY, role);
