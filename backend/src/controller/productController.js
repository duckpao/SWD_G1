const productService = require("../service/productService");

const getProducts = async (req, res) => {
  try {
    const { search, categoryId, minPrice, maxPrice, sortBy, sortOrder, page, limit } = req.query;
    const products = await productService.getProducts({ search, categoryId, minPrice, maxPrice, sortBy, sortOrder, page: page || 1, limit: limit || 20 });
    return res.json(products);
  } catch (error) {
    console.error("Lỗi getProducts:", error.message);
    return res.status(500).json({ message: "Lỗi lấy danh sách sản phẩm", error: error.message });
  }
};

const getProductDetail = async (req, res) => {
  try {
    const product = await productService.getProductDetail(req.params.id);
    return res.json(product);
  } catch (error) {
    console.error("Lỗi getProductDetail:", error.message);
    const status = error.message.includes("không tồn tại") ? 404 : 500;
    return res.status(status).json({ message: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await productService.getCategories();
    return res.json(categories);
  } catch (error) {
    console.error("Lỗi getCategories:", error.message);
    return res.status(500).json({ message: "Lỗi lấy danh mục" });
  }
};

module.exports = { getProducts, getProductDetail, getCategories };