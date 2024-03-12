import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ValidRoles } from '../interfaces';
import { RoleProtected } from './';
import { UserRoleGuard } from '../guards';

export const Auth = (...roles: Array<ValidRoles>) =>
    applyDecorators(
        RoleProtected(...roles),
        UseGuards(AuthGuard(), UserRoleGuard),
    );
