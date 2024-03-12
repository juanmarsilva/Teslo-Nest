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

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { Auth, GetUser } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { User } from '../auth/entities';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    @Auth(ValidRoles.ADMIN, ValidRoles.SUPER_ADMIN)
    create(@Body() createProductDto: CreateProductDto, @GetUser() user: User) {
        return this.productsService.create(createProductDto, user);
    }

    @Get()
    findAll(@Query() paginationDto: PaginationDto) {
        return this.productsService.findAll(paginationDto);
    }

    @Get(':param')
    findOne(@Param('param') param: string) {
        return this.productsService.findOne(param);
    }

    @Patch(':id')
    @Auth(ValidRoles.ADMIN, ValidRoles.SUPER_ADMIN)
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateProductDto: UpdateProductDto,
        @GetUser() user: User,
    ) {
        return this.productsService.update(id, updateProductDto, user);
    }

    @Delete(':id')
    @Auth(ValidRoles.ADMIN, ValidRoles.SUPER_ADMIN)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.productsService.remove(id);
    }
}
