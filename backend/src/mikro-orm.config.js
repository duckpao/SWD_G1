const { UserSchema } = require('./entities/User');
const { CategorySchema } = require('./entities/Category');
const { ProductSchema } = require('./entities/Product');
const { CartSchema } = require('./entities/Cart');
const { OrderSchema } = require('./entities/Order');
const { OrderItemSchema } = require('./entities/OrderItem');
const { ReportSchema } = require('./entities/Report');

module.exports = {
  entities: [
    UserSchema, 
    CategorySchema, 
    ProductSchema, 
    CartSchema, 
    OrderSchema, 
    OrderItemSchema, 
    ReportSchema
  ],
  dbName: 'fruit_shop',
  user: 'root',
  password: 'root',
  host: 'localhost',
  port: 3307, // Port máy thật kết nối vào Docker MySQL theo file compose của bạn
  type: 'mysql',
};