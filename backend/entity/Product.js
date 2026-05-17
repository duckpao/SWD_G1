const { EntitySchema } = require("@mikro-orm/core");

class Product {
  constructor(name, price, stockQuantity) {
    this.name = name;
    this.price = price;
    this.stockQuantity = stockQuantity || 0;
    this.unit = "kg";
    this.isAvailable = true;
  }
}

const ProductSchema = new EntitySchema({
  class: Product,
  tableName: "products",
  properties: {
    id: { primary: true, type: "number", autoincrement: true },
    name: { type: "string", length: 100, nullable: false },
    category: {
      reference: "m:1",
      entity: "Category",
      fieldName: "category_id",
      nullable: true,
    },
    description: { type: "text", nullable: true },
    price: { type: "decimal", length: 10, decimals: 2, nullable: false },
    stockQuantity: {
      type: "number",
      fieldName: "stock_quantity",
      default: 0,
      nullable: false,
    },
    imageUrl: {
      type: "string",
      length: 255,
      fieldName: "image_url",
      nullable: true,
    },
    origin: { type: "string", length: 100, nullable: true },
    unit: { type: "string", length: 20, default: "kg" },
    isAvailable: { type: "boolean", fieldName: "is_available", default: true },
    createdAt: {
      type: "Date",
      fieldName: "created_at",
      defaultRaw: "CURRENT_TIMESTAMP",
    },
    updatedAt: {
      type: "Date",
      fieldName: "updated_at",
      defaultRaw: "CURRENT_TIMESTAMP",
      runtimeDefaults: { onUpdate: () => new Date() },
    },
  },
});

module.exports = { Product, ProductSchema };
