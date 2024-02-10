import { existsSync } from 'fs';
import { join } from 'path';

import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
    /**
     * The function returns the path of a static product image based on the provided image name, and
     * throws an error if the image does not exist.
     * @param {string} imageName - The imageName parameter is a string that represents the name of the
     * product image file.
     * @returns the path of the static product image with the given imageName.
     */
    getStaticProductImage(imageName: string) {
        const path = join(__dirname, '../../static/products', imageName);

        if (!existsSync(path))
            throw new BadRequestException(
                `No product found with image ${imageName}  `,
            );

        return path;
    }
}
