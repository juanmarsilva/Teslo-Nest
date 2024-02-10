import { Response } from 'express';
import {
    BadRequestException,
    Controller,
    Get,
    Param,
    Post,
    Res,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
    constructor(
        private readonly filesService: FilesService,
        private readonly configService: ConfigService,
    ) {}

    /**
     * The function `findProductImage` retrieves and sends a product image file to the client.
     * @param {Response} res - The `res` parameter is the response object that is used to send the file
     * back to the client. It is an instance of the `Response` class, which is typically provided by a
     * web framework or library.
     * @param {string} imageName - The `imageName` parameter is a string that represents the name of
     * the image file that you want to retrieve.
     */
    @Get('product/:imageName')
    findProductImage(
        @Res() res: Response,
        @Param('imageName') imageName: string,
    ) {
        const path = this.filesService.getStaticProductImage(imageName);
        res.sendFile(path);
    }

    /**
     * The function uploads a product image file and returns the secure URL of the uploaded file.
     * @param file - The `file` parameter is of type `Express.Multer.File`. It represents the uploaded
     * file and contains information about the file, such as its name, size, and mimetype.
     * @returns an object with a property "secureUrl" which contains the URL of the uploaded product
     * image.
     */
    @Post('product')
    @UseInterceptors(
        FileInterceptor('file', {
            fileFilter: fileFilter,
            // limits: { fileSize: 1000 }
            storage: diskStorage({
                destination: './static/products',
                filename: fileNamer,
            }),
        }),
    )
    uploadProductImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException(
                'Make sure that the file is an image',
            );
        }

        const secureUrl = `${this.configService.get(
            'HOST_API',
        )}/files/product/${file.filename}`;

        return {
            secureUrl,
        };
    }
}
