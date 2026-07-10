const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("fruit_shop", "root", "root", {
  host: "localhost",
  dialect: "mysql",
  port: 3307,
  logging: false,
  dialectOptions: {
    connectTimeout: 60000,
  },
  pool: {
    max: 50,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Kết nối MySQL (Sequelize) thành công!");
  } catch (error) {
    console.error("Không thể kết nối Database MySQL:", error.message);
    console.error("Hãy chắc chắn container mysql-db đang chạy.");
  }
};

module.exports = { sequelize, connectDB };