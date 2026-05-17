const { EntitySchema } = require("@mikro-orm/core");

class Cart {
  constructor(user, product, quantity) {
    this.user = user;
    this.product = product;
    this.quantity = quantity || 1;
  }
}

const CartSchema = new EntitySchema({
  class: Cart,
  tableName: "carts",
  properties: {
    id: { primary: true, type: "number", autoincrement: true },
    user: {
      reference: "m:1",
      entity: "User",
      fieldName: "user_id",
      nullable: false,
    },
    product: {
      reference: "m:1",
      entity: "Product",
      fieldName: "product_id",
      nullable: false,
    },
    quantity: { type: "number", default: 1, nullable: false },
    addedAt: {
      type: "Date",
      fieldName: "added_at",
      defaultRaw: "CURRENT_TIMESTAMP",
    },
  },
});

module.exports = { Cart, CartSchema };
