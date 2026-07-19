const fs = require("fs");

// productRepository
fs.writeFileSync("E:/KI7Project/SWD_G1/backend/src/repository/productRepository.js", [
'const { sequelize } = require("../config/db");',
"",
'module.exports = { findAll, findById, findVariantsByProductId, findCategories, updateStock };',
""
].join("\r\n"), "utf8");

console.log("done");
