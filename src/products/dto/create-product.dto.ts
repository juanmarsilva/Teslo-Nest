import { ApiProperty } from '@nestjs/swagger';

import {
    IsString,
    MinLength,
    IsNumber,
    IsPositive,
    IsOptional,
    IsInt,
    IsArray,
    IsIn,
} from 'class-validator';

export class CreateProductDto {
    @ApiProperty({
        description: 'Product Title',
        uniqueItems: true,
        nullable: false,
        minLength: 1,
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty({
        description: 'Product Price',
        minimum: 0,
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @ApiProperty({
        description: 'Product Description',
        minLength: 1,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'Product Slug - for SEO',
        uniqueItems: true,
        minLength: 1,
    })
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty({
        description: 'Product Stock',
        default: 0,
        minimum: 0,
    })
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @ApiProperty({
        description: 'Product Sizes',
        example: ['S', 'XL', 'M'],
    })
    @IsString({ each: true })
    @IsArray()
    sizes: Array<string>;

    @ApiProperty({
        description: 'Product Gender',
        nullable: false,
        example: 'men',
    })
    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;

    @ApiProperty({
        description: 'Product Tags',
        example: ['shirt'],
    })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    tags?: Array<string>;

    @ApiProperty({
        description: 'Product Images',
        example: '8764813-00-A_0_2000.jpg',
    })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    images?: Array<string>;
}
