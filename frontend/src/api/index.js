import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = "Bearer " + token;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(e);
  }
);

export const auth = {
  login: (d) => api.post("/auth/login", d).then((r) => r.data),
  register: (d) => api.post("/auth/register", d).then((r) => r.data),
  registerAdmin: (d) => api.post("/auth/register-admin", d).then((r) => r.data),
  getMe: () => api.get("/auth/me").then((r) => r.data),
  updateProfile: (d) => api.put("/auth/profile", d).then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
  forgotPassword: (d) => api.post("/auth/forgot-password", d).then((r) => r.data),
  resetPassword: (d) => api.post("/auth/reset-password", d).then((r) => r.data),
};

export const products = {
  list: (q) => api.get("/products", { params: q }).then((r) => r.data),
  categories: () => api.get("/products/categories").then((r) => r.data),
  detail: (id) => api.get("/products/" + id).then((r) => r.data),
};

export const cart = {
  get: () => api.get("/cart").then((r) => r.data),
  add: (d) => api.post("/cart", d).then((r) => r.data),
  update: (id, d) => api.put("/cart/" + id, d).then((r) => r.data),
  remove: (id) => api.delete("/cart/" + id).then((r) => r.data),
  applyVoucher: (d) => api.post("/cart/apply-voucher", d).then((r) => r.data),
};

export const orders = {
  create: (d) => api.post("/orders", d).then((r) => r.data),
  list: (q) => api.get("/orders", { params: q }).then((r) => r.data),
  detail: (id) => api.get("/orders/" + id).then((r) => r.data),
  cancel: (id, d) => api.put("/orders/" + id + "/cancel", d).then((r) => r.data),
  confirmDelivery: (id) => api.put("/orders/" + id + "/confirm-delivery").then((r) => r.data),
};

export const reviews = {
  byProduct: (id) => api.get("/reviews/product/" + id).then((r) => r.data),
  create: (d) => api.post("/reviews", d).then((r) => r.data),
};

export const addresses = {
  list: () => api.get("/addresses").then((r) => r.data),
  add: (d) => api.post("/addresses", d).then((r) => r.data),
  update: (id, d) => api.put("/addresses/" + id, d).then((r) => r.data),
  remove: (id) => api.delete("/addresses/" + id).then((r) => r.data),
  setDefault: (id) => api.put("/addresses/" + id + "/default").then((r) => r.data),
};

export default api;