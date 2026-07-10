const productRepository = require("../repository/productRepository");

const getProducts = async (query) => {
  return await productRepository.findAll(query);
};

const getProductDetail = async (id) => {
  const product = await productRepository.findById(id);
  if (!product) throw new Error("Sản phẩm không tồn tại!");
  const variants = await productRepository.findVariantsByProductId(id);
  return { ...product, variants };
};

const getCategories = async () => {
  return await productRepository.findCategories();
};

module.exports = { getProducts, getProductDetail, getCategories };