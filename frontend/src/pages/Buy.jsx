import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Buy() {
  const navigate = useNavigate();
  const [coins, setCoins] = useState([]);
  const [symbol, setSymbol] = useState("");
  const [amount, setAmount] = useState("");
  const [isBuying, setIsBuying] = useState(false);
  const [isLoadingCoins, setIsLoadingCoins] = useState(true);
  const [error, setError] = useState(null);

  // load coins & set default symbol
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    let mounted = true;
    const load = async () => {
      setIsLoadingCoins(true);
      setError(null);
      try {
        const res = await api.get("/coins");
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data : res.data?.coins || [];
        setCoins(data);
        setSymbol((data[0]?.symbol || "BTC").toUpperCase());
        setIsLoadingCoins(false);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError(err?.response?.data?.message || "Failed to load coins.");
        setIsLoadingCoins(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const getPriceForSymbol = (sym) => {
    const lower = (sym || "BTC").toString().toLowerCase();
    const c = coins.find(
      (x) =>
        (x.symbol || "").toString().toLowerCase() === lower ||
        (x.id || "").toString().toLowerCase() === lower
    );
    if (c && (c.price || c.currentPrice || c.lastPrice)) {
      return Number(c.price || c.currentPrice || c.lastPrice);
    }
    if (lower === "btc") return 72000;
    if (lower === "eth") return 4200;
    return 1;
  };

  const handleBuy = async (e) => {
    e.preventDefault();
    setError(null);

    if (!symbol) {
      setError("Please select a coin.");
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    const price = getPriceForSymbol(symbol);

    setIsBuying(true);
    try {
      await api.post("/transactions/buy", {
        symbol,
        amount: Number(amount),
        price,
      });

      // success
      setIsBuying(false);
      // notify Dashboard in same tab
      window.dispatchEvent(new Event("refreshDashboard"));
      // notify Dashboard in other tabs (storage event)
      localStorage.setItem("lastTxAt", Date.now().toString());

      alert("Purchase successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setIsBuying(false);
      setError(err?.response?.data?.message || "Purchase failed. Try again.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.45,
          background:
            "radial-gradient(circle at 15% 40%, rgba(139,92,246,0.18), transparent 28%), radial-gradient(circle at 85% 70%, rgba(59,130,246,0.12), transparent 30%)",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "3rem",
          top: "6rem",
          width: "22rem",
          height: "22rem",
          background: "#a855f7",
          borderRadius: "9999px",
          filter: "blur(60px)",
          opacity: 0.22,
          mixBlendMode: "multiply",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "3rem",
          top: "10rem",
          width: "20rem",
          height: "20rem",
          background: "#3b82f6",
          borderRadius: "9999px",
          filter: "blur(60px)",
          opacity: 0.2,
          mixBlendMode: "multiply",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", width: "100%", maxWidth: "32rem", zIndex: 10 }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "inline-block",
              padding: "6px",
              borderRadius: "1rem",
              marginBottom: "0.9rem",
              background: "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #EC4899 100%)",
            }}
          >
            <div
              style={{
                width: "4.2rem",
                height: "4.2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "1rem",
                background: "#0f172a",
                boxShadow: "0 15px 25px -8px rgba(0,0,0,0.45)",
              }}
            >
              <span style={{ color: "white", fontSize: "1.9rem", fontWeight: 800 }}>₿</span>
            </div>
          </div>
          <h1 style={{ fontSize: "2.1rem", fontWeight: 800, color: "white", margin: 0 }}>Buy Crypto</h1>
          <p style={{ color: "#9ca3af", marginTop: "0.35rem" }}>Securely purchase crypto</p>
        </div>

        <div
          style={{
            padding: "6px",
            borderRadius: "1.2rem",
            background:
              "linear-gradient(135deg, rgba(139, 92, 246, 0.45) 0%, rgba(59, 130, 246, 0.35) 50%, rgba(236, 72, 153, 0.35) 100%)",
          }}
        >
          <div
            style={{
              padding: "1.6rem",
              borderRadius: "1rem",
              background: "rgba(15,23,42,0.95)",
              boxShadow: "0 30px 50px -20px rgba(0,0,0,0.6)",
            }}
          >
            <form onSubmit={handleBuy} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* coin selector */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ color: "#d1d5db", fontSize: "0.95rem", fontWeight: 600 }}>Select Coin</label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  disabled={isLoadingCoins}
                  style={{
                    width: "100%",
                    padding: "0.9rem 1rem",
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(139,92,246,0.25)",
                    background: "rgba(255,255,255,0.02)",
                    color: "white",
                    fontWeight: 700,
                    outline: "none",
                  }}
                >
                  {isLoadingCoins ? (
                    <option>Loading...</option>
                  ) : coins.length === 0 ? (
                    <option>BTC</option>
                  ) : (
                    coins.map((c) => (
                      <option key={c.symbol || c.id} value={(c.symbol || c.id).toUpperCase()}>
                        {(c.name || c.symbol || c.id).toString()}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* amount */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ color: "#d1d5db", fontSize: "0.95rem", fontWeight: 600 }}>Amount</label>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount (in units of coin eg. 250)"
                  inputMode="decimal"
                  style={{
                    width: "100%",
                    padding: "0.9rem 1rem",
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(139,92,246,0.25)",
                    background: "rgba(255,255,255,0.02)",
                    color: "white",
                    outline: "none",
                  }}
                />
              </div>

              {/* price preview */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#9ca3af", fontSize: "0.95rem" }}>
                <div>Estimated price per unit</div>
                <div style={{ fontWeight: 800, color: "#fff" }}>₹{getPriceForSymbol(symbol).toLocaleString()}</div>
              </div>

              {/* error */}
              {error && (
                <div style={{ padding: "0.75rem", borderRadius: "0.6rem", background: "rgba(239,68,68,0.06)", color: "#fecaca", fontSize: "0.95rem" }}>
                  {error}
                </div>
              )}

              {/* buttons */}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="submit"
                  disabled={isBuying}
                  style={{
                    flex: 1,
                    padding: "0.9rem",
                    borderRadius: "0.75rem",
                    border: "none",
                    fontWeight: 800,
                    color: "white",
                    cursor: isBuying ? "not-allowed" : "pointer",
                    background: "linear-gradient(135deg, #3b82f6, #8B5CF6)",
                  }}
                >
                  {isBuying ? "Processing..." : `Buy ${symbol || "BTC"}`}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  style={{
                    padding: "0.9rem",
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.02)",
                    color: "#d1d5db",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* footer note */}
        <div style={{ marginTop: "1rem", textAlign: "center", color: "#9ca3af", fontSize: "0.9rem" }}>
          Prices are indicative. Final price will be confirmed at checkout.
        </div>
      </div>

      {/* ✅ Only this CSS added */}
      <style>{`
        select option {
          color: #000 !important;
          background-color: #fff !important;
        }
      `}</style>
    </div>
  );
}
