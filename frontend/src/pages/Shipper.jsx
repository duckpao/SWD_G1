import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Truck, Package, MapPin } from "lucide-react";

const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use((c) => { c.headers.Authorization = "Bearer " + localStorage.getItem("token"); return c; });

export default function Shipper() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => { if (user.role !== "Người giao") nav("/"); }, []);

  const load = () => api.get("/shipper/deliveries").then(r => setDeliveries(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const doPickup = async (id) => {
    try { await api.put("/shipper/deliveries/" + id + "/pickup"); load(); }
    catch (e) { alert(e.response?.data?.message || "Lỗi"); }
  };

  const doDeliver = async (id) => {
    if (!confirm("Xác nhận giao hàng thành công?")) return;
    try { await api.put("/shipper/deliveries/" + id + "/deliver"); load(); }
    catch (e) { alert(e.response?.data?.message || "Lỗi"); }
  };

  const statusColor = { assigned: "#f57c00", picked_up: "#1565c0", in_transit: "#7b1fa2", delivered: "#2e7d32", failed: "#c62828" };
  const statusLabel = { assigned: "Chờ lấy hàng", picked_up: "Đã lấy", in_transit: "Đang giao", delivered: "Đã giao", failed: "Thất bại" };

  return (
    <div>
      <h1 style={{ color: "#2e7d32" }}><Truck size={28} style={{ verticalAlign: "middle", marginRight: 8 }} />Đơn giao hàng của tôi</h1>
      <p style={{ color: "#666" }}>{deliveries.length} đơn</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {deliveries.map(d => (
          <div key={d.id} style={{ background: "#fff", padding: 16, borderRadius: 12, border: "1px solid #eee" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
              <div>
                <p style={{ fontWeight: 600, margin: 0 }}>Đơn hàng #{d.order_id}</p>
                <p style={{ fontSize: 13, color: "#666", margin: "4px 0" }}>{d.customer_name} - {d.recipient_phone || d.phone}</p>
              </div>
              <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 4, background: (statusColor[d.shipping_status] || "#999") + "20", color: statusColor[d.shipping_status] || "#999", fontWeight: 600 }}>
                {statusLabel[d.shipping_status] || d.shipping_status}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 14, marginBottom: 12 }}>
              <div>
                <p style={{ margin: 0, color: "#666", fontSize: 12 }}>Lấy hàng tại</p>
                <p style={{ margin: "2px 0" }}><MapPin size={14} style={{ verticalAlign: "middle" }} /> {d.pickup_address}</p>
              </div>
              <div>
                <p style={{ margin: 0, color: "#666", fontSize: 12 }}>Giao đến</p>
                <p style={{ margin: "2px 0" }}><MapPin size={14} style={{ verticalAlign: "middle" }} /> {d.delivery_address}</p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "bold", color: "#2e7d32" }}>{parseInt(d.final_amount).toLocaleString()}đ</span>
              <div style={{ display: "flex", gap: 8 }}>
                {d.shipping_status === "assigned" && (
                  <button onClick={() => doPickup(d.id)} style={{ padding: "8px 16px", background: "#1565c0", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                    <Package size={16} style={{ verticalAlign: "middle", marginRight: 4 }} /> Đã lấy hàng
                  </button>
                )}
                {(d.shipping_status === "picked_up" || d.shipping_status === "in_transit") && (
                  <button onClick={() => doDeliver(d.id)} style={{ padding: "8px 16px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                    Giao thành công
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}