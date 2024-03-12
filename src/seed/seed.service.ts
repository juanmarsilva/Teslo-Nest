import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { User } from '../auth/entities';

@Injectable()
export class SeedService {
    constructor(
        private readonly productsService: ProductsService,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    /**
     * The `runSeed` function deletes tables, inserts admin user and new products, and returns a
     * message indicating successful execution.
     * @returns 'SEED EXECUTED'
     */
    async runSeed() {
        await this.deleteTables();

        const adminUser = await this.insertUsers();
        await this.insertNewProducts(adminUser);

        return 'SEED EXECUTED';
    }

    /**
     * The function inserts users from initial data into the database and returns the first user
     * inserted.
     * @returns The `insertUsers` function is returning the first user object from the `users` array
     * that was created and saved in the database.
     */
    private async insertUsers() {
        const seedUsers = initialData.users;

        const users: Array<User> = [];

        seedUsers.forEach((user) => {
            users.push(this.userRepository.create(user));
        });

        const dbUsers = await this.userRepository.save(seedUsers);

        return dbUsers[0];
    }

    /**
     * The function `deleteTables` deletes all products using the products service and then deletes all
     * records from the user table using the user repository.
     */
    private async deleteTables() {
        await this.productsService.deleteAllProducts();

        const queryBuilder = this.userRepository.createQueryBuilder();
        await queryBuilder.delete().where({}).execute();
    }

    /**
     * The function `insertNewProducts` asynchronously inserts new products into the database after
     * deleting all existing products.
     * @param {User} user - The `user` parameter in the `insertNewProducts` function is an object
     * representing a user. It is used to associate the products being inserted with a specific user,
     * likely for tracking or ownership purposes.
     * @returns The `insertNewProducts` function returns a boolean value `true` after inserting new
     * products into the database.
     */
    private async insertNewProducts(user: User) {
        await this.productsService.deleteAllProducts();

        const seedProducts = initialData.products;

        const insertPromises = [];

        seedProducts.forEach((product) => {
            insertPromises.push(this.productsService.create(product, user));
        });

        await Promise.all(insertPromises);

        return true;
    }
}
