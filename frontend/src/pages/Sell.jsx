import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

export default function Sell() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const paramCoin = (params.get("coin") || "").toUpperCase();

  const [coins, setCoins] = useState([]);
  const [symbol, setSymbol] = useState(paramCoin || "");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper: parse number safely
  const safeNum = (v) => {
    if (v == null || v === "") return null;
    const n = Number(String(v).replace(/[, ]+/g, ""));
    return Number.isFinite(n) ? n : null;
  };

  // Load coins and default values
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/coins");
        const data = Array.isArray(res.data) ? res.data : res.data?.coins || [];
        setCoins(data);

        // Default symbol
        const first = paramCoin || (data[0]?.symbol || "").toUpperCase();
        setSymbol(first);

        // Default price for first coin
        const coin = data.find((c) => (c.symbol || "").toUpperCase() === first);
        if (coin) {
          const keys = ["price", "currentPrice", "lastPrice", "rate", "market_price", "value"];
          for (const k of keys) {
            if (coin[k]) {
              setPrice(String(coin[k]));
              break;
            }
          }
        }
      } catch (err) {
        console.error("Failed to load coins:", err);
      }
    };
    load();
  }, [paramCoin]);

  // Update price when symbol changes
  useEffect(() => {
    if (!symbol || coins.length === 0) return;
    const coin = coins.find((c) => (c.symbol || "").toUpperCase() === symbol);
    if (coin) {
      const keys = ["price", "currentPrice", "lastPrice", "rate", "market_price", "value"];
      for (const k of keys) {
        if (coin[k]) {
          setPrice(String(coin[k]));
          return;
        }
      }
    }
    setPrice("");
  }, [symbol, coins]);

  const handleSell = async (e) => {
    e.preventDefault();
    setError(null);

    if (!symbol) return setError("Select a coin.");
    const amount = safeNum(qty);
    const unitPrice = safeNum(price);
    if (!amount || amount <= 0) return setError("Enter valid quantity.");
    if (!unitPrice || unitPrice <= 0) return setError("Enter valid price.");

    try {
      setLoading(true);
      await api.post("/transactions/sell", { symbol, amount, price: unitPrice });
      window.dispatchEvent(new Event("refreshDashboard"));
      localStorage.setItem("lastTxAt", Date.now().toString());
      alert("Sell order executed!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Sell failed.");
    } finally {
      setLoading(false);
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
      {/* Blurred gradients */}
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

      {/* Card Container */}
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
          <h1
            style={{
              fontSize: "2.1rem",
              fontWeight: 800,
              color: "white",
              margin: 0,
            }}
          >
            Sell Crypto
          </h1>
          <p style={{ color: "#9ca3af", marginTop: "0.35rem" }}>
            Securely sell your holdings
          </p>
        </div>

        {/* Gradient Border Box */}
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
            <form
              onSubmit={handleSell}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {/* Coin selector */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label
                  style={{
                    color: "#d1d5db",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                  }}
                >
                  Select Coin
                </label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.9rem 1rem",
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(139,92,246,0.25)",
                    background: "rgba(255,255,255,0.02)",
                    color: "white",
                    fontWeight: 700,
                    outline: "none",
                    appearance: "none",
                  }}
                >
                  {coins.map((c) => (
                    <option
                      key={c.symbol}
                      value={c.symbol.toUpperCase()}
                      style={{ background: "#fff", color: "#000" }}
                    >
                      {c.name || c.symbol}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity input */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label
                  style={{
                    color: "#d1d5db",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                  }}
                >
                  Quantity (units)
                </label>
                <input
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="Enter quantity to sell"
                  type="number"
                  step="any"
                  min="0"
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

              {/* Price input */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label
                  style={{
                    color: "#d1d5db",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                  }}
                >
                  Unit price (INR)
                </label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter or auto-filled price"
                  type="number"
                  step="any"
                  min="0"
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

              {error && (
                <div
                  style={{
                    padding: "0.75rem",
                    borderRadius: "0.6rem",
                    background: "rgba(239,68,68,0.06)",
                    color: "#fecaca",
                    fontSize: "0.95rem",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "0.9rem",
                    borderRadius: "0.75rem",
                    border: "none",
                    fontWeight: 800,
                    color: "white",
                    cursor: loading ? "not-allowed" : "pointer",
                    background: "linear-gradient(135deg, #ef4444, #f87171)",
                  }}
                >
                  {loading ? "Processing..." : `Sell ${symbol || ""}`}
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

        {/* Footer note */}
        <div
          style={{
            marginTop: "1rem",
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "0.9rem",
          }}
        >
          Prices are indicative. Final price will be confirmed at checkout.
        </div>
      </div>

      <style>{`
        select option {
          background: #fff !important;
          color: #000 !important;
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity: 0.22; }
          50% { transform: scale(1.03); opacity: 0.28; }
        }
        @media (max-width: 880px) {
          div[style*="max-width: '32rem'"] { max-width: calc(100% - 2rem); }
        }
      `}</style>
    </div>
  );
}
