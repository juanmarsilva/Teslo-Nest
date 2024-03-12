import { Controller, Post, Body, Get } from '@nestjs/common';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { Auth, GetUser } from './decorators';
import { User } from './entities/user.entity';
import { RawHeaders } from '../common/decorators';

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

    /**
     * The `loginUser` function in TypeScript takes a `loginUserDto` object as input and calls the
     * `logIn` method of the `authService`.
     * @param {LoginUserDto} loginUserDto - The `loginUserDto` parameter in the `loginUser` function is
     * of type `LoginUserDto`. It is being passed in the request body using the `@Body()` decorator,
     * which means that the data for this parameter is expected to be sent in the body of the HTTP
     * request. The
     * @returns The `loginUser` function is returning the result of calling the `logIn` method from the
     * `authService` with the `loginUserDto` object as an argument.
     */
    @Post('login')
    loginUser(@Body() loginUserDto: LoginUserDto) {
        return this.authService.logIn(loginUserDto);
    }

    /**
     * The function `checkAuthStatus` retrieves the authentication status of a user using the `GetUser`
     * decorator and the `authService`.
     * @param {User} user - The `checkAuthStatus` function takes a parameter `user` of type `User`
     * which is obtained using the `@GetUser()` decorator. This decorator is commonly used in NestJS to
     * extract the user object from the request. The function then calls the `checkAuthStatus` method
     * of the
     * @returns The `checkAuthStatus` method is being called with the `user` object obtained from the
     * `GetUser()` decorator. The method then calls the `checkAuthStatus` method of the `authService`
     * with the `user` object as an argument. The return value of the `checkAuthStatus` method of the
     * `authService` is then returned from the `checkAuthStatus` method
     */
    @Get('check-auth-status')
    @Auth()
    checkAuthStatus(@GetUser() user: User) {
        return this.authService.checkAuthStatus(user);
    }

    /**
     * The function `testingPrivateRoute` takes raw headers, a user object, and a user email as input
     * parameters and returns an object containing the user, user email, and raw headers.
     * @param rawHeaders - The `rawHeaders` parameter is an array of strings that contains the raw
     * headers of the HTTP request. These headers are sent by the client to provide additional
     * information about the request.
     * @param {User} user - The `user` parameter is of type `User` and is obtained using the
     * `@GetUser()` decorator. This decorator likely retrieves the user object associated with the
     * current request or session.
     * @param {string} userEmail - The `userEmail` parameter in the `testingPrivateRoute` function is a
     * string that is obtained using the `@GetUser('email')` decorator. This decorator is used to
     * extract the email property from the user object.
     * @returns {
     *     user: User,
     *     userEmail: string,
     *     rawHeaders: Array<string>
     * }
     */
    @Get('private')
    @Auth()
    testingPrivateRoute(
        @RawHeaders() rawHeaders: Array<string>,
        @GetUser() user: User,
        @GetUser('email') userEmail: string,
    ): { user: User; userEmail: string; rawHeaders: Array<string> } {
        return {
            user,
            userEmail,
            rawHeaders,
        };
    }
}
