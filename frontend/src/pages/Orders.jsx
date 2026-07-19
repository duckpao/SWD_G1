import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orders as orderApi } from "../api";
import { Package } from "lucide-react";

const statusColor = { pending: "#f57c00", confirmed: "#1565c0", shipping: "#7b1fa2", delivered: "#2e7d32", cancelled: "#c62828", returned: "#c62828" };
const statusLabel = { pending: "Chờ xác nhận", confirmed: "Đã xác nhận", shipping: "Đang giao", delivered: "Đã giao", cancelled: "Đã hủy", returned: "Trả hàng" };

export default function Orders() {
  const [list, setList] = useState([]);

  useEffect(() => { orderApi.list().then(setList).catch(() => {}); }, []);

  return (
    <div>
      <h1 style={{ color: "#2e7d32" }}><Package size={28} style={{ verticalAlign: "middle", marginRight: 8 }} />Đơn hàng của tôi</h1>
      {list.length === 0 ? <p style={{ color: "#999" }}>Chưa có đơn hàng nào.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {list.map((o) => (
            <Link to={"/orders/" + o.id} key={o.id} style={{ textDecoration: "none", color: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: "#fff", borderRadius: 12, border: "1px solid #eee" }}>
              <div>
                <p style={{ fontWeight: 600, margin: 0 }}>Đơn hàng #{o.id}</p>
                <p style={{ color: "#666", fontSize: 13, margin: "4px 0" }}>{new Date(o.order_date).toLocaleDateString("vi-VN")}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: "bold", color: "#2e7d32", margin: 0 }}>{parseInt(o.final_amount).toLocaleString()}đ</p>
                <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: (statusColor[o.status] || "#999") + "20", color: statusColor[o.status] || "#999" }}>{statusLabel[o.status] || o.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}