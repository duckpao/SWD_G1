import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orders as orderApi, reviews as reviewApi } from "../api";
import { ArrowLeft, Star, MapPin, Phone, User, CreditCard } from "lucide-react";

const statusColor = { pending: "#f57c00", confirmed: "#1565c0", shipping: "#7b1fa2", delivered: "#2e7d32", cancelled: "#c62828", returned: "#c62828" };
const statusLabel = { pending: "Chờ xác nhận", confirmed: "Đã xác nhận", shipping: "Đang giao", delivered: "Đã giao", cancelled: "Đã hủy", returned: "Trả hàng" };

export default function OrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [order, setOrder] = useState(null);
  const [reviewForm, setReviewForm] = useState({ productId: "", rating: 5, title: "", comment: "" });

  const load = () => orderApi.detail(id).then(setOrder).catch(() => nav("/orders"));
  useEffect(() => { load(); }, [id]);

  const doCancel = async () => { if (confirm("Hủy đơn hàng này?")) { await orderApi.cancel(id, { reason: "Khách hủy" }); load(); } };
  const doConfirm = async () => { await orderApi.confirmDelivery(id); load(); };

  const submitReview = async (productId) => {
    try { await reviewApi.create({ productId, orderId: parseInt(id), rating: reviewForm.rating, title: reviewForm.title, comment: reviewForm.comment }); alert("Đánh giá thành công!"); setReviewForm({ productId: "", rating: 5, title: "", comment: "" }); } catch (e) { alert(e.response?.data?.message || "Lỗi"); }
  };

  if (!order) return <p>Đang tải...</p>;

  return (
    <div>
      <button onClick={() => nav("/orders")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: "#666", marginBottom: 16 }}><ArrowLeft size={18} /> Đơn hàng</button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, color: "#2e7d32" }}>Đơn hàng #{order.id}</h1>
        <span style={{ fontSize: 14, padding: "4px 12px", borderRadius: 4, background: (statusColor[order.status] || "#999") + "20", color: statusColor[order.status] || "#999", fontWeight: 600 }}>{statusLabel[order.status] || order.status}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#f9f9f9", padding: 16, borderRadius: 12 }}>
          <p style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><MapPin size={16} /> Địa chỉ giao hàng</p>
          <p style={{ margin: "4px 0" }}><User size={14} style={{ marginRight: 4 }} />{order.recipient_name}</p>
          <p style={{ margin: "4px 0" }}><Phone size={14} style={{ marginRight: 4 }} />{order.phone}</p>
          <p style={{ color: "#666" }}>{order.shipping_address}</p>
        </div>
        <div style={{ background: "#f9f9f9", padding: 16, borderRadius: 12 }}>
          <p style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><CreditCard size={16} /> Thanh toán</p>
          <p>{order.payment_method} • {order.payment_status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}</p>
          <p>Tạm tính: {parseInt(order.total_amount).toLocaleString()}đ</p>
          {parseInt(order.discount_amount) > 0 && <p>Giảm: -{parseInt(order.discount_amount).toLocaleString()}đ</p>}
          <p>Phí ship: {parseInt(order.shipping_fee).toLocaleString()}đ</p>
          <p style={{ fontSize: 18, fontWeight: "bold", color: "#2e7d32" }}>Tổng: {parseInt(order.final_amount).toLocaleString()}đ</p>
        </div>
      </div>

      <h3>Sản phẩm</h3>
      {order.items?.map((item) => (
        <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: "#fff", borderRadius: 8, border: "1px solid #eee", marginBottom: 8 }}>
          <div>
            <p style={{ fontWeight: 600, margin: 0 }}>{item.product_name} {item.variant_name && `(${item.variant_name})`}</p>
            <p style={{ color: "#666", fontSize: 13, margin: "2px 0" }}>x{item.quantity} • {parseInt(item.unit_price).toLocaleString()}đ</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontWeight: "bold", margin: 0 }}>{parseInt(item.subtotal).toLocaleString()}đ</p>
            {order.status === "delivered" && reviewForm.productId !== item.product_id && (
              <button onClick={() => setReviewForm({ ...reviewForm, productId: item.product_id })} style={{ fontSize: 12, padding: "4px 8px", background: "#fff", border: "1px solid #ddd", borderRadius: 4, cursor: "pointer", marginTop: 4 }}>Đánh giá</button>
            )}
            {reviewForm.productId === item.product_id && (
              <div style={{ fontSize: 13, marginTop: 8 }}>
                <div style={{ display: "flex", gap: 2 }}>{[1,2,3,4,5].map((s) => <Star key={s} size={16} fill={s <= reviewForm.rating ? "#f59e0b" : "#ddd"} color={s <= reviewForm.rating ? "#f59e0b" : "#ddd"} style={{ cursor: "pointer" }} onClick={() => setReviewForm({ ...reviewForm, rating: s })} />)}</div>
                <input placeholder="Tiêu đề" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} style={{ padding: 6, border: "1px solid #ddd", borderRadius: 4, width: "100%", marginTop: 4, fontSize: 12 }} />
                <input placeholder="Nhận xét" value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} style={{ padding: 6, border: "1px solid #ddd", borderRadius: 4, width: "100%", marginTop: 4, fontSize: 12 }} />
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  <button onClick={() => submitReview(item.product_id)} style={{ padding: "4px 8px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>Gửi</button>
                  <button onClick={() => setReviewForm({ productId: "", rating: 5, title: "", comment: "" })} style={{ padding: "4px 8px", background: "#fff", border: "1px solid #ddd", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>Hủy</button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {order.status === "pending" && <button onClick={doCancel} style={{ padding: 12, background: "#c62828", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, marginTop: 16 }}>Hủy đơn hàng</button>}
      {order.status === "shipping" && <button onClick={doConfirm} style={{ padding: 12, background: "#2e7d32", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, marginTop: 16 }}>Đã nhận được hàng</button>}
    </div>
  );
}