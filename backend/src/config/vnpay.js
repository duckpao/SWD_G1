// VietQR Generator
// Format: https://img.vietqr.io/image/{BIN}-{ACCOUNT}-compact.png?amount=X&addInfo=Y&accountName=Z

const QR_CODE_API = "https://img.vietqr.io/image";

// Cấu hình tài khoản ngân hàng demo (có thể thay bằng tài khoản thật)
const BANK_CONFIG = {
  bin: "466584",        // TPBank
  accountNumber: "00003019189",
  accountName: "NGUYEN DUC BAO",
  bankName: "Ngân hàng Tiền Phong(TP Bank)",
};

const generateVietQRUrl = (amount, content) => {
  const params = new URLSearchParams({
    amount: amount.toString(),
    addInfo: content.substring(0, 50),
    accountName: BANK_CONFIG.accountName,
  });
  return `${QR_CODE_API}/${BANK_CONFIG.bin}-${BANK_CONFIG.accountNumber}-compact.png?${params.toString()}`;
};

const generateQRContent = (amount, content) => {
  return `VietQR:${BANK_CONFIG.bin}:${BANK_CONFIG.accountNumber}:${amount}:${content}`;
};

module.exports = { BANK_CONFIG, generateVietQRUrl, generateQRContent };