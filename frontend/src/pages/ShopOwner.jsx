import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, BarChart3, ClipboardList, Star, Plus } from 'lucide-react';

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((c) => { c.headers.Authorization = 'Bearer ' + localStorage.getItem('token'); return c; });

const statusColor = { pending: '#f57c00', confirmed: '#1565c0', shipping: '#7b1fa2', delivered: '#2e7d32', cancelled: '#c62828' };
const statusLabel = { pending: 'Chờ duyệt', confirmed: 'Đã duyệt', shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy' };

export default function ShopOwner() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [tab, setTab] = useState('inventory');
  const [orders, setOrders] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', base_price: '', stock_quantity: 0, origin: '', unit: 'kg', category_id: '' });
  const [categories, setCategories] = useState([]);

  useEffect(() => { if (user.role !== 'shopowner') nav('/'); }, []);

  const load = (t) => {
    if (t === 'inventory') {
      api.get('/shop/products').then(r => setProducts(r.data)).catch(() => {});
      api.get('/products/categories').then(r => setCategories(r.data)).catch(() => {});
    }
    if (t === 'orders') { api.get('/shop/orders').then(r => setOrders(r.data)).catch(() => {}); api.get('/shop/shippers').then(r => setShippers(r.data)).catch(() => {}); }
    if (t === 'sales') api.get('/shop/sales').then(r => setSales(r.data)).catch(() => {});
    if (t === 'reviews') api.get('/shop/reviews').then(r => setReviews(r.data)).catch(() => {});
  };
  useEffect(() => { load(tab); }, [tab]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await api.put('/shop/products/' + editId, form); } else { await api.post('/shop/products', form); }
      setShowForm(false); setEditId(null); setForm({ name: '', description: '', base_price: '', stock_quantity: 0, origin: '', unit: 'kg', category_id: '' });
      load('inventory');
    } catch (e) { alert(e.response?.data?.message || 'Lỗi'); }
  };

  const doDelete = async (id) => { if (confirm('Xóa sản phẩm này?')) { await api.delete('/shop/products/' + id); load('inventory'); } };

  const assignShipper = async (orderId, shipperId) => {
    if (!shipperId) return alert('Chọn shipper!');
    try { await api.put('/shop/orders/' + orderId + '/assign-shipper', { shipperId: parseInt(shipperId) }); load('orders'); } catch (e) { alert(e.response?.data?.message || 'Lỗi'); }
  };

  const cancelOrder = async (orderId, label) => {
    const reason = prompt('Lý do ' + label + ' (không bắt buộc):');
    if (reason === null) return;
    try { await api.put('/shop/orders/' + orderId + '/cancel', { reason: reason || (label === 'từ chối' ? 'Shop từ chối' : 'Shop hủy') }); load('orders'); } catch (e) { alert(e.response?.data?.message || 'Lỗi'); }
  };

  const editProduct = (p) => {
    setEditId(p.id);
    setForm({ name: p.name, description: p.description || '', base_price: p.base_price, stock_quantity: p.stock_quantity || 0, origin: p.origin || '', unit: p.unit || 'kg', category_id: p.category_id || '' });
    setShowForm(true);
  };

  const tabs = [
    { key: 'inventory', label: 'Quản lý hàng hóa', icon: <Package size={18} /> },
    { key: 'orders', label: 'Đơn hàng', icon: <ClipboardList size={18} /> },
    { key: 'sales', label: 'Bán hàng', icon: <BarChart3 size={18} /> },
    { key: 'reviews', label: 'Đánh giá', icon: <Star size={18} /> },
  ];

  const renderStars = (n) => {
    return Array(5).fill(0).map((_, i) => <span key={i} style={{ color: i < n ? '#f57c00' : '#ddd', fontSize: 16 }}>★</span>);
  };

  const td = { padding: 10, fontSize: 14 };
  const inp = { width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 15, boxSizing: 'border-box' };

  return (
    <div>
      <h1 style={{ color: '#2e7d32' }}>Quản lý cửa hàng</h1>
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '12px 20px', border: 'none', background: tab === t.key ? '#2e7d32' : '#eee', color: tab === t.key ? '#fff' : '#333', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'inventory' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ color: '#666' }}>{products.length} mặt hàng</span>
            <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', description: '', base_price: '', stock_quantity: 0, origin: '', unit: 'kg', category_id: '' }); }} style={{ padding: '10px 20px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={18} /> Thêm mặt hàng
            </button>
          </div>

          {showForm && (
            <form onSubmit={submit} style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #eee', marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input placeholder='Tên sản phẩm *' value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inp} required />
              <input placeholder='Giá *' type='number' value={form.base_price} onChange={e => setForm({...form, base_price: e.target.value})} style={inp} required />
              <textarea placeholder='Mô tả' value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{...inp, minHeight: 60, gridColumn: '1/-1'}} />
              <input placeholder='Số lượng tồn' type='number' value={form.stock_quantity} onChange={e => setForm({...form, stock_quantity: parseInt(e.target.value) || 0})} style={inp} />
              <input placeholder='Xuất xứ' value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} style={inp} />
              <input placeholder='Đơn vị (kg, quả...)' value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} style={inp} />
              <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} style={inp}>
                <option value=''>Chọn danh mục</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8 }}>
                <button style={{ padding: '10px 24px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{editId ? 'Cập nhật' : 'Thêm mới'}</button>
                <button type='button' onClick={() => { setShowForm(false); setEditId(null); }} style={{ padding: '10px 24px', background: '#fff', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer' }}>Hủy</button>
              </div>
            </form>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
              <thead style={{ background: '#f5f5f5' }}>
                <tr>{['Tên', 'Danh mục', 'Giá', 'Tồn kho', 'Đơn vị', 'Xuất xứ', 'Trạng thái', 'Hành động'].map(h => <th key={h} style={{ padding: 12, textAlign: 'left', fontSize: 14 }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
                    <td style={td}>{p.name}</td>
                    <td style={td}>{p.category_name || '-'}</td>
                    <td style={td}>{parseInt(p.base_price).toLocaleString()}đ</td>
                    <td style={td}><span style={{ fontWeight: 600, color: p.stock_quantity > 10 ? '#2e7d32' : p.stock_quantity > 0 ? '#e65100' : '#c62828' }}>{p.stock_quantity}</span></td>
                    <td style={td}>{p.unit}</td>
                    <td style={td}>{p.origin || '-'}</td>
                    <td style={td}><span style={{ color: p.is_available ? '#2e7d32' : '#c62828', fontWeight: 600 }}>{p.is_available ? 'Đang bán' : 'Ngừng'}</span></td>
                    <td style={td}>
                      <button onClick={() => editProduct(p)} style={{ padding: '6px 12px', fontSize: 12, background: '#1565c0', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 4 }}>Sửa</button>
                      <button onClick={() => doDelete(p.id)} style={{ padding: '6px 12px', fontSize: 12, background: '#c62828', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div>
          <p style={{ color: '#666' }}>{orders.length} đơn hàng</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
              <thead style={{ background: '#f5f5f5' }}>
                <tr>{['Mã ĐH', 'Khách', 'Tổng', 'Thanh toán', 'Trạng thái', 'Người giao', 'Thao tác'].map(h => <th key={h} style={{ padding: 12, textAlign: 'left', fontSize: 14 }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{ borderTop: '1px solid #eee' }}>
                    <td style={td}>#{o.id}</td>
                    <td style={td}>{o.user_name}</td>
                    <td style={td}>{parseInt(o.final_amount).toLocaleString()}đ</td>
                    <td style={td}><span style={{ fontSize: 12, padding: '2px 6px', borderRadius: 4, background: o.payment_status === 'paid' ? '#e8f5e9' : '#fff3e0', color: o.payment_status === 'paid' ? '#2e7d32' : '#e65100' }}>{o.payment_status === 'paid' ? 'Đã TT' : 'Chưa TT'}</span></td>
                    <td style={td}><span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: (statusColor[o.status] || '#999') + '20', color: statusColor[o.status] || '#999' }}>{statusLabel[o.status] || o.status}</span></td>
                    <td style={td}>
                      {o.status === 'confirmed' ? (
                        <select onChange={e => assignShipper(o.id, e.target.value)} style={{ padding: 6, fontSize: 12, borderRadius: 4, border: '1px solid #ddd' }}>
                          <option value=''>Chọn shipper...</option>
                          {shippers.map(s => <option key={s.id} value={s.id}>{s.fullname}</option>)}
                        </select>
                      ) : <span style={{ fontSize: 12, color: '#999' }}>{o.status === 'shipping' ? 'Đã giao shipper' : o.status === 'delivered' ? 'Đã giao' : '-'}</span>}
                    </td>
                    <td style={td}>
                      {o.status === 'pending' && <button onClick={() => cancelOrder(o.id, 'từ chối')} style={{ padding: '6px 12px', fontSize: 12, background: '#c62828', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Từ chối</button>}
                      {o.status === 'confirmed' && <button onClick={() => cancelOrder(o.id, 'hủy')} style={{ padding: '6px 12px', fontSize: 12, background: '#c62828', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Hủy</button>}
                      {o.status === 'shipping' && <button onClick={() => cancelOrder(o.id, 'hủy')} style={{ padding: '6px 12px', fontSize: 12, background: '#e65100', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Hủy</button>}
                      {o.status === 'delivered' && <span style={{ fontSize: 12, color: '#2e7d32' }}>Hoàn thành</span>}
                      {o.status === 'cancelled' && <span style={{ fontSize: 12, color: '#999' }}>Đã hủy</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'sales' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #eee' }}>
              <p style={{ color: '#666', margin: 0, fontSize: 13 }}>Tổng đơn</p>
              <p style={{ fontSize: 28, fontWeight: 'bold', margin: '8px 0', color: '#2e7d32' }}>{orders.length}</p>
            </div>
            <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #eee' }}>
              <p style={{ color: '#666', margin: 0, fontSize: 13 }}>Doanh thu</p>
              <p style={{ fontSize: 28, fontWeight: 'bold', margin: '8px 0', color: '#2e7d32' }}>{orders.reduce((s, o) => s + (o.payment_status === 'paid' ? parseFloat(o.final_amount) : 0), 0).toLocaleString()}đ</p>
            </div>
            <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #eee' }}>
              <p style={{ color: '#666', margin: 0, fontSize: 13 }}>Đã giao</p>
              <p style={{ fontSize: 28, fontWeight: 'bold', margin: '8px 0', color: '#2e7d32' }}>{orders.filter(o => o.status === 'delivered').length}</p>
            </div>
            <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #eee' }}>
              <p style={{ color: '#666', margin: 0, fontSize: 13 }}>Tồn kho</p>
              <p style={{ fontSize: 28, fontWeight: 'bold', margin: '8px 0', color: '#2e7d32' }}>{products.reduce((s, i) => s + i.stock_quantity, 0)}</p>
            </div>
          </div>
          <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #eee' }}>
            <h3 style={{ margin: '0 0 16px' }}>Đơn hàng gần đây</h3>
            {orders.slice(0, 10).map(o => (
              <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span>#{o.id} - {o.user_name}</span>
                <span style={{ fontWeight: 600 }}>{parseInt(o.final_amount).toLocaleString()}đ</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'reviews' && (
        <div>
          <p style={{ color: '#666' }}>{reviews.length} đánh giá từ khách hàng</p>
          {reviews.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', marginTop: 40 }}>Chưa có đánh giá nào.</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {reviews.map(r => (
                <div key={r.id} style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <strong style={{ fontSize: 14 }}>{r.product_name}</strong>
                    <span style={{ fontSize: 12, color: '#999' }}>{new Date(r.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    {renderStars(r.rating)}
                    <span style={{ fontSize: 12, color: '#666' }}>{r.user_name}</span>
                  </div>
                  {r.title && <p style={{ margin: '4px 0 2px', fontWeight: 600, fontSize: 14 }}>{r.title}</p>}
                  {r.comment && <p style={{ margin: 0, fontSize: 13, color: '#555', lineHeight: 1.5 }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}