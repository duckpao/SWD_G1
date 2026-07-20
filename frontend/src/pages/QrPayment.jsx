import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, CheckCircle, Copy } from "lucide-react";

const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use((c) => { c.headers.Authorization = "Bearer " + localStorage.getItem("token"); return c; });

export default function QrPayment() {
  const { orderId } = useParams();
  const nav = useNavigate();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    api.get("/payments/qr/" + orderId).then(r => setQrData(r.data)).catch(e => { alert("Lỗi: " + (e.response?.data?.message || e.message)); nav("/orders"); }).finally(() => setLoading(false));
  }, [orderId]);

  const doConfirm = async () => {
    try {
      const r = await api.post("/payments/confirm/" + orderId);
      setPaid(true);
      setTimeout(() => nav("/orders/" + orderId), 1500);
    } catch (e) { alert(e.response?.data?.message || "Lỗi xác nhận"); }
  };

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  if (loading) return <p>Đang tải...</p>;
  if (paid) return (
    <div style={{ textAlign: "center", padding: 60 }}>
      <CheckCircle size={64} color="#2e7d32" />
      <h2>Thanh toán thành công!</h2>
      <p>Đang chuyển về đơn hàng...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <button onClick={() => nav(-1)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: "#666", marginBottom: 16 }}>
        <ArrowLeft size={18} /> Quay lại
      </button>

      <h1 style={{ color: "#2e7d32", textAlign: "center" }}>Thanh toán bằng VietQR</h1>
      <p style={{ textAlign: "center", color: "#666" }}>Quét mã QR bằng ứng dụng ngân hàng để chuyển khoản</p>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #eee", padding: 24, marginBottom: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img src={qrData?.qrUrl} alt="QR Payment" style={{ width: 260, height: 260, borderRadius: 8, border: "1px solid #ddd" }}
            onError={(e) => { e.target.style.display = "none"; document.getElementById("qrFallback").style.display = "block"; }} />
          <div id="qrFallback" style={{ display: "none", padding: 40, background: "#f0f0f0", borderRadius: 8 }}>
            <p style={{ fontSize: 14, color: "#666" }}>Không thể tải mã QR. Vui lòng chuyển khoản thủ công theo thông tin bên dưới.</p>
          </div>
        </div>

        <div style={{ background: "#f9f9f9", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>Thông tin chuyển khoản</h3>

          <InfoRow label="Ngân hàng" value={qrData?.bankInfo?.bank} onCopy={() => copyText(qrData?.bankInfo?.bank, "bank")} copied={copied === "bank"} />
          <InfoRow label="Số tài khoản" value={qrData?.bankInfo?.accountNumber} onCopy={() => copyText(qrData?.bankInfo?.accountNumber, "account")} copied={copied === "account"} />
          <InfoRow label="Chủ tài khoản" value={qrData?.bankInfo?.accountName} onCopy={() => copyText(qrData?.bankInfo?.accountName, "name")} copied={copied === "name"} />
          <InfoRow label="Số tiền" value={parseInt(qrData?.amount || 0).toLocaleString() + "đ"} />
          <InfoRow label="Nội dung" value={qrData?.bankInfo?.content} onCopy={() => copyText(qrData?.bankInfo?.content, "content")} copied={copied === "content"} />
        </div>

        <div style={{ background: "#fff8e1", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13, color: "#e65100" }}>
          <strong>Hướng dẫn:</strong> Mở ứng dụng ngân hàng &gt; Quét mã QR &gt; Kiểm tra thông tin &gt; Xác nhận chuyển tiền &gt; Quay lại đây bấm "Đã chuyển khoản"
        </div>

        <button onClick={doConfirm} style={{ width: "100%", padding: 14, background: "#2e7d32", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <CheckCircle size={20} /> Đã chuyển khoản
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value, onCopy, copied }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #eee", fontSize: 14 }}>
      <span style={{ color: "#666", minWidth: 100 }}>{label}</span>
      <span style={{ fontWeight: 500, textAlign: "right", wordBreak: "break-all" }}>{value}</span>
      {onCopy && (
        <button onClick={onCopy} style={{ background: "none", border: "none", cursor: "pointer", marginLeft: 8, color: copied ? "#2e7d32" : "#1565c0", fontSize: 12, display: "flex", alignItems: "center", gap: 2 }}>
          <Copy size={14} /> {copied ? "Đã sao chép" : "Sao chép"}
        </button>
      )}
    </div>
  );
}