import {
    Injectable,
    InternalServerErrorException,
    Logger,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { CreateProductDto } from './dto/create-product.dto';
// import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

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

    findAll(paginationDto: PaginationDto) {
        const { limit = 10, offset = 0 } = paginationDto;

        return this.productRepository.find({
            take: limit,
            skip: offset,
            // todo: relaciones
        });
    }

    async findOne(param: string) {
        let product: Product;

        if (isUUID(param)) {
            product = await this.productRepository.findOneBy({ id: param });
        } else {
            const queryBuilder = this.productRepository.createQueryBuilder();

            product = await queryBuilder
                .where('UPPER(title) =:title or slug =:slug', {
                    title: param.toUpperCase(),
                    slug: param.toLowerCase(),
                })
                .getOne();
        }

        if (!product)
            throw new NotFoundException(`Product with ${param} not found `);

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
