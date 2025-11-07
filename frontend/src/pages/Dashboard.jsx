import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState([]);
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
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [profileRes, coinsRes] = await Promise.all([
          api.get("/auth/profile"),
          api.get("/coins"),
        ]);
        if (!mounted) return;
        setUser(profileRes.data.user);
        setCoins(Array.isArray(coinsRes.data) ? coinsRes.data : coinsRes.data?.coins || []);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setIsLoading(false);
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError(err?.response?.data?.message || "Failed to load dashboard data.");
        }
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    navigate("/login");
  };

  return (
    <div className="dashboard-root">
      {/* visual background */}
      <div className="bg-overlay" />
      <div className="bg-blob blob-left" />
      <div className="bg-blob blob-right" />

      <div className="dashboard-grid">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-inner">
            <div className="brand-row">
              <div className="brand-icon">₿</div>
              <div className="brand-text">
                <div className="brand-title">CryptoTrade</div>
                <div className="brand-sub">Secure · Fast · Reliable</div>
              </div>
            </div>

            <div className="user-block">
              {user ? (
                <>
                  <div className="user-sub">Signed in as</div>
                  <div className="user-name">{user.name}</div>
                  <div className="user-email">{user.email}</div>
                </>
              ) : (
                <div className="user-sub">No user info</div>
              )}
            </div>

            <div className="sidebar-actions">
              <button className="btn-primary" onClick={() => navigate("/buy")}>Buy Crypto</button>
              <button className="btn-ghost" onClick={() => navigate("/transactions")}>View Transactions</button>
              <button className="btn-danger" onClick={logout}>Logout</button>
            </div>

            <div className="account-meta">
              <div className="meta-row"><strong>Account</strong></div>
              <div className="meta-row">
                <span>Security</span>
                <span className="meta-value">Enabled</span>
              </div>
              <div className="meta-row">
                <span>2FA</span>
                <span className="meta-value">{user?.twoFactorEnabled ? "On" : "Off"}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="main-area">
          <header className="main-header">
            <div>
              <h1 className="main-title">Dashboard</h1>
              <p className="main-sub">
                {user ? (
                  <>Welcome, <span className="highlight">{user.name}</span></>
                ) : "Welcome"}
              </p>
            </div>

            <div className="account-status">
              <div className="status-label">Account status</div>
              <div className="status-value">Active</div>
            </div>
          </header>

          <section className="content-area">
            {isLoading ? (
              <div className="loading">Loading data...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : (
              <>
                <h2 className="section-title">Available Coins</h2>

                {coins.length === 0 ? (
                  <div className="empty">No coins available right now.</div>
                ) : (
                  <div className="coins-grid">
                    {coins.map((coin) => (
                      <div className="coin-card" key={coin.id || coin.symbol || coin.name}>
                        <div className="coin-top">
                          <div className="coin-meta">
                            <div className="coin-badge">{(coin.symbol || "₿").slice(0, 2).toUpperCase()}</div>
                            <div className="coin-info">
                              <div className="coin-name">{coin.name}</div>
                              <div className="coin-symbol">{coin.symbol?.toUpperCase()}</div>
                            </div>
                          </div>

                          <div className="coin-price">
                            <div className="price-text">{coin.price ? `₹${Number(coin.price).toLocaleString()}` : "-"}</div>
                            <div className={`price-change ${coin.changePercent && coin.changePercent < 0 ? "neg" : "pos"}`}>
                              {coin.changePercent ? `${coin.changePercent}%` : ""}
                            </div>
                          </div>
                        </div>

                        <div className="coin-actions">
                          <button className="btn-primary" onClick={() => navigate(`/buy?coin=${coin.symbol || coin.id}`)}>Buy</button>
                          <button className="btn-outline" onClick={() => navigate(`/coins/${coin.symbol || coin.id}`)}>Details</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>

      <style>{`
        /* Root & background */
        .dashboard-root {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background: #0f172a;
          color: white;
          padding: 3.2rem; /* increased root padding */
          box-sizing: border-box;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }

        .bg-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.5;
          background: radial-gradient(circle at 12% 40%, rgba(139,92,246,0.22), transparent 30%),
                      radial-gradient(circle at 85% 75%, rgba(59,130,246,0.16), transparent 30%);
          z-index: 0;
        }

        .bg-blob {
          position: absolute;
          width: 28rem;
          height: 28rem;
          border-radius: 9999px;
          mix-blend-mode: multiply;
          filter: blur(60px);
          opacity: 0.25;
          z-index: 0;
          animation: pulse 4s ease-in-out infinite;
        }
        .bg-blob.blob-left { left: 3rem; top: 6rem; background: #a855f7; transform: translateZ(0); }
        .bg-blob.blob-right { right: 3rem; top: 12rem; background: #3b82f6; animation-delay: 1.6s; }

        /* Grid layout - responsive */
        .dashboard-grid {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1300px; /* allow a bit more width */
          display: grid;
          grid-template-columns: 360px 1fr; /* widened sidebar */
          gap: 2.4rem; /* increased gap */
        }

        /* Sidebar */
        .sidebar {
          align-self: start;
        }
        .sidebar-inner {
          padding: 1.6rem; /* increased */
          border-radius: 1rem;
          background: linear-gradient(135deg, rgba(139,92,246,0.06), rgba(59,130,246,0.03));
          backdrop-filter: blur(6px);
        }
        .brand-row { display: flex; gap: 1rem; align-items: center; margin-bottom: 1.25rem; }
        .brand-icon { width: 3.6rem; height: 3.6rem; border-radius: 0.8rem; background: linear-gradient(135deg,#8B5CF6,#3B82F6); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.25rem; }
        .brand-title { font-weight:800; font-size:1.05rem; color: #fff; }
        .brand-sub { color: #9ca3af; font-size:0.85rem; }

        .user-block { margin-bottom: 1.25rem; }
        .user-sub { color: #9ca3af; font-size:0.9rem; margin-bottom: 0.35rem; }
        .user-name { font-weight:700; font-size:1.05rem; color:white; }
        .user-email { color:#9ca3af; font-size:0.9rem; }

        .sidebar-actions { display:flex; flex-direction:column; gap:0.75rem; margin-bottom: 1.25rem; }
        .btn-primary { padding:0.85rem 1rem; border-radius:0.65rem; border:none; cursor:pointer; background: linear-gradient(135deg,#3b82f6,#8B5CF6); color: white; font-weight:700; }
        .btn-ghost { padding:0.85rem 1rem; border-radius:0.65rem; border:1px solid rgba(255,255,255,0.04); background: rgba(255,255,255,0.02); color:#d1d5db; cursor:pointer; font-weight:600; }
        .btn-danger { padding:0.85rem 1rem; border-radius:0.65rem; border:none; background:#ef4444; color:white; cursor:pointer; font-weight:700; }

        .account-meta { margin-top: 1rem; color:#9ca3af; font-size:0.9rem; }
        .meta-row { display:flex; justify-content:space-between; margin-top:0.5rem; }
        .meta-value { color: #60a5fa; }

        /* Main area */
        .main-area {
          padding: 1.6rem;
          border-radius: 1rem;
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          backdrop-filter: blur(6px);
          min-height: 420px;
        }

        .main-header { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1.4rem; }
        .main-title { margin:0; font-size:1.6rem; }
        .main-sub { margin:0; color:#9ca3af; font-size:0.95rem; }
        .highlight { color:#60a5fa; font-weight:700; }

        .account-status { text-align:right; }
        .status-label { color:#9ca3af; font-size:0.85rem; }
        .status-value { color:#34d399; font-weight:700; margin-top:0.15rem; }

        .content-area { }

        .loading, .empty, .error { padding:1.2rem; border-radius:0.6rem; background: rgba(255,255,255,0.02); color:#9ca3af; }

        .error { background: rgba(239,68,68,0.06); color: #fecaca; }

        .section-title { margin-top: 0; margin-bottom: 1rem; font-size:1.15rem; }

        /* Coins grid */
        .coins-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); /* slightly larger cards */
          gap: 1.2rem; /* more breathing room */
        }

        .coin-card {
          padding: 1rem; /* increased */
          border-radius: 0.8rem;
          background: rgba(15,23,42,0.86);
          border: 1px solid rgba(255,255,255,0.03);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 120px;
        }

        .coin-top { display:flex; align-items:center; justify-content:space-between; gap:0.75rem; margin-bottom:0.65rem; }
        .coin-meta { display:flex; align-items:center; gap:0.75rem; }
        .coin-badge { width: 2.6rem; height: 2.6rem; border-radius:0.6rem; display:flex; align-items:center; justify-content:center; font-weight:700; background: linear-gradient(135deg,#8B5CF6,#60A5FA); }
        .coin-name { font-weight:700; font-size:1rem; }
        .coin-symbol { color:#9ca3af; font-size:0.85rem; }

        .coin-price { text-align:right; }
        .price-text { font-weight:700; }
        .price-change.pos { color:#34d399; font-size:0.85rem; }
        .price-change.neg { color:#f87171; font-size:0.85rem; }

        .coin-actions { display:flex; gap:0.6rem; margin-top:0.4rem; }
        .btn-outline { flex:1; padding:0.6rem; border-radius:0.6rem; background: rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.04); color:#d1d5db; cursor:pointer; font-weight:600; }

        /* Animations */
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity: 0.24; }
          50% { transform: scale(1.03); opacity: 0.32; }
        }

        /* Responsive behaviour */
        @media (max-width: 1000px) {
          .dashboard-grid { grid-template-columns: 300px 1fr; gap: 1.6rem; max-width: 1100px; }
          .sidebar-inner { padding: 1.4rem; }
          .main-area { padding: 1.4rem; }
          .dashboard-root { padding: 2.4rem; }
          .coins-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
        }

        @media (max-width: 880px) {
          /* Stack sidebar above main on narrow screens */
          .dashboard-grid { grid-template-columns: 1fr; }
          .sidebar { order: 0; }
          .main-area { order: 1; margin-top: 0.8rem; }
          .dashboard-root { padding: 1.2rem; }
          .bg-blob { display: none; } /* hide large blobs on very small screens */
        }

        @media (min-width: 1600px) {
          /* enlarge layout slightly on very wide screens */
          .dashboard-grid { max-width: 1500px; grid-template-columns: 420px 1fr; gap: 3rem; }
          .sidebar-inner { padding: 2rem; }
          .main-area { padding: 2rem; min-height: 600px; }
          .coins-grid { gap: 1.6rem; }
          .coin-card { padding: 1.25rem; }
        }
      `}</style>
    </div>
  );
}
