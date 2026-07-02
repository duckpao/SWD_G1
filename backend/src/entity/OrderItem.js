const { EntitySchema } = require("@mikro-orm/core");

class OrderItem {
  constructor(order, product, quantity, price) {
    this.order = order;
    this.product = product;
    this.quantity = quantity;
    this.price = price;
  }
}

const OrderItemSchema = new EntitySchema({
  class: OrderItem,
  tableName: "order_items",
  properties: {
    id: { primary: true, type: "number", autoincrement: true },
    order: {
      reference: "m:1",
      entity: "Order",
      fieldName: "order_id",
      nullable: false,
    },
    product: {
      reference: "m:1",
      entity: "Product",
      fieldName: "product_id",
      nullable: false,
    },
    quantity: { type: "number", nullable: false },
    price: { type: "decimal", length: 10, decimals: 2, nullable: false },
  },
});

module.exports = { OrderItem, OrderItemSchema };
