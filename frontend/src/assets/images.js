// Map product name -> fallback image filename
const productImages = {
  "Xoai Cat Chu": "xoai-cat-chu.jpg",
  "Sau Rieng Ri6": "sau-rieng.jpg",
  "Mit Ruot Do": "mit-ruot-do.jpg",
  "Dau Tay Dalat": "dau-tay.jpg",
  "Cherry My Nhap Khau": "cherry-my.jpg",
  "Kiwi New Zealand": "kiwi.jpg",
  "Chom Chom Java": "chom-chom.jpg",
  "Blueberry Nhap Khau": "blueberry.jpg",
  "Buoi Da Xanh": "buoi-da-xanh.jpg",
  "Xoai Say Deo": "xoai-say-deo.jpg",
};

// Ưu tiên image_url từ API, fallback về file mapping
export const getProductImage = (product) => {
  if (!product) return null;
  if (product.image_url) return product.image_url;
  const file = productImages[product.name];
  if (file) return "/images/products/" + file;
  return null;
};

export const LOGO = "/images/logo.svg";

export default productImages;