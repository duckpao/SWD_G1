const { EntitySchema } = require("@mikro-orm/core");

class Order {
  constructor(user, totalAmount, shippingAddress, phone) {
    this.user = user;
    this.totalAmount = totalAmount;
    this.shippingAddress = shippingAddress;
    this.phone = phone;
    this.status = "pending";
  }
}

const OrderSchema = new EntitySchema({
  class: Order,
  tableName: "orders",
  properties: {
    id: { primary: true, type: "number", autoincrement: true },
    user: {
      reference: "m:1",
      entity: "User",
      fieldName: "user_id",
      nullable: false,
    },
    orderDate: {
      type: "Date",
      fieldName: "order_date",
      defaultRaw: "CURRENT_TIMESTAMP",
    },
    totalAmount: {
      type: "decimal",
      length: 10,
      decimals: 2,
      fieldName: "total_amount",
      nullable: false,
    },
    shippingAddress: {
      type: "text",
      fieldName: "shipping_address",
      nullable: false,
    },
    phone: { type: "string", length: 15, nullable: false },
    status: {
      type: "enum",
      items: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
      default: "pending",
    },
    note: { type: "text", nullable: true },
  },
});

module.exports = { Order, OrderSchema };
