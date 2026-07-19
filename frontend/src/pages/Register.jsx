import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../api";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "" });
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await auth.register(form);
      alert("Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.");
      nav("/login");
    } catch (e) {
      setErr(e.response?.data?.error || e.response?.data?.message || "Đăng ký thất bại");
    }
  };

  const s = { display: "flex", flexDirection: "column", gap: 12 };
  return (
    <div style={{ maxWidth: 480, margin: "40px auto" }}>
      <h1 style={{ textAlign: "center", color: "#2e7d32" }}>Đăng ký</h1>
      {err && <p style={{ color: "#c62828", textAlign: "center" }}>{err}</p>}
      <form onSubmit={submit} style={s}>
        <input placeholder="Họ và tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inp} required />
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inp} required />
        <input placeholder="Mật khẩu (ít nhất 6 ký tự)" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={inp} required />
        <input placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inp} required />
        <textarea placeholder="Địa chỉ" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} style={{ ...inp, minHeight: 60 }} />
        <button style={btn}>Đăng ký</button>
        <p style={{ textAlign: "center" }}>Đã có tài khoản? <Link to="/login" style={{ color: "#2e7d32" }}>Đăng nhập</Link></p>
      </form>
    </div>
  );
}
const inp = { padding: 12, border: "1px solid #ddd", borderRadius: 8, fontSize: 15 };
const btn = { padding: 12, background: "#2e7d32", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer" };