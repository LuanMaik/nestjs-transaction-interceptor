import { OrderService } from '../src/order/services/order.service';
import { OrderRepository } from '../src/order/repositories/order.repository';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { Order } from '../src/order/models/order.model';
import { Item } from '../src/order/models/item.model';

describe('OrderService', () => {
  const em = {} as EntityManager;

  describe('findAll', () => {
    it('should return an array of Orders', async () => {
      const fakeResults = [{ id: 1 } as Order];

      // Given
      const orderRepository = new OrderRepository();
      const spyGetAll = jest
        .spyOn(orderRepository, 'getAll')
        .mockImplementation(async () => Promise.resolve(fakeResults));

      // When
      const orderService = new OrderService(orderRepository);
      const results = await orderService.getAll(em);

      // Then
      expect(results).toBe(fakeResults);
      expect(spyGetAll.mock.calls.length).toBe(1);
    });
  });

  describe('create', () => {
    it('should return an Order with Id', async () => {
      // Given
      const createOrderRequestDto = {
        date: new Date(),
        description: 'Fake Order',
        items: [
          {
            name: 'Fake item',
            quantity: 1,
          },
        ],
      };

      const fakeOrderCreated = new Order();
      fakeOrderCreated.id = 1;
      fakeOrderCreated.date = createOrderRequestDto.date;
      fakeOrderCreated.description = createOrderRequestDto.description;

      const fakeItemCreated = new Item();
      fakeItemCreated.id = 1;
      fakeItemCreated.name = createOrderRequestDto.items[0].name;
      fakeItemCreated.quantity = createOrderRequestDto.items[0].quantity;
      fakeItemCreated.idOrder = fakeOrderCreated.id;
      fakeItemCreated.order = fakeOrderCreated;

      const orderRepository = new OrderRepository();

      const spyMethodSaveOrder = jest
        .spyOn(orderRepository, 'saveOrder')
        .mockImplementation(
          async () => Promise.resolve({ ...fakeOrderCreated }), // objetos são passados por referencia, por isso é criado uma cópia, evitando que possíveis alteração de dados dentro do Service não afete o valor esperado
        );

      const spyMethodSaveOrderItem = jest
        .spyOn(orderRepository, 'saveOrderItem')
        .mockImplementation(
          async () => Promise.resolve({ ...fakeItemCreated }), // objetos são passados por referencia, por isso é criado uma cópia, evitando que possíveis alteração de dados dentro do Service não afete o valor esperado
        );

      // When
      const orderService = new OrderService(orderRepository);
      const result = await orderService.createOrder(em, createOrderRequestDto);

      // Then
      expect(result).toMatchObject(fakeOrderCreated);
      expect(spyMethodSaveOrder.mock.calls.length).toBe(1);
      expect(spyMethodSaveOrderItem.mock.calls.length).toBe(1);
    });
  });
});
