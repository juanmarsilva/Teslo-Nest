import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        configService: ConfigService,
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    /**
     * The function validates a JWT payload by checking if the corresponding user exists and is active.
     * @param {JwtPayload}  - - `validate` is the name of the function.
     * @returns a Promise that resolves to a User object.
     */
    async validate({ email }: JwtPayload): Promise<User> {
        const user = await this.userRepository.findOneBy({ email });

        if (!user) throw new UnauthorizedException('Not valid auth Token');

        if (!user.isActive)
            throw new UnauthorizedException(
                'User is inactive, talk with the admin',
            );

        return user;
    }
}
