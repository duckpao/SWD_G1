import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cart as cartApi } from "../api";
import { getProductImage } from "../assets/images";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";

export default function Cart() {
  const nav = useNavigate();
  const [data, setData] = useState({ items: [], subtotal: 0 });
  const [voucher, setVoucher] = useState("");
  const [voucherResult, setVoucherResult] = useState(null);

  const load = () => cartApi.get().then(setData).catch(() => {});
  useEffect(() => { load(); }, []);

  const updateQty = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    try { await cartApi.update(item.id, { quantity: newQty }); load(); } catch (e) { alert(e.response?.data?.message || "Lỗi"); }
  };

  const remove = async (id) => { try { await cartApi.remove(id); load(); } catch { /* ignore */ } };

  const applyVoucher = async () => {
    if (!voucher) return;
    try { const r = await cartApi.applyVoucher({ code: voucher, subtotal: data.subtotal }); setVoucherResult(r); } catch (e) { alert(e.response?.data?.message || "Mã không hợp lệ!"); }
  };

  const discount = voucherResult?.discount || 0;
  const shipping = data.subtotal >= 200000 ? 0 : 15000;
  const total = Math.max(0, data.subtotal - discount + shipping);

  return (
    <div>
      <h1 style={{ color: "#2e7d32" }}><ShoppingBag size={28} style={{ verticalAlign: "middle", marginRight: 8 }} />Giỏ hàng</h1>
      {data.items.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#999" }}>
          <p style={{ fontSize: 48, margin: 0 }}>🛒</p>
          <p>Giỏ hàng trống</p>
          <Link to="/" style={{ color: "#2e7d32" }}>Tiếp tục mua sắm</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.items.map((item) => (
              <div key={item.id} style={{ display: "flex", gap: 16, padding: 16, background: "#fff", borderRadius: 12, border: "1px solid #eee", alignItems: "center" }}>
                <div style={{ width: 64, height: 64, background: "#f0f0f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>🍎</div>
                <div style={{ flex: 1 }}>
                  <Link to={"/products/" + item.product_id} style={{ fontWeight: 600, textDecoration: "none", color: "#333" }}>{item.product_name}</Link>
                  {item.variant_name && <span style={{ color: "#666", fontSize: 13, display: "block" }}>{item.variant_name}</span>}
                  <p style={{ color: "#2e7d32", fontWeight: "bold", margin: "4px 0" }}>{(item.variant_price || item.base_price)?.toLocaleString()}đ</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button onClick={() => updateQty(item, -1)} style={qBtn}><Minus size={16} /></button>
                  <span style={{ minWidth: 30, textAlign: "center", fontWeight: 600 }}>{item.quantity}</span>
                  <button onClick={() => updateQty(item, 1)} style={qBtn}><Plus size={16} /></button>
                </div>
                <p style={{ fontWeight: "bold", minWidth: 80, textAlign: "right" }}>{(item.variant_price || item.base_price) * item.quantity}đ</p>
                <button onClick={() => remove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#c62828", padding: 8 }}><Trash2 size={18} /></button>
              </div>
            ))}
          </div>

          <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 20, position: "sticky", top: 80 }}>
            <h3 style={{ margin: "0 0 16px" }}>Tổng cộng</h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span>Tạm tính</span><span>{data.subtotal.toLocaleString()}đ</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span>Giảm giá</span><span style={{ color: "#e65100" }}>-{discount.toLocaleString()}đ</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}><span>Phí ship</span><span>{shipping === 0 ? "Miễn phí" : shipping.toLocaleString() + "đ"}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: "bold", marginBottom: 16 }}><span>Thành tiền</span><span style={{ color: "#2e7d32" }}>{total.toLocaleString()}đ</span></div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input placeholder="Mã giảm giá" value={voucher} onChange={(e) => setVoucher(e.target.value)} style={{ flex: 1, padding: 10, border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }} />
              <button onClick={applyVoucher} style={{ padding: "10px 16px", background: "#1565c0", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Áp dụng</button>
            </div>
            {voucherResult && <p style={{ color: "#2e7d32", fontSize: 13 }}>Giảm {discount.toLocaleString()}đ với mã "{voucher}"</p>}

            <button onClick={() => nav("/checkout")} style={{ width: "100%", padding: 14, background: "#2e7d32", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
              Thanh toán
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
const qBtn = { padding: 6, border: "1px solid #ddd", borderRadius: 4, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center" };
