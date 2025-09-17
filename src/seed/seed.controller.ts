import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SeedService } from './seed.service';

// import { Auth } from '../auth/decorators';
// import { ValidRoles } from '../auth/interfaces';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
    constructor(private readonly seedService: SeedService) {}

    /**
     * The `executeSeed` function is an asynchronous function that calls the `runSeed` method of the
     * `seedService`.
     * @returns The `executeSeed` function is returning a promise that resolves to the result of
     * `this.seedService.runSeed()` function call.
     */
    @Get()
    // @Auth(ValidRoles.SUPER_ADMIN)
    async executeSeed() {
        return this.seedService.runSeed();
    }
}
