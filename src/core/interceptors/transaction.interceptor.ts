import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { Connection } from 'typeorm';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private connection: Connection) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest();

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    req.transaction = queryRunner.manager;

    return next.handle().pipe(
      tap(async () => {
        await queryRunner.commitTransaction();
        await queryRunner.release();
      }),
      catchError(async (err) => {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        return throwError(err);
      }),
    );
  }
}
