const { Sequelize } = require('sequelize');

// Khởi tạo kết nối Sequelize tới MySQL trong Docker
const sequelize = new Sequelize('fruit_shop', 'root', 'root', {
  host: 'localhost',     // Kết nối từ máy thật (Localhost) vào Docker
  dialect: 'mysql',
  port: 3306,            // Port giao tiếp mặc định của MySQL
  logging: false,        // Tắt log câu lệnh SQL chạy ngầm để Terminal sạch hơn
  dialectOptions: {
    connectTimeout: 60000 // Chờ tối đa 60 giây khi khởi tạo kết nối
  },
  pool: {
    max: 50,             // Tối đa 50 kết nối đồng thời để gánh tải 1000 user active
    min: 0,              // Số kết nối tối thiểu khi hệ thống rảnh rỗi
    acquire: 30000,      // Thời gian tối đa (ms) thử kết nối trước khi báo lỗi timeout
    idle: 10000          // Thời gian (ms) giải phóng kết nối nếu không có request nào dùng
  }
});

// Hàm kiểm tra kết nối để gọi bên server.js
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối MySQL (Sequelize) thành công rồi nhé!');
  } catch (error) {
    console.error('❌ Thất bại! Không thể kết nối tới Database MySQL:', error.message);
    console.error('👉 Hãy chắc chắn rằng Docker Desktop đang chạy và container mysql-db không bị Exited.');
  }
};

module.exports = { sequelize, connectDB };