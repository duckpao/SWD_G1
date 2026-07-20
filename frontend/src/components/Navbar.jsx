import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Package, User, MapPin, LogOut, LogIn, Menu, X, Store, Shield, Truck } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [open, setOpen] = useState(false);

  const doLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("remember");
    nav("/login");
  };

  const linkStyle = { display: "flex", alignItems: "center", gap: 6, textDecoration: "none", color: "#333", fontWeight: 500, padding: "8px 12px", borderRadius: 8 };
  const activeLink = (path) => window.location.pathname === path ? { ...linkStyle, background: "#e8f5e9", color: "#2e7d32" } : linkStyle;

  const homeRoute = user?.role === "admin" ? "/admin" : user?.role === "shopowner" ? "/shop" : user?.role === "Người giao" ? "/shipper" : "/";

  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, background: "#fff", borderBottom: "1px solid #e0e0e0", zIndex: 1000, padding: "0 16px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", height: 60, justifyContent: "space-between" }}>
        <Link to={homeRoute} style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", fontWeight: "bold", fontSize: 20, color: "#2e7d32" }}>
          <img src="/images/logo.svg" alt="Fruit Shop" style={{ height: 36 }} />
        </Link>
        <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", cursor: "pointer", display: "none" }} className="menu-btn">
          {open ? <X /> : <Menu />}
        </button>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }} className="nav-links">
          {!user && <Link to="/" style={activeLink("/")}><Package size={18} /> Products</Link>}
          {user?.role === "admin" && <Link to="/admin" style={activeLink("/admin")}><Shield size={18} /> Admin</Link>}
          {user?.role === "shopowner" && <Link to="/shop" style={activeLink("/shop")}><Store size={18} /> Quản lý</Link>}
          {user?.role === "shipper" && <Link to="/shipper" style={activeLink("/shipper")}><Truck size={18} /> Giao hàng</Link>}
          {user && (
            <>
              {user.role === "user" && <Link to="/cart" style={activeLink("/cart")}><ShoppingCart size={18} /> Cart</Link>}
              {(user.role === "user" || user.role === "shopowner") && <Link to="/orders" style={activeLink("/orders")}><Package size={18} /> Orders</Link>}
              <Link to="/profile" style={activeLink("/profile")}><User size={18} /> {user.fullname?.split(" ").pop()}</Link>
              <button onClick={doLogout} style={{ ...linkStyle, background: "none", border: "none", cursor: "pointer", color: "#c62828" }}>
                <LogOut size={18} /> Logout
              </button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login" style={activeLink("/login")}><LogIn size={18} /> Login</Link>
              <Link to="/register" style={{ ...linkStyle, background: "#2e7d32", color: "#fff", borderRadius: 8 }}>Đăng ký</Link>
            </>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width:768px) {
          .menu-btn { display: block !important; }
          .nav-links { display: ${open ? "flex" : "none"} !important; flex-direction: column; position: absolute; top: 60px; left: 0; right: 0; background: #fff; padding: 16px; border-bottom: 1px solid #e0e0e0; }
        }
      `}</style>
    </nav>
  );
}