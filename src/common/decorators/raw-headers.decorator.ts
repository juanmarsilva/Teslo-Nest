import {
    ExecutionContext,
    InternalServerErrorException,
    createParamDecorator,
} from '@nestjs/common';

export const RawHeaders = createParamDecorator((_, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    if (!req) throw new InternalServerErrorException();
    return req.rawHeaders;
});
