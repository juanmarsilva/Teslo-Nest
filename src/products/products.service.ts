import {
    Injectable,
    InternalServerErrorException,
    Logger,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
    private readonly logger = new Logger('products-service');

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) {}

    async create(createProductDto: CreateProductDto) {
        try {
            const product = this.productRepository.create(createProductDto);

            await this.productRepository.save(product);

            return product;
        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

    //TODO:PAGINAR
    findAll() {
        return this.productRepository.find({});
    }

    async findOne(id: string) {
        const product = await this.productRepository.findOneBy({ id });

        if (!product)
            throw new NotFoundException(`Product with id: ${id} not found `);

        return product;
    }

    // update(id: string, updateProductDto: UpdateProductDto) {
    //     return '';
    // }

    async remove(id: string) {
        try {
            const product = await this.findOne(id);

            await this.productRepository.remove(product);
        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

    private handleDBExceptions(error: any) {
        if (error.code === '23505') {
            throw new BadRequestException(error.detail);
        }
        this.logger.error(error);
        throw new InternalServerErrorException(
            'Unexpected error, checked server logs',
        );
    }
}
