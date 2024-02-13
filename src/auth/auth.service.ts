import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    /**
     * The create function creates a new user, hashes the password, saves the user to the database, and
     * returns the user object without the password.
     * @param {CreateUserDto} createUserDto - The `createUserDto` is an object that contains the data
     * needed to create a new user. It typically includes properties such as `username`, `email`, and
     * `password`.
     * @returns The user object is being returned.
     */
    async create(createUserDto: CreateUserDto) {
        try {
            const { password, ...userData } = createUserDto;

            const user = this.userRepository.create({
                ...userData,
                password: bcrypt.hashSync(password, 10),
            });

            await this.userRepository.save(user);

            delete user.password;

            // todo: retornar el JWT de acceso.

            return user;
        } catch (error) {
            this.handleDbErrors(error);
        }
    }

    async logIn(loginUserDto: LoginUserDto) {
        const { password, email } = loginUserDto;

        const user = await this.userRepository.findOne({
            where: { email },
            select: { email: true, password: true },
        });

        if (!user)
            throw new UnauthorizedException('Not valid credentials (email)');

        if (!bcrypt.compareSync(password, user.password))
            throw new UnauthorizedException('Not valid credentials (password)');

        // todo: retornar el JWT de acceso.

        return user;
    }

    /**
     * The function handles database errors by checking the error code and throwing appropriate
     * exceptions.
     * @param {any} error - The error parameter is of type "any", which means it can be any type of
     * error object.
     */
    private handleDbErrors(error: any): never {
        if (error.code === '23505') throw new BadRequestException(error.detail);

        console.log(error);

        throw new InternalServerErrorException('Please check server logs');
    }
}
