import { HttpException, Injectable } from '@nestjs/common';
import { Order } from '../models/order.model';
import { Item } from '../models/item.model';
import { EntityManager } from 'typeorm';

@Injectable()
export class OrderRepository {
  async getAll(em: EntityManager): Promise<Order[]> {
    return em.find(Order, {
      relations: ['items'],
    });
  }

  async getById(em: EntityManager, idOrder: number): Promise<Order> {
    return em.findOneOrFail(Order, idOrder, {
      relations: ['items'],
    });
  }

  async saveOrder(em: EntityManager, order: Order): Promise<Order> {
    return await em.save(order);
  }

  async saveOrderItem(em: EntityManager, item: Item): Promise<Item> {
    const rand = Math.floor(Math.random() * 5);
    if (rand <= 2) {
      throw new HttpException("xablau", 500);
    }
    return await em.save(item);
  }
}
