import {
    Injectable,
    InternalServerErrorException,
    Logger,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Injectable()
export class ProductsService {
    private readonly logger = new Logger('products-service');

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,

        @InjectRepository(ProductImage)
        private readonly productImageRepository: Repository<ProductImage>,

        private readonly dataSource: DataSource,
    ) {}

    /**
     * The `create` function creates a new product with the given details and saves it to the database,
     * including any associated images.
     * @param {CreateProductDto} createProductDto - The `createProductDto` is an object that contains
     * the details of the product to be created. It may have the following properties:
     * @returns an object that contains the product details and the images.
     */
    async create(createProductDto: CreateProductDto) {
        try {
            const { images = [], ...productDetails } = createProductDto;

            const product = this.productRepository.create({
                ...productDetails,
                images: images.map((url) =>
                    this.productImageRepository.create({ url }),
                ),
            });

            await this.productRepository.save(product);

            return { ...product, images };
        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

    /**
     * The `findAll` function retrieves a list of products with pagination and includes their
     * associated images.
     * @param {PaginationDto} paginationDto - The `paginationDto` is an object that contains the
     * pagination parameters for the `findAll` method. It has two properties:
     * @returns a list of products.
     */
    async findAll(paginationDto: PaginationDto) {
        const { limit = 10, offset = 0 } = paginationDto;

        const products = await this.productRepository.find({
            take: limit,
            skip: offset,
            relations: {
                images: true,
            },
        });

        return products;
    }

    /**
     * The `findOne` function retrieves a product from the database based on a given parameter, either
     * by ID or by title/slug.
     * @param {string} param - The parameter `param` is a string that represents either the ID of a
     * product or the title/slug of a product.
     * @returns a `Product` object.
     */
    async findOne(param: string) {
        let product: Product;

        if (isUUID(param)) {
            product = await this.productRepository.findOneBy({ id: param });
        } else {
            const queryBuilder =
                this.productRepository.createQueryBuilder('product');

            product = await queryBuilder
                .where('UPPER(title) =:title or slug =:slug', {
                    title: param.toUpperCase(),
                    slug: param.toLowerCase(),
                })
                .leftJoinAndSelect('product.images', 'prodImages')
                .getOne();
        }

        if (!product)
            throw new NotFoundException(`Product with ${param} not found `);

        return product;
    }

    /**
     * The function updates a product in the database, including its images, using a transaction to
     * ensure data consistency.
     * @param {string} id - The id parameter is a string that represents the unique identifier of the
     * product that needs to be updated.
     * @param {UpdateProductDto} updateProductDto - The `updateProductDto` parameter is an object that
     * contains the updated information for a product. It typically includes properties such as the
     * product's name, description, price, and any other fields that can be updated.
     * @returns the updated product.
     */
    async update(id: string, updateProductDto: UpdateProductDto) {
        const { images, ...toUpdate } = updateProductDto;

        const product: Product = await this.productRepository.preload({
            id,
            ...toUpdate,
        });

        if (!product)
            throw new NotFoundException(`Product with id: ${id} not found`);

        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {
            if (images) {
                await queryRunner.manager.delete(ProductImage, {
                    product: { id },
                });

                product.images = images.map((url) =>
                    this.productImageRepository.create({ url }),
                );
            } else {
                product.images = await this.productImageRepository.findBy({
                    product: { id },
                });
            }

            await queryRunner.manager.save(product);

            await queryRunner.commitTransaction();

            await queryRunner.release();

            return product;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();

            this.handleDBExceptions(error);
        }
    }

    /**
     * The `remove` function asynchronously removes a product from the database using its ID.
     * @param {string} id - The `id` parameter is a string that represents the unique identifier of the
     * product that needs to be removed.
     */
    async remove(id: string) {
        try {
            const product = await this.findOne(id);

            await this.productRepository.remove(product);
        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

    /**
     * The function handles exceptions that occur during database operations and throws appropriate
     * error messages.
     * @param {any} error - The error parameter is of type "any", which means it can be any type of
     * error object.
     */
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
