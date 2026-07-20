import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Users, Package, Truck } from "lucide-react";

const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use((c) => { c.headers.Authorization = "Bearer " + localStorage.getItem("token"); return c; });

const statusColor = { pending: "#f57c00", confirmed: "#1565c0", shipping: "#7b1fa2", delivered: "#2e7d32", cancelled: "#c62828" };
const statusLabel = { pending: "Chờ xác nhận", confirmed: "Chờ gán shipper", shipping: "Đang giao", delivered: "Đã giao", cancelled: "Đã hủy" };

export default function Admin() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [tab, setTab] = useState("orders");
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [shipperDeliveries, setShipperDeliveries] = useState({});
  const [expandedShipper, setExpandedShipper] = useState(null);
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => { if (user.role !== "admin") nav("/"); }, []);

  const loadOrders = () => { api.get("/admin/orders").then(r => setOrders(r.data)).catch(() => {}); };
  const loadShippers = () => { api.get("/admin/shippers").then(r => setShippers(r.data)).catch(() => {}); };
  const loadUsers = (role) => { api.get("/admin/users" + (role ? "?role=" + role : "")).then(r => setUsers(r.data)).catch(() => {}); };

  useEffect(() => {
    if (tab === "orders") loadOrders();
    if (tab === "shippers") { loadShippers(); loadOrders(); }
    if (tab === "users") loadUsers(roleFilter);
  }, [tab, roleFilter]);

  const toggleUserStatus = async (id) => { try { await api.put("/admin/users/" + id + "/toggle-status"); loadUsers(roleFilter); } catch {} };

  const toggleShipperDeliveries = async (id) => {
    if (expandedShipper === id) { setExpandedShipper(null); return; }
    setExpandedShipper(id);
    try { const r = await api.get("/admin/shippers/" + id + "/deliveries"); setShipperDeliveries(prev => ({ ...prev, [id]: r.data })); } catch {}
  };

  const assignShipper = async (orderId, shipperId) => {
    if (!shipperId) return;
    try { await api.put("/admin/orders/" + orderId + "/assign-shipper", { shipperId: parseInt(shipperId) }); loadOrders(); loadShippers(); } catch (e) { alert(e.response?.data?.message || "Lỗi"); }
  };

  const updatePayment = async (orderId) => {
    try { await api.put("/admin/orders/" + orderId + "/status", { paymentStatus: "paid" }); loadOrders(); } catch (e) { alert("Lỗi"); }
  };

  const cancelOrder = async (orderId) => {
    if (!confirm("Xác nhận hủy đơn hàng này?")) return;
    try { await api.put("/admin/orders/" + orderId + "/status", { status: "cancelled" }); loadOrders(); } catch (e) { alert("Lỗi"); }
  };

  const tabs = [
    { key: "orders", label: "Đơn hàng", icon: <Package size={18} /> },
    { key: "shippers", label: "Shipper", icon: <Truck size={18} /> },
    { key: "users", label: "Người dùng", icon: <Users size={18} /> },
  ];

  return (
    <div>
      <h1 style={{ color: "#2e7d32" }}>Admin Dashboard</h1>
      <div style={{ display: "flex", gap: 0, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "12px 24px", border: "none", background: tab === t.key ? "#2e7d32" : "#eee", color: tab === t.key ? "#fff" : "#333", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ORDERS TAB */}
      {tab === "orders" && (
        <div>
          <p style={{ color: "#666" }}>{orders.length} đơn hàng</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 12, overflow: "hidden" }}>
              <thead style={{ background: "#f5f5f5" }}>
                <tr>{["Mã ĐH", "Khách", "Tổng", "Thanh toán", "Trạng thái", "Gán Shipper", "Thao tác"].map(h => <th key={h} style={{ padding: 12, textAlign: "left", fontSize: 14 }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{ borderTop: "1px solid #eee" }}>
                    <td style={td}>#{o.id}</td>
                    <td style={td}>{o.user_name}</td>
                    <td style={td}>{parseInt(o.final_amount).toLocaleString()}đ</td>
                    <td style={td}>
                      <span style={{ fontSize: 12, padding: "2px 6px", borderRadius: 4, background: o.payment_status === "paid" ? "#e8f5e9" : "#fff3e0", color: o.payment_status === "paid" ? "#2e7d32" : "#e65100" }}>
                        {o.payment_status === "paid" ? "Đã TT" : "Chưa TT"}
                      </span>
                      {o.payment_status !== "paid" && o.status !== "cancelled" && o.status !== "delivered" && (
                        <button onClick={() => updatePayment(o.id)} style={{ marginLeft: 6, padding: "2px 6px", fontSize: 11, background: "#1565c0", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>Xác nhận TT</button>
                      )}
                    </td>
                    <td style={td}>
                      <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: (statusColor[o.status] || "#999") + "20", color: statusColor[o.status] || "#999" }}>{statusLabel[o.status] || o.status}</span>
                    </td>
                    <td style={td}>
                      {o.status === "confirmed" ? (
                        <select onChange={e => assignShipper(o.id, e.target.value)} style={{ padding: 6, fontSize: 12, borderRadius: 4, border: "1px solid #ddd" }}>
                          <option value="">Chọn shipper...</option>
                          {shippers.map(s => <option key={s.id} value={s.id}>{s.fullname} ({s.active_deliveries} đơn)</option>)}
                        </select>
                      ) : <span style={{ fontSize: 12, color: "#666" }}>-</span>}
                    </td>
                    <td style={td}>
                      {(o.status === "confirmed" || o.status === "shipping") && (
                        <button onClick={() => cancelOrder(o.id)} style={{ padding: "4px 10px", fontSize: 11, background: "#c62828", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>Hủy</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SHIPPERS TAB */}
      {tab === "shippers" && (
        <div>
          <p style={{ color: "#666" }}>{shippers.length} shipper</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {shippers.map(s => (
              <div key={s.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #eee", overflow: "hidden" }}>
                <div onClick={() => toggleShipperDeliveries(s.id)} style={{ padding: 16, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontWeight: 600, margin: 0 }}>{s.fullname}</p>
                    <p style={{ color: "#666", fontSize: 13, margin: "2px 0" }}>{s.email} | {s.phone}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: s.status === "active" ? "#e8f5e9" : "#ffebee", color: s.status === "active" ? "#2e7d32" : "#c62828" }}>{s.status}</span>
                    <p style={{ fontSize: 13, color: "#666", margin: "4px 0 0" }}>{s.active_deliveries} đơn đang giao</p>
                  </div>
                </div>

                {expandedShipper === s.id && shipperDeliveries[s.id] && (
                  <div style={{ padding: "0 16px 16px", borderTop: "1px solid #eee" }}>
                    <p style={{ fontWeight: 600, color: "#666", fontSize: 13, margin: "8px 0" }}>Các đơn đang giao:</p>
                    {shipperDeliveries[s.id].length === 0
                      ? <p style={{ fontSize: 13, color: "#999" }}>Không có đơn nào</p>
                      : shipperDeliveries[s.id].map(d => (
                        <div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0", fontSize: 13 }}>
                          <span>Đơn #{d.order_id} - {d.customer_name}</span>
                          <span style={{ padding: "1px 6px", borderRadius: 3, fontSize: 11, background: "#e3f2fd", color: "#1565c0" }}>{d.shipping_status}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {tab === "users" && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}>
              <option value="">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="shopowner">Shop Owner</option>
              <option value="shipper">Shipper</option>
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
                    <button onClick={() => toggleUserStatus(u.id)} style={{ padding: "6px 12px", fontSize: 12, background: u.status === "active" ? "#fff" : "#2e7d32", color: u.status === "active" ? "#c62828" : "#fff", border: "1px solid", borderColor: u.status === "active" ? "#c62828" : "#2e7d32", borderRadius: 4, cursor: "pointer" }}>
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