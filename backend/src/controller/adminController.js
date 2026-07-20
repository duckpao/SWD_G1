const adminService = require("../service/adminService");

const getUsers = async (req, res) => {
  try { const r = await adminService.getUsers(req.query.role); return res.json(r); }
  catch (e) { return res.status(500).json({ message: "Lỗi" }); }
};

const toggleUserStatus = async (req, res) => {
  try { const r = await adminService.toggleUserStatus(req.params.id); return res.json(r); }
  catch (e) { return res.status(404).json({ message: e.message }); }
};

const getOrders = async (req, res) => {
  try { const r = await adminService.getOrders(); return res.json(r); }
  catch (e) { return res.status(500).json({ message: "Lỗi" }); }
};

const getShippers = async (req, res) => {
  try { const r = await adminService.getShippers(); return res.json(r); }
  catch (e) { return res.status(500).json({ message: "Lỗi" }); }
};

const getShipperDeliveries = async (req, res) => {
  try { const r = await adminService.getShipperDeliveries(req.params.id); return res.json(r); }
  catch (e) { return res.status(500).json({ message: "Lỗi" }); }
};

const assignShipper = async (req, res) => {
  try { const r = await adminService.assignShipper(req.params.id, req.body.shipperId); return res.json(r); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};

const updateOrderStatus = async (req, res) => {
  try { const r = await adminService.updateOrderStatus(req.params.id, req.body.status, req.body.paymentStatus); return res.json(r); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};

module.exports = { getUsers, toggleUserStatus, getOrders, getShippers, getShipperDeliveries, assignShipper, updateOrderStatus };