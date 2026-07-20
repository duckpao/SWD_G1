import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { products, cart as cartApi, reviews as reviewApi } from "../api";
import { getProductImage } from "../assets/images";
import { ShoppingCart, Star, ArrowLeft } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [p, setP] = useState(null);
  const [revs, setRevs] = useState([]);
  const [qty, setQty] = useState(1);
  const [vid, setVid] = useState(null);

  useEffect(() => { products.detail(id).then(setP).catch(() => nav("/")); }, [id, nav]);
  useEffect(() => { reviewApi.byProduct(id).then(setRevs).catch(() => {}); }, [id]);

  const add = async () => {
    if (!localStorage.getItem("token")) return nav("/login");
    try { await cartApi.add({ productId: parseInt(id), variantId: vid, quantity: qty }); alert("Đã thêm vào giỏ hàng!"); } catch (e) { alert(e.response?.data?.message || "Lỗi"); }
  };

  if (!p) return <p>Đang tải...</p>;
  const price = vid ? p.variants?.find((v) => v.id === vid)?.price : p.base_price;

  return (
    <div>
      <button onClick={() => nav(-1)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: "#666", marginBottom: 16 }}><ArrowLeft size={18} /> Quay lại</button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
        <div style={{ height: 360, background: "#f0f0f0", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80 }}>🍎</div>
        <div>
          <h1>{p.name}</h1>
          <p style={{ color: "#666" }}>{p.origin} • {p.unit}</p>
          <div style={{ display: "flex", gap: 2, margin: "8px 0" }}>
            {[1,2,3,4,5].map((s) => <Star key={s} size={16} fill={s <= Math.round(p.avg_rating) ? "#f59e0b" : "#ddd"} color={s <= Math.round(p.avg_rating) ? "#f59e0b" : "#ddd"} />)}
            <span style={{ fontSize: 13, color: "#999", marginLeft: 6 }}>{p.avg_rating} ({p.total_reviews} đánh giá) • Đã bán {p.total_sold}</span>
          </div>
          <p style={{ color: "#2e7d32", fontSize: 28, fontWeight: "bold" }}>{parseInt(price || p.base_price).toLocaleString()}đ</p>
          <p style={{ color: "#666", lineHeight: 1.6 }}>{p.description}</p>

          {p.variants?.length > 0 && (
            <div style={{ margin: "16px 0" }}>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>Chọn khối lượng:</p>
              <div style={{ display: "flex", gap: 8 }}>
                {p.variants.map((v) => (
                  <button key={v.id} onClick={() => { setVid(v.id); setQty(1); }}
                    style={{ padding: "8px 16px", borderRadius: 8, border: vid === v.id ? "2px solid #2e7d32" : "1px solid #ddd", background: vid === v.id ? "#e8f5e9" : "#fff", cursor: "pointer", fontWeight: vid === v.id ? 600 : 400 }}>
                    {v.name} - {parseInt(v.price).toLocaleString()}đ
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: 8 }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ padding: "8px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 18 }}>-</button>
              <span style={{ padding: "8px 16px", minWidth: 30, textAlign: "center" }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)} style={{ padding: "8px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 18 }}>+</button>
            </div>
            <button onClick={add} style={{ flex: 1, padding: 12, background: "#2e7d32", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <ShoppingCart size={20} /> Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: 40, color: "#333" }}>Đánh giá ({revs.length})</h2>
      {revs.length === 0 ? <p style={{ color: "#999" }}>Chưa có đánh giá nào.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {revs.map((r) => (
            <div key={r.id} style={{ background: "#f9f9f9", padding: 16, borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <strong>{r.user_name}</strong>
                <div style={{ display: "flex", gap: 2 }}>{[1,2,3,4,5].map((s) => <Star key={s} size={14} fill={s <= r.rating ? "#f59e0b" : "#ddd"} color={s <= r.rating ? "#f59e0b" : "#ddd"} />)}</div>
              </div>
              {r.title && <p style={{ fontWeight: 600, margin: "4px 0" }}>{r.title}</p>}
              {r.comment && <p style={{ color: "#555" }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
