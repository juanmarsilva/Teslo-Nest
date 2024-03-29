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
    @IsString()
    @MinLength(1)
    title: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @IsString({ each: true })
    @IsArray()
    sizes: Array<string>;

    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    tags?: Array<string>;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    images?: Array<string>;
}
