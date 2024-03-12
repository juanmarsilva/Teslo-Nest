import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { ProductImage } from './';

@Entity({ name: 'products' })
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'text',
        unique: true,
    })
    title: string;

    @Column({
        type: 'float',
        default: 0,
    })
    price: number;

    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    @Column({
        type: 'text',
        unique: true,
    })
    slug: string;

    @Column({
        type: 'int',
        default: 0,
    })
    stock: number;

    @Column({
        type: 'text',
        array: true,
    })
    sizes: Array<string>;

    @Column('text')
    gender: string;

    @Column({
        type: 'text',
        array: true,
        default: [],
    })
    tags: Array<string>;

    @OneToMany(() => ProductImage, (productImage) => productImage.product, {
        cascade: true,
        eager: true,
    })
    images?: Array<ProductImage>;

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
