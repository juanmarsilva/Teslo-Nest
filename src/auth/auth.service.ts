import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {}

    /**
     * The function creates a new user, hashes the password, saves the user to the database, removes
     * the password from the returned user object, and generates a JWT token for the user.
     * @param {CreateUserDto} createUserDto - The `createUserDto` parameter in the `create` function
     * likely represents an object containing data for creating a new user. Based on the code snippet
     * provided, it seems to include properties such as `password` and other user data.
     * @returns The `create` function is returning an object that includes the user data without the
     * password field, and a token generated using the user's id with a JWT token.
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

            return {
                ...user,
                token: this.getJwtToken({ id: user.id }),
            };
        } catch (error) {
            this.handleDbErrors(error);
        }
    }

    /**
     * This function logs in a user by checking their credentials and generating a JWT token if valid.
     * @param {LoginUserDto} loginUserDto - The `loginUserDto` parameter is an object that contains the
     * user's email and password. It is used to authenticate a user during the login process.
     * @returns The `logIn` function is returning an object that includes the user's email, id, and a
     * JWT token. The password field is deleted from the user object before returning.
     */
    async logIn(loginUserDto: LoginUserDto) {
        const { password, email } = loginUserDto;

        const user = await this.userRepository.findOne({
            where: { email },
            select: { email: true, password: true, id: true },
        });

        if (!user)
            throw new UnauthorizedException('Not valid credentials (email)');

        if (!bcrypt.compareSync(password, user.password))
            throw new UnauthorizedException('Not valid credentials (password)');

        delete user.password;

        return {
            ...user,
            token: this.getJwtToken({ id: user.id }),
        };
    }

    /**
     * The function `getJwtToken` generates a JWT token using the provided payload.
     * @param {JwtPayload} jwtPayload - JwtPayload is an object that contains the payload data to be
     * encoded into a JSON Web Token (JWT). This payload typically includes information such as user
     * details, permissions, and any other relevant data that needs to be securely transmitted and
     * verified.
     * @returns A JWT token is being returned.
     */
    private getJwtToken(jwtPayload: JwtPayload) {
        const token = this.jwtService.sign(jwtPayload);
        return token;
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
