const addressService = require("../service/addressService");

const getAddresses = async (req, res) => {
  try { const r = await addressService.getAddresses(req.user.id); return res.json(r); }
  catch (e) { console.error("Lỗi getAddresses:", e.message); return res.status(500).json({ message: "Lỗi lấy địa chỉ" }); }
};

const addAddress = async (req, res) => {
  try { const r = await addressService.addAddress(req.user.id, req.body); return res.status(201).json(r); }
  catch (e) { return res.status(400).json({ message: e.message }); }
};

const updateAddress = async (req, res) => {
  try { await addressService.updateAddress(req.params.id, req.user.id, req.body); return res.json({ message: "Cập nhật địa chỉ thành công!" }); }
  catch (e) { return res.status(e.message.includes("không tồn tại") ? 404 : 400).json({ message: e.message }); }
};

const deleteAddress = async (req, res) => {
  try { await addressService.deleteAddress(req.params.id, req.user.id); return res.json({ message: "Xóa địa chỉ thành công!" }); }
  catch (e) { return res.status(e.message.includes("không tồn tại") ? 404 : 400).json({ message: e.message }); }
};

const setDefaultAddress = async (req, res) => {
  try { await addressService.setDefaultAddress(req.params.id, req.user.id); return res.json({ message: "Đặt địa chỉ mặc định thành công!" }); }
  catch (e) { return res.status(e.message.includes("không tồn tại") ? 404 : 400).json({ message: e.message }); }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress };