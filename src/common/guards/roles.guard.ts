import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { Role } from '../../generated/prisma/enums';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface AuthenticatedRequest {
  user?: {
    role?: Role;
    roles?: Role[];
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user) {
      return false;
    }

    const userRoles = user.roles ?? (user.role ? [user.role] : []);
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
