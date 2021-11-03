import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { CreateOrderRequestDto } from '../dto/create-order-request.dto';
import { Order } from '../models/order.model';
import { Item } from '../models/item.model';
import { EntityManager } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async getAll(em: EntityManager): Promise<Order[]> {
    return await this.orderRepository.getAll(em);
  }

  async getById(em: EntityManager, id: number): Promise<Order> {
    return await this.orderRepository.getById(em, id);
  }

  async createOrder(
    em: EntityManager,
    orderDto: CreateOrderRequestDto,
  ): Promise<Order> {
    let order = new Order();
    order.date = orderDto.date;
    order.description = orderDto.description;

    order = await this.orderRepository.saveOrder(em, order);

    for (const itemDto of orderDto.items) {
      const item = new Item();
      item.name = itemDto.name;
      item.quantity = itemDto.quantity;
      item.order = order;
      await this.orderRepository.saveOrderItem(em, item);
    }

    return order;
  }
}
