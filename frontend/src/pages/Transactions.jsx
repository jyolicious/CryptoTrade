import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Transactions() {
  const navigate = useNavigate();
  const [txs, setTxs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get("/transactions");
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data : res.data?.transactions || [];
        setTxs(data);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError(err?.response?.data?.message || "Failed to load transactions.");
        setIsLoading(false);
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const formatPrice = (p) => {
    if (p == null || p === "") return "-";
    const num = Number(p);
    if (isNaN(num)) return p;
    return `₹${num.toLocaleString()}`;
  };

  const formatAmount = (a) => {
    if (a == null || a === "") return "-";
    const num = Number(a);
    if (isNaN(num)) return a;
    return Number.isInteger(num) ? num.toString() : num.toFixed(6).replace(/\.?0+$/, "");
  };

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d || "-";
    }
  };

  return (
    <div className="tx-root">
      <div className="bg-overlay" />
      <div className="bg-blob blob-left" />
      <div className="container">
        <div className="header">
          <div>
            <h2 className="title">Transaction History</h2>
            <p className="subtitle">All your completed buys and sells — most recent first.</p>
          </div>
          <div>
            <button className="btn-back" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
          </div>
        </div>

        <div className="card">
          {isLoading ? (
            <div className="empty">Loading transactions…</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : txs.length === 0 ? (
            <div className="empty">No transactions yet. Make your first purchase to get started.</div>
          ) : (
            <div className="table-wrap">
              <table className="tx-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Symbol</th>
                    <th>Amount</th>
                    <th>Price / Unit</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {txs.map((tx) => {
                    const total =
                      tx.price != null && tx.amount != null
                        ? Number(tx.price) * Number(tx.amount)
                        : null;
                    return (
                      <tr key={tx._id || tx.id || `${tx.type}-${tx.date}`}>
                        <td className={`type ${tx.type?.toLowerCase() === "buy" ? "buy" : "sell"}`}>
                          {tx.type?.toUpperCase() || "-"}
                        </td>
                        <td className="mono">{(tx.symbol || tx.coin || "-").toUpperCase()}</td>
                        <td className="mono">{formatAmount(tx.amount)}</td>
                        <td className="mono">{formatPrice(tx.price)}</td>
                        <td className="mono">{total != null ? `₹${total.toLocaleString()}` : "-"}</td>
                        <td className="mono">{formatDate(tx.date)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* Root layout */
        .tx-root {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background: #0f172a;
          color: #fff;
          padding: 3rem;
          box-sizing: border-box;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }

        .bg-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.45;
          background: radial-gradient(circle at 12% 40%, rgba(139,92,246,0.22), transparent 30%),
                      radial-gradient(circle at 85% 75%, rgba(59,130,246,0.16), transparent 30%);
          z-index: 0;
        }
        .bg-blob {
          position: absolute;
          width: 26rem;
          height: 26rem;
          border-radius: 9999px;
          mix-blend-mode: multiply;
          filter: blur(60px);
          opacity: 0.22;
          z-index: 0;
          animation: pulse 4s ease-in-out infinite;
        }
        .bg-blob.blob-left { left: 2rem; top: 6rem; background: #a855f7; }

        /* Container */
        .container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1200px;
          display: flex;
          flex-direction: column;
          gap: 1.6rem;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .title { margin: 0; font-size: 1.8rem; font-weight: 800; }
        .subtitle { margin: 0; color: #9ca3af; font-size: 0.97rem; margin-top: 0.2rem; }

        .btn-back {
          padding: 0.7rem 1rem;
          border-radius: 0.7rem;
          background: linear-gradient(135deg,#3b82f6,#8B5CF6);
          border: none;
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        .card {
          padding: 1rem;
          border-radius: 1rem;
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          backdrop-filter: blur(6px);
          box-shadow: 0 30px 50px -20px rgba(0,0,0,0.6);
        }

        /* Table wrapper for horizontal scroll on small screens */
        .table-wrap {
          overflow: auto;
        }

        .tx-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 820px; /* ensure good spacing on wide screens */
        }

        .tx-table thead tr {
          background: rgba(255,255,255,0.02);
        }
        .tx-table th, .tx-table td {
          padding: 1rem 1.1rem;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 0.95rem;
        }

        .tx-table thead th {
          color: #cbd5e1;
          text-transform: uppercase;
          font-size: 0.82rem;
          letter-spacing: 0.06em;
        }

        .tx-table tbody tr:hover {
          background: rgba(255,255,255,0.01);
        }

        .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace; }

        .type {
          padding: 0.6rem 0.9rem;
          border-radius: 0.6rem;
          display: inline-block;
          font-weight: 800;
          font-size: 0.86rem;
        }
        .type.buy { background: rgba(34,197,94,0.12); color: #34d399; }
        .type.sell { background: rgba(239,68,68,0.08); color: #f87171; }

        .empty, .error {
          padding: 1.2rem;
          border-radius: 0.6rem;
          background: rgba(255,255,255,0.02);
          color: #9ca3af;
          font-size: 0.98rem;
        }
        .error { background: rgba(239,68,68,0.06); color: #fecaca; }

        @keyframes pulse {
          0%,100% { transform: scale(1); opacity: 0.22; }
          50% { transform: scale(1.03); opacity: 0.28; }
        }

        /* Responsive adjustments */
        @media (max-width: 1100px) {
          .tx-table { min-width: 700px; }
          .container { max-width: 980px; }
        }

        @media (max-width: 880px) {
          .tx-root { padding: 1.2rem; }
          .bg-blob { display: none; }
          .tx-table { min-width: 640px; }
          .title { font-size: 1.4rem; }
          .btn-back { padding: 0.6rem 0.9rem; }
        }
      `}</style>
    </div>
  );
}
