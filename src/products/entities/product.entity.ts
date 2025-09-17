import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { ProductImage } from './';
import { User } from '../../auth/entities';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'products' })
export class Product {
    @ApiProperty({
        example: '0614e8bd-492f-4e4e-8927-adc24402bac4',
        description: 'Product ID',
        uniqueItems: true,
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'Teslo T-shirt',
        description: 'Product Title',
        uniqueItems: true,
    })
    @Column({
        type: 'text',
        unique: true,
    })
    title: string;

    @ApiProperty({
        example: 0,
        description: 'Product price',
    })
    @Column({
        type: 'float',
        default: 0,
    })
    price: number;

    @ApiProperty({
        example: 'Cupidatat cillum irure qui mollit.',
        description: 'Product description',
        default: null,
    })
    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    @ApiProperty({
        example: 'men_3d_wordmark_long_sleeve_tee',
        description: 'Product Slug - for SEO',
        uniqueItems: true,
    })
    @Column({
        type: 'text',
        unique: true,
    })
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'Stock of the each product',
        default: 0,
    })
    @Column({
        type: 'int',
        default: 0,
    })
    stock: number;

    @ApiProperty({
        example: ['M', 'XL', 'XXL'],
        description: 'Product sizes',
    })
    @Column({
        type: 'text',
        array: true,
    })
    sizes: Array<string>;

    @ApiProperty({
        example: 'women',
        description: 'Product gender',
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example: ['shirt'],
        description: 'Product tags',
    })
    @Column({
        type: 'text',
        array: true,
        default: [],
    })
    tags: Array<string>;

    @ApiProperty({
        example: {
            id: 1163,
            url: '8764813-00-A_0_2000.jpg',
        },
        description: 'Product Images',
    })
    @OneToMany(() => ProductImage, (productImage) => productImage.product, {
        cascade: true,
        eager: true,
    })
    images?: Array<ProductImage>;

    @ApiProperty({
        example: {
            id: '0ea5cf9c-e356-487d-9126-81308aa4862b',
            email: 'test1@google.com',
            fullName: 'Test One',
            isActive: true,
            roles: ['SUPER_ADMIN'],
        },
        description: 'Users',
    })
    @ManyToOne(() => User, (user) => user.product, { eager: true })
    user: User;

    /*
     * The `@BeforeInsert()` decorator is used in TypeORM to specify a method that should be executed
     * before inserting a new record into the database. In this case, the `checkSlugInsert()` method is
     * executed before inserting a new `Product` entity.
     */
    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title;
        }

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '-')
            .replaceAll("'", '')
            .replaceAll('´', '');
    }

    /*
     * The `@BeforeUpdate()` decorator is used in TypeORM to specify a method that should be executed
     * before updating an existing record in the database. In this case, the `checkSlugUpdate()` method
     * is executed before updating a `Product` entity.
     */
    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '-')
            .replaceAll("'", '')
            .replaceAll('´', '');
    }
}
