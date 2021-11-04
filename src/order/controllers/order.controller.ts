import { Body, Controller, Get, Param, Post, UseInterceptors } from "@nestjs/common";
import { OrderService } from '../services/order.service';
import { Order } from '../models/order.model';
import { CreateOrderRequestDto } from '../dto/create-order-request.dto';
import { EntityManager } from 'typeorm';
import { TransactionInterceptor } from '../../core/interceptors/transaction.interceptor';
import { TransactionParam } from '../../core/decorators/transaction-param.decorator';
import { InjectEntityManager } from '@nestjs/typeorm';

@Controller('/v1/order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    @InjectEntityManager() private readonly entityManager: EntityManager, // manager to use in non transactional operations
  ) {
    console.log('###### Controller loaded'); // just to check if controller is loaded multiple times because of some dependency
  }

  @Get()
  async all(): Promise<Order[]> {
    return await this.orderService.getAll(this.entityManager); // non transactional operation
  }

  @Get(':id')
  async getById(@Param('id') id: number): Promise<Order> {
    return await this.orderService.getById(this.entityManager, id); // non transactional operation
  }

  @Post()
  @UseInterceptors(TransactionInterceptor) // Create a Transaction operation
  async createOrder(
    @TransactionParam() entityManager: EntityManager, // Get the transactional EntityManager created by TransactionInterceptor above
    @Body() orderDto: CreateOrderRequestDto,
  ): Promise<Order> {
    return await this.orderService.createOrder(entityManager, orderDto); // transactional operation
  }
}
