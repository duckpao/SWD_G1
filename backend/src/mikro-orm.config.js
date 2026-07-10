const { UserSchema } = require("./entity/User");
const { CategorySchema } = require("./entity/Category");
const { ProductSchema } = require("./entity/Product");
const { CartSchema } = require("./entity/Cart");
const { OrderSchema } = require("./entity/Order");
const { OrderItemSchema } = require("./entity/OrderItem");
const { ReportSchema } = require("./entity/Report");

module.exports = {
  entities: [
    UserSchema,
    CategorySchema,
    ProductSchema,
    CartSchema,
    OrderSchema,
    OrderItemSchema,
    ReportSchema,
  ],
  dbName: "fruit_shop",
  user: "root",
  password: "root",
  host: "localhost",
  port: 3307,
  type: "mysql",
};
