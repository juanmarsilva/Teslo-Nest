import { SetMetadata } from '@nestjs/common';

import { ValidRoles } from '../interfaces';

export const META_ROLES = 'roles';

/**
 * The RoleProtected function in TypeScript sets metadata for valid roles.
 * @param args - The `args` parameter in the `RoleProtected` function is an array of `ValidRoles`. This
 * array contains the roles that are allowed to access the protected resource or endpoint.
 */
export const RoleProtected = (...args: Array<ValidRoles>) =>
    SetMetadata(META_ROLES, args);
