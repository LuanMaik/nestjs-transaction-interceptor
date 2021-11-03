import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TransactionParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.transaction) {
      throw Error(
        'O decorator TransactionParam depende do interceptor TransactionInterceptor',
      );
    }

    return request.transaction;
  },
);
