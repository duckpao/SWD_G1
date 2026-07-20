import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { products } from "../api";
import { getProductImage } from "../assets/images";
import { Search, Star } from "lucide-react";

export default function Products() {
  const [list, setList] = useState([]);
  const [cats, setCats] = useState([]);
  const [q, setQ] = useState({ search: "", categoryId: "", sortBy: "newest", sortOrder: "desc", page: 1, limit: 20 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { products.categories().then(setCats).catch(() => {}); }, []);
  useEffect(() => {
    let ignore = false;
    async function loadProducts() {
      setLoading(true);
      const params = {};
      if (q.search) params.search = q.search;
      if (q.categoryId) params.categoryId = q.categoryId;
      params.sortBy = q.sortBy;
      params.sortOrder = q.sortOrder;
      params.page = q.page;
      params.limit = q.limit;
      try {
        const items = await products.list(params);
        if (!ignore) setList(items);
      } catch {
        // ignore
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadProducts();
    return () => { ignore = true; };
  }, [q]);

  const fmt = (n) => parseInt(n).toLocaleString() + "đ";

  return (
    <div>
      <h1 style={{ color: "#2e7d32" }}>Sản phẩm</h1>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", background: "#f5f5f5", borderRadius: 8, padding: "0 12px" }}>
          <Search size={18} color="#999" />
          <input placeholder="Tìm kiếm..." value={q.search} onChange={(e) => setQ({ ...q, search: e.target.value, page: 1 })} style={{ border: "none", background: "none", padding: 10, flex: 1, outline: "none" }} />
        </div>
        <select value={q.categoryId} onChange={(e) => setQ({ ...q, categoryId: e.target.value, page: 1 })} style={sel}>
          <option value="">Tất cả danh mục</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={q.sortBy} onChange={(e) => setQ({ ...q, sortBy: e.target.value })} style={sel}>
          <option value="newest">Mới nhất</option>
          <option value="price">Giá</option>
          <option value="rating">Đánh giá</option>
          <option value="popularity">Bán chạy</option>
        </select>
        <select value={q.sortOrder} onChange={(e) => setQ({ ...q, sortOrder: e.target.value })} style={sel}>
          <option value="desc">Giảm dần</option>
          <option value="asc">Tăng dần</option>
        </select>
      </div>

      {loading ? <p>Đang tải...</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {list.map((p) => (
            <Link to={"/products/" + p.id} key={p.id} style={{ textDecoration: "none", color: "inherit", background: "#fff", borderRadius: 12, border: "1px solid #eee", overflow: "hidden", transition: "box-shadow .2s" }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.1)"}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = "none"}>
              <div style={{ height: 160, background: "#f0f0f0", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {(() => { const img = getProductImage(p); return img ? <img src={img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 48 }}>🍎</span>; })()}</div>
              <div style={{ padding: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>{p.name}</h3>
                <p style={{ color: "#666", fontSize: 13, margin: "4px 0" }}>{p.origin}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {[1,2,3,4,5].map((s) => <Star key={s} size={14} fill={s <= Math.round(p.avg_rating) ? "#f59e0b" : "#ddd"} color={s <= Math.round(p.avg_rating) ? "#f59e0b" : "#ddd"} />)}
                  <span style={{ fontSize: 12, color: "#999" }}>{"(" + p.total_sold + ")"}</span>
                </div>
                <p style={{ color: "#2e7d32", fontWeight: "bold", fontSize: 18, margin: "6px 0 0" }}>{fmt(p.base_price)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
const sel = { padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 14 };
