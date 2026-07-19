import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, addresses as addrApi } from "../api";
import { User, MapPin, Package, ChevronRight, LogOut } from "lucide-react";

export default function Profile() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullname: "", phone: "", address: "" });

  useEffect(() => { auth.getMe().then((u) => { setProfile(u); setForm({ fullname: u.fullname, phone: u.phone || "", address: u.address || "" }); }).catch(() => {}); }, []);

  const save = async (e) => {
    e.preventDefault();
    try { const r = await auth.updateProfile(form); setProfile(r); setEditing(false); const u = JSON.parse(localStorage.getItem("user") || "{}"); localStorage.setItem("user", JSON.stringify({ ...u, fullname: r.fullname })); } catch (e) { alert("Lỗi cập nhật"); }
  };

  const doLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); nav("/login"); };

  const items = [
    { icon: <Package />, label: "Đơn hàng của tôi", path: "/orders" },
    { icon: <MapPin />, label: "Địa chỉ giao hàng", path: "/addresses" },
  ];

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #2e7d32, #43a047)", borderRadius: 16, padding: 32, color: "#fff", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 64, height: 64, background: "rgba(255,255,255,.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>👤</div>
          <div>
            <h2 style={{ margin: 0 }}>{profile?.fullname || user.fullname}</h2>
            <p style={{ margin: "4px 0 0", opacity: .8 }}>{profile?.email || user.email} • {profile?.role || user.role}</p>
          </div>
          <button onClick={() => setEditing(!editing)} style={{ marginLeft: "auto", padding: "8px 16px", background: "rgba(255,255,255,.2)", color: "#fff", border: "1px solid rgba(255,255,255,.3)", borderRadius: 8, cursor: "pointer" }}>Sửa</button>
        </div>
      </div>

      {editing && (
        <form onSubmit={save} style={{ background: "#fff", padding: 20, borderRadius: 12, border: "1px solid #eee", marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px" }}>Cập nhật thông tin</h3>
          <input placeholder="Họ tên" value={form.fullname} onChange={(e) => setForm({ ...form, fullname: e.target.value })} style={inp} />
          <input placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inp} />
          <textarea placeholder="Địa chỉ" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} style={{ ...inp, minHeight: 60 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ padding: "10px 24px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Lưu</button>
            <button onClick={() => setEditing(false)} style={{ padding: "10px 24px", background: "#fff", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer" }}>Hủy</button>
          </div>
        </form>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item) => (
          <Link key={item.path} to={item.path} style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, background: "#fff", borderRadius: 12, border: "1px solid #eee", textDecoration: "none", color: "inherit" }}>
            <span style={{ color: "#2e7d32" }}>{item.icon}</span>
            <span style={{ flex: 1, fontWeight: 500 }}>{item.label}</span>
            <ChevronRight size={18} color="#999" />
          </Link>
        ))}
        <button onClick={doLogout} style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, background: "#fff", borderRadius: 12, border: "1px solid #eee", cursor: "pointer", color: "#c62828", fontWeight: 500, fontSize: 15 }}>
          <LogOut size={20} /> Đăng xuất
        </button>
      </div>
    </div>
  );
}
const inp = { display: "block", width: "100%", padding: 12, border: "1px solid #ddd", borderRadius: 8, fontSize: 15, marginBottom: 12, boxSizing: "border-box" };