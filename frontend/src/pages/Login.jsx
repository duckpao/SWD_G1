import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../api";
import { LogIn } from "lucide-react";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await auth.login(form);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      nav("/");
    } catch (e) {
      setErr(e.response?.data?.error || e.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto" }}>
      <h1 style={{ textAlign: "center", color: "#2e7d32" }}><LogIn size={32} style={{ verticalAlign: "middle", marginRight: 8 }} />Đăng nhập</h1>
      {err && <p style={{ color: "#c62828", textAlign: "center" }}>{err}</p>}
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputS} required />
        <input type="password" placeholder="Mật khẩu" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputS} required />
        <button style={btnS}>Đăng nhập</button>
        <p style={{ textAlign: "center", color: "#666" }}>
          Chưa có tài khoản? <Link to="/register" style={{ color: "#2e7d32" }}>Đăng ký</Link>
        </p>
      </form>
    </div>
  );
}

const inputS = { padding: 12, border: "1px solid #ddd", borderRadius: 8, fontSize: 15 };
const btnS = { padding: 12, background: "#2e7d32", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer" };