import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    // If no roles are specified, allow access
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('No user found');
    }

    // Check if user has any of the required roles (case-insensitive)
    const userRole = user.role?.toUpperCase() || '';
    const hasRole = () => roles.some(role => role.toUpperCase() === userRole);

    if (!hasRole()) {
      throw new ForbiddenException(
        `User role '${user.role}' is not allowed. Required roles: ${roles.join(', ')}`,
      );
    }

    return true;
  }
}
