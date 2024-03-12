import { Injectable } from '@nestjs/common';

import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
    constructor(private readonly productsService: ProductsService) {}

    /**
     * The function "runSeed" inserts new products and returns a message indicating that the seed has
     * been executed.
     * @returns the string 'SEED EXECUTED'.
     */
    async runSeed() {
        await this.insertNewProducts();
        return 'SEED EXECUTED';
    }

    /**
     * The function inserts new products into the database by deleting all existing products, creating
     * new products, and returning true when finished.
     * @returns a boolean value of true.
     */
    private async insertNewProducts() {
        await this.productsService.deleteAllProducts();

        const seedProducts = initialData.products;

        const insertPromises = [];

        seedProducts.forEach((product) => {
            insertPromises.push(this.productsService.create(product));
        });

        await Promise.all(insertPromises);

        return true;
    }
}
