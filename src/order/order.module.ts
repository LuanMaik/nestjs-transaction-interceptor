import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './models/order.model';
import { Item } from './models/item.model';
import { OrderService } from './services/order.service';
import { OrderRepository } from './repositories/order.repository';
import { OrderController } from './controllers/order.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Item])],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
})
export class OrderModule {}
