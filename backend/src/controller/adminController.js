const adminService = require("../service/adminService");

const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const users = await adminService.getUsers(role);
    return res.json(users);
  } catch (e) { console.error("Lỗi getUsers:", e.message); return res.status(500).json({ message: "Lỗi lấy danh sách người dùng" }); }
};

const toggleUserStatus = async (req, res) => {
  try {
    const result = await adminService.toggleUserStatus(req.params.id);
    return res.json(result);
  } catch (e) { return res.status(e.message.includes("không tồn tại") ? 404 : 500).json({ message: e.message }); }
};

const getOrders = async (req, res) => {
  try {
    const orders = await adminService.getOrders();
    return res.json(orders);
  } catch (e) { console.error("Lỗi getOrders:", e.message); return res.status(500).json({ message: "Lỗi lấy danh sách đơn hàng" }); }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    if (!status) return res.status(400).json({ message: "Thiếu trạng thái!" });
    const order = await adminService.updateOrderStatus(req.params.id, status, paymentStatus);
    return res.json(order);
  } catch (e) { return res.status(e.message.includes("không tồn tại") ? 404 : 500).json({ message: e.message }); }
};

module.exports = { getUsers, toggleUserStatus, getOrders, updateOrderStatus };