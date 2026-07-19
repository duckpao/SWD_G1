const addressRepository = require("../repository/addressRepository");

const getAddresses = async (userId) => {
  return await addressRepository.findByUser(userId);
};

const addAddress = async (userId, data) => {
  if (!data.recipient_name || !data.phone || !data.street_address) throw new Error("Thiếu thông tin bắt buộc (tên, sđt, địa chỉ)!");
  const result = await addressRepository.create({ ...data, user_id: userId });
  return result;
};

const updateAddress = async (id, userId, data) => {
  const existing = await addressRepository.findById(id, userId);
  if (!existing) throw new Error("Địa chỉ không tồn tại!");
  await addressRepository.update(id, userId, data);
};

const deleteAddress = async (id, userId) => {
  const existing = await addressRepository.findById(id, userId);
  if (!existing) throw new Error("Địa chỉ không tồn tại!");
  await addressRepository.remove(id, userId);
};

const setDefaultAddress = async (id, userId) => {
  const existing = await addressRepository.findById(id, userId);
  if (!existing) throw new Error("Địa chỉ không tồn tại!");
  await addressRepository.setDefault(id, userId);
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress };