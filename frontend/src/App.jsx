import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Profile from "./pages/Profile";
import Addresses from "./pages/Addresses";
import Admin from "./pages/Admin";
import ShopOwner from "./pages/ShopOwner";
import Shipper from "./pages/Shipper";
import QrPayment from "./pages/QrPayment";

function Protected({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 16px 16px" }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Protected><Cart /></Protected>} />
          <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
          <Route path="/orders" element={<Protected><Orders /></Protected>} />
          <Route path="/orders/:id" element={<Protected><OrderDetail /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/addresses" element={<Protected><Addresses /></Protected>} />
          <Route path="/admin" element={<Protected><Admin /></Protected>} />
          <Route path="/shop" element={<Protected><ShopOwner /></Protected>} />
          <Route path="/shipper" element={<Protected><Shipper /></Protected>} />
          <Route path="/payment/qr/:orderId" element={<Protected><QrPayment /></Protected>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}