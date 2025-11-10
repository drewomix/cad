import { SetMetadata } from '@nestjs/common';
import type { Role } from '@cad/shared';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
