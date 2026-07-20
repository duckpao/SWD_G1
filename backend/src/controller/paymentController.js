const paymentService = require("../service/paymentService");

const createQrPayment = async (req, res) => {
  try {
    const result = await paymentService.createQrPayment(req.user.id, req.params.orderId);
    return res.json(result);
  } catch (e) { return res.status(400).json({ message: e.message }); }
};

const confirmPayment = async (req, res) => {
  try {
    const result = await paymentService.confirmPayment(req.user.id, req.params.orderId);
    return res.json(result);
  } catch (e) { return res.status(400).json({ message: e.message }); }
};

module.exports = { createQrPayment, confirmPayment };