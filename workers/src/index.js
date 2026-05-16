const { Kafka } = require('kafkajs');
const mysql = require('mysql2/promise');
const Redis = require('redis');

// 1. Cấu hình Kafka
const kafka = new Kafka({ clientId: 'fruit-worker', brokers: ['localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'order-processors' });

// 2. Cấu hình Redis (Để cập nhật lại kho sau khi xử lý xong)
const redisClient = Redis.createClient({ url: 'redis://localhost:6379' });

async function initWorker() {
  const connection = await mysql.createConnection({
    host: 'localhost', user: 'root', password: 'root', database: 'fruit_shop'
  });
  
  await redisClient.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: 'order-topic', fromBeginning: true });

  console.log("🚀 Worker đã sẵn sàng trực chiến...");

  await consumer.run({
    eachMessage: async ({ message }) => {
      const order = JSON.parse(message.value.toString());
      console.log(`📦 Đang xử lý đơn hàng: ${order.id} - Sản phẩm: ${order.name}`);

      try {
        // --- LOGIC NGHIỆP VỤ ---
        // 1. Trừ tồn kho trong MySQL
        await connection.execute(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [order.quantity, order.productId]
        );

        // 2. Lưu lịch sử đơn hàng
        await connection.execute(
          'INSERT INTO orders (product_id, quantity, status) VALUES (?, ?, ?)',
          [order.productId, order.quantity, 'COMPLETED']
        );

        // 3. Cập nhật lại số dư kho mới vào Redis (để 1000 user xem nhanh)
        const [rows] = await connection.execute('SELECT stock FROM products WHERE id = ?', [order.productId]);
        await redisClient.set(`product:stock:${order.productId}`, rows[0].stock);

        console.log(`✅ Hoàn tất đơn hàng ${order.id}. Kho cập nhật: ${rows[0].stock}`);
      } catch (err) {
        console.error("❌ Lỗi xử lý đơn hàng:", err);
      }
    },
  });
}

initWorker().catch(console.error);