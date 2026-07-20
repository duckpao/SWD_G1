const shipperService = require("../service/shipperService");

const getDeliveries = async (req, res) => {
  try { const r = await shipperService.getMyDeliveries(req.user.id); return res.json(r); }
  catch (e) { return res.status(500).json({ message: "Lỗi" }); }
};
const pickup = async (req, res) => {
  try { await shipperService.markPickedUp(req.user.id, req.params.id); return res.json({ message: "Đã lấy hàng!" }); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};
const deliver = async (req, res) => {
  try { await shipperService.markDelivered(req.user.id, req.params.id); return res.json({ message: "Giao hàng thành công!" }); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};

module.exports = { getDeliveries, pickup, deliver };