import { Controller, Post, Body } from '@nestjs/common';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /**
     * The create function takes a CreateUserDto object as a parameter and calls the create method of
     * the authService to create a new user.
     * @param {CreateUserDto} createUserDto - The `createUserDto` parameter is of type `CreateUserDto`.
     * It is an object that contains the data needed to create a new user.
     * @returns The `create` method is returning the result of the `this.authService.create` method,
     * which is likely the result of creating a new user based on the `createUserDto` object.
     */
    @Post('register')
    create(@Body() createUserDto: CreateUserDto) {
        return this.authService.create(createUserDto);
    }

    @Post('login')
    loginUser(@Body() loginUserDto: LoginUserDto) {
        return this.authService.logIn(loginUserDto);
    }
}
