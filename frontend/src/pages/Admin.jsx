import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Users, Package } from "lucide-react";

const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use((c) => { c.headers.Authorization = "Bearer " + localStorage.getItem("token"); return c; });

const statusColor = { pending: "#f57c00", confirmed: "#1565c0", shipping: "#7b1fa2", delivered: "#2e7d32", cancelled: "#c62828" };
const statusLabel = { pending: "Chờ xác nhận", confirmed: "Đã xác nhận", shipping: "Đang giao", delivered: "Đã giao", cancelled: "Đã hủy" };

export default function Admin() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [tab, setTab] = useState("orders");
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => { if (user.role !== "admin") nav("/"); }, []);

  const loadUsers = (role) => { api.get("/admin/users" + (role ? "?role=" + role : "")).then(r => setUsers(r.data)).catch(() => {}); };
  const loadOrders = () => { api.get("/admin/orders").then(r => setOrders(r.data)).catch(() => {}); };
  useEffect(() => { if (tab === "users") loadUsers(roleFilter); else loadOrders(); }, [tab, roleFilter]);

  const toggleStatus = async (id) => { try { await api.put("/admin/users/" + id + "/toggle-status"); loadUsers(roleFilter); } catch (e) { alert("Lỗi"); } };

  const tabStyle = (t) => ({ padding: "12px 24px", border: "none", background: tab === t ? "#2e7d32" : "#eee", color: tab === t ? "#fff" : "#333", cursor: "pointer", fontWeight: 600, borderRadius: "8px 8px 0 0" });

  return (
    <div>
      <h1 style={{ color: "#2e7d32" }}>Admin Dashboard</h1>
      <div style={{ display: "flex", gap: 0, marginBottom: 20 }}>
        <button onClick={() => setTab("orders")} style={tabStyle("orders")}><Package size={18} /> Đơn hàng</button>
        <button onClick={() => setTab("users")} style={tabStyle("users")}><Users size={18} /> Người dùng</button>
      </div>

      {tab === "orders" && (
        <div>
          <p style={{ color: "#666" }}>{orders.length} đơn hàng</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 12, overflow: "hidden" }}>
              <thead style={{ background: "#f5f5f5" }}>
                <tr>{["Mã ĐH", "Khách", "Tổng", "Thanh toán", "Trạng thái", "Người giao", "Ngày"].map(h => <th key={h} style={{ padding: 12, textAlign: "left", fontSize: 14 }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{ borderTop: "1px solid #eee" }}>
                    <td style={td}>#{o.id}</td>
                    <td style={td}>{o.user_name}</td>
                    <td style={td}>{parseInt(o.final_amount).toLocaleString()}đ</td>
                    <td style={td}>
                      <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 12, background: o.payment_status === "paid" ? "#e8f5e9" : "#fff3e0", color: o.payment_status === "paid" ? "#2e7d32" : "#e65100" }}>
                        {o.payment_status === "paid" ? "Đã TT" : "Chưa TT"}
                      </span>
                    </td>
                    <td style={td}><span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: (statusColor[o.status] || "#999") + "20", color: statusColor[o.status] || "#999" }}>{statusLabel[o.status] || o.status}</span></td>
                    <td style={td}><span style={{ fontSize: 12, color: "#666" }}>{o.status === "shipping" || o.status === "delivered" ? "Đã gán" : o.status === "confirmed" ? "Chờ gán" : "-"}</span></td>
                    <td style={td}>{new Date(o.order_date).toLocaleDateString("vi-VN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}>
              <option value="">Tất cả vai trò</option>
              <option value="admin">Quản trị</option>
              <option value="shopowner">Shop Owner</option>
              <option value="Người giao">Shipper</option>
              <option value="user">Customer</option>
            </select>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 12, overflow: "hidden" }}>
            <thead style={{ background: "#f5f5f5" }}>
              <tr>{["ID", "Họ tên", "Email", "Vai trò", "Trạng thái", "Hành động"].map(h => <th key={h} style={{ padding: 12, textAlign: "left", fontSize: 14 }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={td}>{u.id}</td>
                  <td style={td}>{u.fullname}</td>
                  <td style={td}>{u.email}</td>
                  <td style={td}><span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 12, background: { admin: "#e3f2fd", shopowner: "#fff3e0", shipper: "#f3e5f5", user: "#e8f5e9" }[u.role] || "#eee" }}>{u.role}</span></td>
                  <td style={td}><span style={{ color: u.status === "active" ? "#2e7d32" : "#c62828", fontWeight: 600 }}>{u.status}</span></td>
                  <td style={td}>
                    <button onClick={() => toggleStatus(u.id)} style={{ padding: "6px 12px", fontSize: 12, background: u.status === "active" ? "#fff" : "#2e7d32", color: u.status === "active" ? "#c62828" : "#fff", border: "1px solid", borderColor: u.status === "active" ? "#c62828" : "#2e7d32", borderRadius: 4, cursor: "pointer" }}>
                      {u.status === "active" ? "Khóa" : "Kích hoạt"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
const td = { padding: 10, fontSize: 14 };