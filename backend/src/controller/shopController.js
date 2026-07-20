const shopService = require("../service/shopService");

const getProducts = async (req, res) => {
  try { return res.json(await shopService.getProducts(req.user.id)); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};
const addProduct = async (req, res) => {
  try { return res.status(201).json(await shopService.addProduct(req.user.id, req.body)); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};
const editProduct = async (req, res) => {
  try { await shopService.editProduct(req.user.id, req.params.id, req.body); return res.json({ message: "Cập nhật thành công!" }); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};
const removeProduct = async (req, res) => {
  try { await shopService.removeProduct(req.user.id, req.params.id); return res.json({ message: "Xóa thành công!" }); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};
const getOrders = async (req, res) => {
  try { return res.json(await shopService.getOrders(req.user.id)); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};
const assignShipper = async (req, res) => {
  try { await shopService.assignShipper(req.user.id, req.params.id, req.body.shipperId); return res.json({ message: "Đã giao cho shipper!" }); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};
const getShippers = async (req, res) => {
  try { return res.json(await shopService.getShippers()); }
  catch (e) { return res.status(500).json({ message: "Lỗi" }); }
};
const getInventory = async (req, res) => {
  try { return res.json(await shopService.getInventory(req.user.id)); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};
const getSales = async (req, res) => {
  try { return res.json(await shopService.getSales(req.user.id)); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};
const cancelOrder = async (req, res) => {
  try { await shopService.cancelOrder(req.user.id, req.params.id, req.body.reason); return res.json({ message: "Hủy đơn hàng thành công!" }); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};

module.exports = { getProducts, addProduct, editProduct, removeProduct, getOrders, assignShipper, getShippers, getInventory, getSales, cancelOrder };