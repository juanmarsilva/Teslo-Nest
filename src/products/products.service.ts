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
import { User } from '../auth/entities';

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
     * The function creates a new product with associated images and saves it to the database.
     * @param {CreateProductDto} createProductDto - The `createProductDto` parameter seems to be an
     * object containing details for creating a product, such as its name, description, price, etc. It
     * also includes an optional array of images for the product.
     * @param {User} user - The `user` parameter in the `create` function represents the user who is
     * creating the product. It is of type `User`, which likely contains information about the user
     * such as their ID, name, email, etc. This user will be associated with the product being created
     * in the database.
     * @returns The `create` function is returning an object that includes the product details and
     * images. It spreads the `product` object along with the `images` array in the return statement.
     */
    async create(createProductDto: CreateProductDto, user: User) {
        try {
            const { images = [], ...productDetails } = createProductDto;

            const product = this.productRepository.create({
                ...productDetails,
                user,
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
     * This TypeScript function updates a product with the provided data, including handling images and
     * transactions.
     * @param {string} id - The `id` parameter is a string that represents the unique identifier of the
     * product that needs to be updated.
     * @param {UpdateProductDto} updateProductDto - The `updateProductDto` parameter is an object
     * containing the data that needs to be updated for a product. It likely includes properties such
     * as name, description, price, etc. In the `update` method, the code is destructuring this object
     * to separate the `images` property from the rest
     * @param {User} user - The `user` parameter in the `update` method represents the user who is
     * updating the product. This user is used to associate the product with the user who performed the
     * update operation.
     * @returns The `update` method is returning the updated `Product` entity after the update
     * operation is completed.
     */
    async update(id: string, updateProductDto: UpdateProductDto, user: User) {
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

            product.user = user;
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
        const product = await this.findOne(id);
        await this.productRepository.remove(product);
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

    /**
     * The function deletes all products from the database using a query builder.
     * @returns the result of the delete operation.
     */
    async deleteAllProducts() {
        const query = this.productRepository.createQueryBuilder('product');

        try {
            return await query.delete().where({}).execute();
        } catch (error) {
            return this.handleDBExceptions(error);
        }
    }
}
