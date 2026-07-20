const shopService = require("../service/shopService");

const getProducts = async (req, res) => {
  try { const r = await shopService.getProducts(req.user.id); return res.json(r); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};
const addProduct = async (req, res) => {
  try { const r = await shopService.addProduct(req.user.id, req.body); return res.status(201).json(r); }
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
  try { const r = await shopService.getOrders(req.user.id); return res.json(r); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};
const assignShipper = async (req, res) => {
  try { await shopService.assignShipper(req.user.id, req.params.id, req.body.shipperId); return res.json({ message: "Đã giao cho shipper!" }); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};
const getShippers = async (req, res) => {
  try { const r = await shopService.getShippers(); return res.json(r); }
  catch (e) { return res.status(500).json({ message: "Lỗi" }); }
};
const getInventory = async (req, res) => {
  try { const r = await shopService.getInventory(req.user.id); return res.json(r); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};
const getSales = async (req, res) => {
  try { const r = await shopService.getSales(req.user.id); return res.json(r); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};

module.exports = { getProducts, addProduct, editProduct, removeProduct, getOrders, assignShipper, getShippers, getInventory, getSales };