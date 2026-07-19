import { useState, useEffect } from "react";
import { addresses as addrApi } from "../api";
import { MapPin, Plus, Star, Trash2 } from "lucide-react";

export default function Addresses() {
  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ recipient_name: "", phone: "", street_address: "", ward: "", district: "", city: "", is_default: false });
  const [editId, setEditId] = useState(null);

  const load = () => addrApi.list().then(setList).catch(() => {});
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await addrApi.update(editId, form); } else { await addrApi.add(form); }
      setShowForm(false); setEditId(null); setForm({ recipient_name: "", phone: "", street_address: "", ward: "", district: "", city: "", is_default: false });
      load();
    } catch (e) { alert("Lỗi: " + (e.response?.data?.message || e.message)); }
  };

  const remove = async (id) => { if (confirm("Xóa địa chỉ này?")) { await addrApi.remove(id); load(); } };
  const setDefault = async (id) => { await addrApi.setDefault(id); load(); };

  const edit = (a) => { setForm(a); setEditId(a.id); setShowForm(true); };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ color: "#2e7d32", margin: 0 }}><MapPin size={28} style={{ verticalAlign: "middle", marginRight: 8 }} />Địa chỉ giao hàng</h1>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ recipient_name: "", phone: "", street_address: "", ward: "", district: "", city: "", is_default: false }); }} style={{ padding: "10px 20px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
          <Plus size={18} /> Thêm địa chỉ
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} style={{ background: "#fff", padding: 20, borderRadius: 12, border: "1px solid #eee", marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 16px" }}>{editId ? "Sửa" : "Thêm"} địa chỉ</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input placeholder="Người nhận *" value={form.recipient_name} onChange={(e) => setForm({ ...form, recipient_name: e.target.value })} style={inp} required />
            <input placeholder="Số điện thoại *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inp} required />
          </div>
          <textarea placeholder="Địa chỉ *" value={form.street_address} onChange={(e) => setForm({ ...form, street_address: e.target.value })} style={{ ...inp, minHeight: 60 }} required />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <input placeholder="Phường/Xã" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} style={inp} />
            <input placeholder="Quận/Huyện" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} style={inp} />
            <input placeholder="Thành phố" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={inp} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0" }}>
            <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
            Đặt làm địa chỉ mặc định
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ padding: "10px 24px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>{editId ? "Cập nhật" : "Thêm"}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} style={{ padding: "10px 24px", background: "#fff", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer" }}>Hủy</button>
          </div>
        </form>
      )}

      {list.length === 0 ? <p style={{ color: "#999" }}>Chưa có địa chỉ nào.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {list.map((a) => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: "#fff", borderRadius: 12, border: "1px solid #eee" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <strong>{a.recipient_name}</strong> <span style={{ color: "#666" }}>| {a.phone}</span>
                  {a.is_default ? <span style={{ fontSize: 12, padding: "2px 8px", background: "#e8f5e9", color: "#2e7d32", borderRadius: 4, display: "flex", alignItems: "center", gap: 4 }}><Star size={12} /> Mặc định</span> : null}
                </div>
                <p style={{ color: "#666", margin: "4px 0" }}>{[a.street_address, a.ward, a.district, a.city].filter(Boolean).join(", ")}</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {!a.is_default && <button onClick={() => setDefault(a.id)} style={{ padding: "6px 12px", fontSize: 12, background: "#fff", border: "1px solid #ddd", borderRadius: 4, cursor: "pointer" }}>Đặt mặc định</button>}
                <button onClick={() => edit(a)} style={{ padding: "6px 12px", fontSize: 12, background: "#fff", border: "1px solid #ddd", borderRadius: 4, cursor: "pointer" }}>Sửa</button>
                <button onClick={() => remove(a.id)} style={{ padding: "6px 12px", fontSize: 12, background: "#fff", border: "1px solid #c62828", color: "#c62828", borderRadius: 4, cursor: "pointer" }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
const inp = { width: "100%", padding: 12, border: "1px solid #ddd", borderRadius: 8, fontSize: 15, boxSizing: "border-box" };