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
  try { await shopService.editProduct(req.user.id, req.params.id, req.body); return res.json({ message: "C?p nh?t th�nh c�ng!" }); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};
const removeProduct = async (req, res) => {
  try { await shopService.removeProduct(req.user.id, req.params.id); return res.json({ message: "X�a th�nh c�ng!" }); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};
const getOrders = async (req, res) => {
  try { return res.json(await shopService.getOrders(req.user.id)); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};
const assignShipper = async (req, res) => {
  try { await shopService.assignShipper(req.user.id, req.params.id, req.body.shipperId); return res.json({ message: "�� giao cho shipper!" }); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};
const getShippers = async (req, res) => {
  try { return res.json(await shopService.getShippers()); }
  catch (e) { return res.status(500).json({ message: "L?i" }); }
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
  try { await shopService.cancelOrder(req.user.id, req.params.id, req.body.reason); return res.json({ message: "H?y don h�ng th�nh c�ng!" }); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};

const getReviews = async (req, res) => {
  try { return res.json(await shopService.getReviews(req.user.id)); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};

module.exports = { getProducts, addProduct, editProduct, removeProduct, getOrders, assignShipper, getShippers, getInventory, getSales, cancelOrder, getReviews };
