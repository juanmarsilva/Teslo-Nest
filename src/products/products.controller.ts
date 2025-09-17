import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseUUIDPipe,
    Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities';

import { Auth, GetUser } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { User } from '../auth/entities';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    /**
     * The function creates a new product using the provided data and user information.
     * @param {CreateProductDto} createProductDto - The `createProductDto` parameter is of type
     * `CreateProductDto` and is used to pass the data necessary to create a new product. It likely
     * contains information such as the product's name, description, price, and any other relevant
     * details needed to create a product in the system.
     * @param {User} user - The `user` parameter in the `create` function is likely a decorator that
     * retrieves the user object from the request. It is commonly used for authentication and
     * authorization purposes in web applications. The `@GetUser()` decorator is a custom decorator or
     * middleware that extracts the user information from the request object.
     * @returns The `create` method is returning the result of calling the `create` method from the
     * `productsService` with the `createProductDto` and `user` parameters.
     */
    @Post()
    @Auth(ValidRoles.ADMIN, ValidRoles.SUPER_ADMIN)
    @ApiResponse({
        status: 201,
        description: 'Product was created',
        type: Product,
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 403, description: 'Forbidden. Token related' })
    create(@Body() createProductDto: CreateProductDto, @GetUser() user: User) {
        return this.productsService.create(createProductDto, user);
    }

    /**
     * The `findAll` function takes a `paginationDto` object as a query parameter and returns the
     * result of calling the `findAll` method of the `productsService` service with the `paginationDto`
     * object.
     * @param {PaginationDto} paginationDto - PaginationDto is a data transfer object (DTO) that
     * contains information related to pagination, such as page number, page size, sorting options, and
     * any other parameters needed to retrieve a paginated list of items. In this case, the `findAll`
     * method is using the `paginationDto` to fetch
     * @returns The `findAll` method is returning the result of calling the `findAll` method of the
     * `productsService` with the `paginationDto` parameter.
     */
    @Get()
    findAll(@Query() paginationDto: PaginationDto) {
        return this.productsService.findAll(paginationDto);
    }

    /**
     * The `findOne` function takes a parameter and returns the result of calling the `findOne` method
     * from the `productsService`.
     * @param {string} param - The `findOne` method takes a parameter named `param` of type string.
     * This method calls the `findOne` method of the `productsService` service and passes the `param`
     * value to it.
     * @returns The `findOne` method is returning the result of calling the `findOne` method from the
     * `productsService` service with the `param` parameter passed to it.
     */
    @Get(':param')
    findOne(@Param('param') param: string) {
        return this.productsService.findOne(param);
    }

    /**
     * The function `update` takes in a product ID, an update product DTO, and the user, and calls the
     * `update` method of the products service with these parameters.
     * @param {string} id - The `id` parameter is a string representing the unique identifier of the
     * product that needs to be updated. It is being validated using the `ParseUUIDPipe` to ensure that
     * it is a valid UUID format.
     * @param {UpdateProductDto} updateProductDto - The `updateProductDto` parameter is an object that
     * contains the data needed to update a product. It likely includes properties such as `name`,
     * `description`, `price`, etc., depending on what information can be updated for a product in your
     * application. This object is passed in the request body when
     * @param {User} user - The `user` parameter in the `update` method is of type `User` and is
     * obtained using a custom decorator `@GetUser()`. This decorator is likely used to extract the
     * user information from the request context or token and pass it to the method for further
     * processing.
     * @returns The `update` method from the `productsService` is being called with the `id`,
     * `updateProductDto`, and `user` parameters, and the result of this method call is being returned.
     */
    @Patch(':id')
    @Auth(ValidRoles.ADMIN, ValidRoles.SUPER_ADMIN)
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateProductDto: UpdateProductDto,
        @GetUser() user: User,
    ) {
        return this.productsService.update(id, updateProductDto, user);
    }

    /**
     * The function removes a product with the specified ID from the products service.
     * @param {string} id - The `id` parameter is of type `string` and is decorated with `@Param('id',
     * ParseUUIDPipe)`, which means it is expected to be a UUID string. This parameter is used to
     * identify the specific product that needs to be removed from the products service.
     * @returns The `remove` method from the `productsService` is being called with the `id` parameter
     * passed to it, and the result of this method call is being returned.
     */
    @Delete(':id')
    @Auth(ValidRoles.ADMIN, ValidRoles.SUPER_ADMIN)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.productsService.remove(id);
    }
}
