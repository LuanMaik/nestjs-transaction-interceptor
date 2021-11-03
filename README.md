
# NestJs - DB Transaction using Interceptor

This repository shows how to implement Database Transactions using Interceptor in NestJs framework with TypeORM.

The implementation is based in this article: https://dev.to/teamhive/creating-a-transaction-interceptor-using-nest-js-2inb

The intent of this repository is to show a way to handle transactions with TypeORM, allowing us to create easier tests.

---

## Example usage
```
@Post()
@UseInterceptors(TransactionInterceptor) // Create a Transaction operation
async createOrder(
    @TransactionParam() entityManager: EntityManager, // Get the transactional EntityManager created by TransactionInterceptor above
    @Body() orderDto: CreateOrderRequestDto,
): Promise<Order> {
    return await this.orderService.createOrder(entityManager, orderDto);
}
```


## Running this example

The `database.sql` file has the database structure necessery to run this example.

The configuration of database connection is set in `src/app.module.ts`.

Installing the dependencies:
```bash
  npm install
```
Running the application:

```bash
  npm run start:dev
```


Making a request using Javascript (run in your browser console and check the console application):

**ATTENTION:** to create a real case, the OrderRepository is configured to throw exception randomly 
during the Order creation, allowing us to check the consistency during successful or error operation.
```js
var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
  "date":"2021-11-03",
  "description":"Testing transaction",
  "items":[
    { "name": "T-Shirt", "quantity": 1 }
  ]
});

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

fetch("http://localhost:3000/v1/order", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
```


## How it works

This implementation uses a Interceptor class called TransactionInterceptor to start the transaction and inject the Entity Manager in Request object.

```typescript
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
    
    req.transaction = queryRunner.manager; // <-- inject the transactional entity manager in request to be retrieve by the TransactionParam decorator

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
```

Then using a decorator called TransactionParam, we can retrieve the transactional entity manager to use in our controller:

```typescript
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
```

---

## Using in controller

```typescript
@Controller('/v1/order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    @InjectEntityManager() private readonly entityManager: EntityManager, // manager to use in non transaction operations
  ) {
    console.log('###### Controller loaded'); // just to check if controller is loaded multiple times because of some dependency
  }

  @Get()
  async all(): Promise<Order[]> {
    return await this.orderService.getAll(this.entityManager);
  }

  @Get(':id')
  async getById(@Param('id') id: number): Promise<Order> {
    return await this.orderService.getById(this.entityManager, id);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor) // Create a Transaction operation
  async createOrder(
    @TransactionParam() entityManager: EntityManager, // Get the transactional EntityManager created by TransactionInterceptor above
    @Body() orderDto: CreateOrderRequestDto,
  ): Promise<Order> {
    return await this.orderService.createOrder(entityManager, orderDto);
  }
}
```


## Contributing

Contributions are always welcome!

I will be glad to know if this approach help you or if you know a better way to resolve the same problem.

