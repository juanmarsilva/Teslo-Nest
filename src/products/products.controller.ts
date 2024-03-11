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

import { Auth } from '../auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    @Auth(ValidRoles.ADMIN, ValidRoles.SUPER_ADMIN)
    create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
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
    ) {
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    @Auth(ValidRoles.ADMIN, ValidRoles.SUPER_ADMIN)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.productsService.remove(id);
    }
}
