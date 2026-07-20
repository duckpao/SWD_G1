import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cart as cartApi, orders as orderApi, addresses as addrApi } from "../api";

export default function Checkout() {
  const nav = useNavigate();
  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const [addrs, setAddrs] = useState([]);
  const [form, setForm] = useState({ recipientName: "", phone: "", shippingAddress: "", paymentMethod: "COD", voucherCode: "", note: "" });
  const [err, setErr] = useState("");

  useEffect(() => { cartApi.get().then(setCart).catch(() => {}); }, []);
  useEffect(() => { addrApi.list().then(setAddrs).catch(() => {}); }, []);

  const defaultAddr = addrs.find((a) => a.is_default);
  useEffect(() => {
    if (defaultAddr && !form.shippingAddress) {
      setForm((f) => ({
        ...f, recipientName: defaultAddr.recipient_name || "", phone: defaultAddr.phone || "",
        shippingAddress: [defaultAddr.street_address, defaultAddr.ward, defaultAddr.district, defaultAddr.city].filter(Boolean).join(", "),
      }));
    }
  }, [defaultAddr]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.recipientName || !form.phone || !form.shippingAddress) return setErr("Vui lòng điền đầy đủ thông tin giao hàng!");
    setErr("");
    try {
      const body = { ...form, voucherCode: form.voucherCode || undefined, note: form.note || undefined };
      const order = await orderApi.create(body);

      if (form.paymentMethod === "VNPay" || form.paymentMethod === "VietQR") {
        nav("/payment/qr/" + order.id);
      } else {
        alert("Đặt hàng thành công! Mã đơn: #" + order.id);
        nav("/orders/" + order.id);
      }
    } catch (e) { setErr(e.response?.data?.message || "Đặt hàng thất bại"); }
  };

  const total = cart.subtotal + (cart.subtotal >= 200000 ? 0 : 15000);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>
      <form onSubmit={submit}>
        <h2 style={{ color: "#2e7d32" }}>Thông tin giao hàng</h2>
        {err && <p style={{ color: "#c62828" }}>{err}</p>}

        {addrs.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Địa chỉ đã lưu:</p>
            <select onChange={(e) => {
              const a = addrs.find((x) => x.id == e.target.value);
              if (a) setForm((f) => ({ ...f, recipientName: a.recipient_name, phone: a.phone, shippingAddress: [a.street_address, a.ward, a.district, a.city].filter(Boolean).join(", ") }));
            }} style={inp}>
              <option value="">Chọn địa chỉ...</option>
              {addrs.map((a) => <option key={a.id} value={a.id}>{a.street_address}, {a.district} {a.is_default ? "(Mặc định)" : ""}</option>)}
            </select>
          </div>
        )}

        <input placeholder="Người nhận" value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} style={inp} required />
        <input placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inp} required />
        <textarea placeholder="Địa chỉ giao hàng" value={form.shippingAddress} onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} style={{ ...inp, minHeight: 80 }} required />

        <h3 style={{ marginTop: 24 }}>Phương thức thanh toán</h3>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          {[
            { id: "COD", label: "Tiền mặt (COD)", icon: "💵" },
            { id: "VietQR", label: "VietQR - Quét mã", icon: "📱" },
            { id: "VNPay", label: "VNPay", icon: "🏦" },
          ].map((m) => (
            <label key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", border: form.paymentMethod === m.id ? "2px solid #2e7d32" : "1px solid #ddd", borderRadius: 8, cursor: "pointer", background: form.paymentMethod === m.id ? "#e8f5e9" : "#fff" }}>
              <input type="radio" name="pm" value={m.id} checked={form.paymentMethod === m.id} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} />
              {m.icon} {m.label}
            </label>
          ))}
        </div>

        <input placeholder="Mã giảm giá (nếu có)" value={form.voucherCode} onChange={(e) => setForm({ ...form, voucherCode: e.target.value })} style={inp} />
        <textarea placeholder="Ghi chú (không bắt buộc)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} style={{ ...inp, minHeight: 60, marginTop: 12 }} />

        <button style={{ width: "100%", padding: 14, background: "#2e7d32", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer", marginTop: 20 }}>
          {form.paymentMethod === "COD" ? "Đặt hàng" : "Tiếp tục thanh toán"}
        </button>
      </form>

      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 20, position: "sticky", top: 80 }}>
        <h3 style={{ margin: "0 0 16px" }}>Đơn hàng</h3>
        {cart.items.map((item) => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
            <span>{item.product_name} x{item.quantity}</span>
            <span>{((item.variant_price || item.base_price) * item.quantity).toLocaleString()}đ</span>
          </div>
        ))}
        <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid #eee" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span>Tạm tính</span><span>{cart.subtotal.toLocaleString()}đ</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span>Phí ship</span><span>{cart.subtotal >= 200000 ? "Miễn phí" : "15,000đ"}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: "bold", marginTop: 8 }}><span>Tổng</span><span style={{ color: "#2e7d32" }}>{total.toLocaleString()}đ</span></div>
      </div>
    </div>
  );
}
const inp = { display: "block", width: "100%", padding: 12, border: "1px solid #ddd", borderRadius: 8, fontSize: 15, marginBottom: 12, boxSizing: "border-box" };