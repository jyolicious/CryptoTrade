// ✅✅✅ ONLY CHANGED TWO THINGS AS REQUESTED ✅✅✅
// 1. Logout button moved to bottom (under news card)
// 2. Added extra spacing between Holdings and Available Coins

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import api from "../api";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, ArcElement);

const DEFAULT_PRICE_BY_SYMBOL = { BTC: 72000, ETH: 4200, SOL: 12000, BNB: 300, ADA: 40, XRP: 25, DOGE: 7, MATIC: 80 };
const MIN_FALLBACK_PRICE = 1;
const NEUTRAL_CARD_COLOR = "#0b1220";
const PRIMARY_GRADIENT = "linear-gradient(90deg,#376ef0,#8b5cf6)";

const fmtINR = (n) => (n == null || isNaN(Number(n)) ? "-" : "₹" + Number(n).toLocaleString());
const parseNumber = (v) => {
  if (v == null) return null;
  if (typeof v === "number") return v;
  const cleaned = String(v).replace(/[, ]+/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

const getCoinPriceFromCoinObj = (c) => {
  if (!c) return null;
  const keys = [
    "price",
    "currentPrice",
    "lastPrice",
    "rate",
    "market_price",
    "tickerPrice",
    "close",
    "value",
    "last_trade_price",
    "avgPrice",
  ];
  for (const k of keys) {
    if (c[k] != null) {
      const p = parseNumber(c[k]);
      if (p != null && p > 0) return p;
    }
  }
  if (c.quote?.INR || c.quote?.USD) {
    const q = c.quote.INR ?? c.quote.USD;
    const p = parseNumber(q?.price ?? q);
    if (p != null && p > 0) return p;
  }
  return null;
};

function synthPriceHistory(start, points = 30) {
  const arr = [];
  let price = start || 100;
  for (let i = points - 1; i >= 0; i--) {
    const drift = price * (Math.random() * 0.02 - 0.01);
    price = Math.max(0.01, price + drift);
    arr.unshift(Number(price.toFixed(2)));
  }
  return arr;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCoin, setSelectedCoin] = useState("BTC");
  const [priceHistory, setPriceHistory] = useState([]);

  const NEWS = useMemo(
    () => [
      { title: "Market Uptick", text: "Altcoins recovered steadily today with improved liquidity and rising trader confidence. Analysts expect momentum to continue if Bitcoin remains stable above support, encouraging selective re-entry into high-cap assets." },

      { title: "Whale Alert", text: "A dormant Bitcoin wallet moved a large amount of BTC, sparking speculation of potential sell pressure. Some analysts believe it may simply be internal repositioning by long-term holders adjusting for the next cycle." },

      { title: "Layer-2 Growth", text: "Multiple Layer-2 networks saw higher adoption thanks to lower fees and faster settlement speeds. Developers continue rolling out upgrades that enhance scalability, making these networks attractive for DeFi, gaming, and micro-transactions." },

      { title: "Regulation Watch", text: "New global regulatory discussions are pushing for better transparency in crypto transactions. Exchanges may face tighter compliance rules soon, impacting short-term volume but potentially improving long-term investor trust across markets." },

      { title: "DeFi Expansion", text: "A new DeFi protocol launched flexible staking pools offering competitive yields. Early incentives are drawing liquidity quickly as users test reward structures and evaluate long-term sustainability of the project’s tokenomics." },

      { title: "NFT Revival", text: "NFT marketplaces reported a rise in trading activity driven by interest in digital art and gaming assets. Analysts link this uptick to improved tools, curated drops, and renewed engagement from major creator communities." },

      { title: "Bitcoin Stability", text: "Bitcoin held within a narrow range today, indicating strong support from long-term holders. Traders are monitoring whether reduced volatility signals accumulation phases or precedes a larger move in the coming sessions." },

      { title: "Altcoin Momentum", text: "Mid-cap altcoins like SOL, ADA, and DOT displayed bullish momentum with rising volume. Market participants attribute the trend to ecosystem upgrades, expanding partnerships, and fresh liquidity entering staking and DeFi pools." },

      { title: "Exchange Upgrade", text: "A major crypto exchange rolled out performance improvements, lowering withdrawal delays and enhancing security checks. Users reported smoother order execution, which may boost intraday trading activity across spot and futures markets." },

      { title: "Macro Shift", text: "Global macro conditions improved slightly as inflation data stabilized, giving risk assets—including crypto—room to rebound. Investors remain cautious, watching for central bank updates that could influence market direction." },

      { title: "Gas Fee Drop", text: "Ethereum gas fees fell significantly amid lower network congestion. Traders took advantage of cheaper swaps and transfers, especially benefiting smaller wallets engaging in micro-trading and frequent DeFi interactions." },

      { title: "DeFi Security", text: "A leading audit firm flagged potential vulnerabilities in several new DeFi contracts. Developers are rolling out patches, while users are advised to review project risks before committing liquidity to unverified pools." },

      { title: "On-Chain Surge", text: "Blockchain analytics platforms reported an increase in active addresses and transactions across major networks. The rise suggests renewed retail participation as sentiment improves and market volatility begins to cool." },

      { title: "Mining Update", text: "Bitcoin miners saw improved profitability this week due to stable difficulty and rising transaction fees. Many are upgrading infrastructure in anticipation of future price moves and higher block reward competition." },

      { title: "Stablecoin Flow", text: "Stablecoin inflows into exchanges increased notably, often a precursor to heightened trading activity. Analysts suggest traders may be positioning for upcoming volatility events or reacting to changing macroeconomic signals." },
  ],
    []
  );

  const [newsIndex, setNewsIndex] = useState(0);
  const [newsPaused, setNewsPaused] = useState(false);

  useEffect(() => {
    if (newsPaused) return;
    const t = setInterval(() => setNewsIndex((i) => (i + 1) % NEWS.length), 10000);
    return () => clearInterval(t);
  }, [NEWS.length, newsPaused]);

  const normalizeType = (tx) => {
    const t = (tx.type || tx.side || tx.action || tx.transactionType || "").toString().toUpperCase();
    if (t.includes("BUY") || t === "B") return "BUY";
    if (t.includes("SELL") || t === "S") return "SELL";
    return null;
  };
  const getQuantityFromTx = (tx) => {
    if (!tx) return 0;
    const fields = ["quantity", "qty", "units", "amount", "filledQuantity", "unit"];
    for (const f of fields) {
      if (tx[f] != null) {
        const n = parseNumber(tx[f]);
        if (n != null) return n;
      }
    }
    const moneyFields = ["value", "total", "money"];
    const priceFields = ["price", "unitPrice", "rate", "txPrice"];
    const money = moneyFields.map((k) => parseNumber(tx[k])).find((v) => v != null);
    const price = priceFields.map((k) => parseNumber(tx[k])).find((v) => v != null);
    if (money != null && price != null && price !== 0) return money / price;
    if (tx.meta?.filled) {
      const n = parseNumber(tx.meta.filled);
      if (n != null) return n;
    }
    return 0;
  };
  const getSymbolFromTx = (tx) =>
    (
      (tx.symbol ||
        tx.coinSymbol ||
        tx.asset ||
        tx.currency ||
        tx.ticker ||
        tx.instrument ||
        tx.id ||
        ""
      ) + ""
    ).toUpperCase();

  const getBestPriceForSymbol = (symbol) => {
    if (!symbol) return MIN_FALLBACK_PRICE;
    const sym = String(symbol).toUpperCase();
    const coin = coins.find((c) =>
      ((c.symbol || c.ticker || c.id || c.name) || "").toString().toUpperCase() === sym
    );
    const priceFromCoin = getCoinPriceFromCoinObj(coin);
    if (priceFromCoin && priceFromCoin > 0) return priceFromCoin;
    if (DEFAULT_PRICE_BY_SYMBOL[sym]) return DEFAULT_PRICE_BY_SYMBOL[sym];
    return MIN_FALLBACK_PRICE;
  };

  const buildPortfolio = (txs, coinsData) => {
    const grouped = {};
    (txs || []).forEach((tx) => {
      if (!tx) return;
      const symbol = getSymbolFromTx(tx);
      if (!symbol) return;
      const type = normalizeType(tx) || "BUY";
      const qty = getQuantityFromTx(tx) || 0;
      if (!grouped[symbol]) grouped[symbol] = 0;
      if (type === "BUY") grouped[symbol] += qty;
      else if (type === "SELL") grouped[symbol] -= qty;
      else grouped[symbol] += qty;
    });

    return Object.entries(grouped)
      .filter(([_, qty]) => qty > 0)
      .map(([symbol, qty]) => {
        const coin = (coinsData || []).find(
          (c) =>
            ((c.symbol || c.ticker || c.id || c.name) || "").toString().toUpperCase() === symbol
        );
        const coinPrice = coin ? getCoinPriceFromCoinObj(coin) : null;
        const price = coinPrice || DEFAULT_PRICE_BY_SYMBOL[symbol] || MIN_FALLBACK_PRICE;
        return { symbol, name: coin?.name || symbol, quantity: Number(qty), price };
      });
  };

  const computeValue = (portfolioArr) =>
    (portfolioArr || []).reduce(
      (acc, p) =>
        acc +
        (parseNumber(p.quantity) || 0) * (parseNumber(p.price) || 0),
      0
    );

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setIsLoading(true);
    setError(null);

    try {
      const [profileRes, coinsRes, txRes] = await Promise.all([
        api.get("/auth/profile"),
        api.get("/coins"),
        api.get("/transactions"),
      ]);

      const profileUser = profileRes?.data?.user ?? profileRes?.data ?? null;
      const coinsData = Array.isArray(coinsRes?.data)
        ? coinsRes.data
        : coinsRes?.data?.coins ?? coinsRes?.data ?? [];
      const txs = Array.isArray(txRes?.data)
        ? txRes.data
        : txRes?.data?.transactions ?? txRes?.data ?? [];

      setUser(profileUser);
      setCoins(coinsData);
      setTransactions(txs);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError("Failed to load dashboard data.");
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPortfolio(buildPortfolio(transactions, coins));
  }, [transactions, coins]);

  useEffect(() => {
    const t = setInterval(() => {}, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onRefresh = () => fetchData();
    window.addEventListener("refreshDashboard", onRefresh);
    return () => window.removeEventListener("refreshDashboard", onRefresh);
  }, [fetchData]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "lastTxAt") fetchData();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [fetchData]);

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    navigate("/login");
  };

  useEffect(() => {
    const price = getBestPriceForSymbol(selectedCoin) || 100;
    const hist = synthPriceHistory(price, 30);
    setPriceHistory(hist);
  }, [selectedCoin, coins]);

  const pieData = useMemo(() => {
    const arr =
      (portfolio || [])
        .map((p) => ({
          name: p.symbol,
          value: Number(
            (p.quantity * getBestPriceForSymbol(p.symbol)).toFixed(2)
          ),
        }))
        .filter((a) => a.value > 0) || [];
    return arr.length ? arr : [{ name: "No holdings", value: 1 }];
  }, [portfolio, coins]);

  const pieChartData = {
    labels: pieData.map((d) => d.name),
    datasets: [
      {
        data: pieData.map((d) => d.value),
        backgroundColor: pieData.map((_, i) => CARD_COLOR(i)),
        borderColor: "rgba(255,255,255,0.06)",
        borderWidth: 1,
      },
    ],
  };

  function CARD_COLOR(i) {
    const base = [
      "#5b6b83",
      "#6b7ea6",
      "#7e89ab",
      "#8a7fb3",
      "#6d90d6",
      "#6fb3b1",
      "#9b7fb0",
    ];
    return base[i % base.length];
  }

  const lineChartData = {
    labels: priceHistory.map((_, i) => `${i}`),
    datasets: [
      {
        label: `${selectedCoin} price`,
        data: priceHistory,
        fill: false,
        tension: 0.25,
        borderColor: "#8b5cf6",
        backgroundColor: "#8b5cf6",
        pointRadius: 2,
      },
    ],
  };

  const totalValue = computeValue(portfolio);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#fff",
        fontFamily: "Inter, system-ui",
        padding: 20,
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
        
        {/* ---------- SIDEBAR ---------- */}
        <aside>
          <div
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
              padding: 16,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.04)",
              minHeight: "calc(100vh - 40px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",   // ✅ Allow logout at bottom
            }}
          >
            {/* TOP SECTION */}
            <div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
                    fontWeight: 800,
                  }}
                >
                  ₿
                </div>
                <div>
                  <div style={{ fontWeight: 800 }}>CryptoTrade</div>
                  <div style={{ color: "#9ca3af", fontSize: 13 }}>
                    Secure · Fast · Reliable
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ color: "#9ca3af", fontSize: 13 }}>Signed in as</div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.name || "—"}</div>
                <div style={{ color: "#9ca3af", fontSize: 13 }}>
                  {user?.email || ""}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <button onClick={() => navigate("/buy")} style={primaryBtn}>
                  Buy Crypto
                </button>
                <button onClick={() => navigate("/sell")} style={dangerBtn}>
                  Sell Crypto
                </button>
                <button
                  onClick={() => navigate("/transactions")}
                  style={ghostBtn}
                >
                  View Transactions
                </button>
              </div>

              {/* ✅ NEWS CARD */}
              <div
                onMouseEnter={() => setNewsPaused(true)}
                onMouseLeave={() => setNewsPaused(false)}
                style={{
                  marginTop: 16,
                  padding: 12,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.03)",
                }}
              >
                <div style={{ fontWeight: 800 }}>{NEWS[newsIndex].title}</div>
                <div style={{ color: "#cbd5e1", marginTop: 6 }}>
                  {NEWS[newsIndex].text}
                </div>
              </div>
            </div>

            {/* ✅ LOGOUT BUTTON MOVED TO BOTTOM */}
            <div style={{ marginTop: 20 }}>
              <button onClick={logout} style={logoutBtn}>
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* ---------- MAIN AREA ---------- */}
        <main>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 30 }}>Dashboard</h1>
              <div style={{ color: "#9ca3af", marginTop: 6 }}>
                Welcome back,{" "}
                <span style={{ color: "#60a5fa", fontWeight: 700 }}>
                  {user?.name || "—"}
                </span>
              </div>
            </div>

            <div style={{ width: 560, display: "flex", gap: 12 }}>
              <div
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.02)",
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 8 }}>
                  {selectedCoin} — Price History
                </div>
                <div style={{ height: 180 }}>
                  <Line
                    data={lineChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: true, labels: { color: "#fff" } },
                        tooltip: {},
                      },
                      scales: {
                        x: {
                          ticks: { color: "#9ca3af" },
                          grid: { display: false },
                        },
                        y: {
                          ticks: { color: "#9ca3af" },
                          grid: { color: "rgba(255,255,255,0.03)" },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  width: 220,
                  background: "rgba(255,255,255,0.02)",
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 8 }}>
                  Holdings
                </div>
                <div style={{ height: 120 }}>
                  <Pie
                    data={pieChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: { color: "#fff" },
                        },
                      },
                    }}
                  />
                </div>
                <div style={{ marginTop: 8, color: "#9ca3af" }}>
                  Total:{" "}
                  <strong style={{ color: "#fff" }}>
                    {fmtINR(computeValue(portfolio))}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- HOLDINGS ---------- */}
          <section style={{ marginTop: 18 }}>
            <h2 style={{ margin: 0, fontWeight: 800 }}>Your Holdings</h2>
            <div
              style={{
                marginTop: 10,
                background: "rgba(255,255,255,0.02)",
                padding: 12,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.03)",
              }}
            >
              {isLoading ? (
                <div style={{ color: "#9ca3af" }}>Loading holdings...</div>
              ) : portfolio.length === 0 ? (
                <div style={{ color: "#9ca3af" }}>
                  You have not bought any crypto yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {portfolio.map((p) => (
                    <div
                      key={p.symbol}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: 10,
                        borderRadius: 8,
                        background: "rgba(0,0,0,0.12)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: 10,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background:
                              "linear-gradient(135deg,#8b5cf6,#60a5fa)",
                            fontWeight: 800,
                          }}
                        >
                          {p.symbol}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800 }}>{p.name}</div>
                          <div style={{ color: "#9ca3af" }}>{p.symbol}</div>
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 800 }}>
                          Qty:{" "}
                          {Number(p.quantity)
                            .toFixed(6)
                            .replace(/\.?0+$/, "")}
                        </div>
                        <div
                          style={{
                            fontWeight: 900,
                            marginTop: 6,
                          }}
                        >
                          {fmtINR(
                            Number(p.quantity) *
                              getBestPriceForSymbol(p.symbol)
                          )}
                        </div>
                        <div
                          style={{
                            color: "#9ca3af",
                            marginTop: 6,
                          }}
                        >
                          Price: {fmtINR(getBestPriceForSymbol(p.symbol))}
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <button
                            onClick={() => navigate(`/sell?coin=${p.symbol}`)}
                            style={{ ...dangerBtn, padding: "8px 10px", fontSize: 13 }}
                          >
                            Sell
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ✅ EXTRA SPACE ADDED HERE */}
          <div style={{ height: 20 }}></div>

          {/* ---------- AVAILABLE COINS ---------- */}
          <section style={{ marginTop: 22 }}>
            <h2 style={{ margin: 0, fontWeight: 800 }}>Available Coins</h2>

            <div
              style={{
                marginTop: 12,
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
              }}
            >
              {coins.map((coin, idx) => {
                const symbol =
                  ((coin.symbol ||
                    coin.ticker ||
                    coin.id ||
                    coin.name) +
                    "").toUpperCase();
                const price =
                  getCoinPriceFromCoinObj(coin) ??
                  getBestPriceForSymbol(symbol);
                return (
                  <div
                    key={idx}
                    style={{
                      borderRadius: 12,
                      padding: 18,
                      background: NEUTRAL_CARD_COLOR,
                      border: "1px solid rgba(255,255,255,0.03)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: 150,
                      boxShadow: "0 8px 20px rgba(2,6,23,0.6)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 10,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background:
                              "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
                            border: "1px solid rgba(255,255,255,0.04)",
                            fontWeight: 800,
                            color: "#dbeafe",
                          }}
                        >
                          {symbol}
                        </div>

                        <div>
                          <div style={{ fontWeight: 800, fontSize: 16 }}>
                            {coin.name || symbol}
                          </div>
                          <div style={{ color: "#9ca3af", fontSize: 13 }}>
                            {symbol}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 18, fontWeight: 900 }}>
                          {fmtINR(price)}
                        </div>
                        <div
                          style={{
                            color: "#9ca3af",
                            marginTop: 6,
                            fontSize: 13,
                          }}
                        >
                          Last:{" "}
                          {coin.lastUpdated
                            ? new Date(coin.lastUpdated).toLocaleString()
                            : "—"}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 12,
                      }}
                    >
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          onClick={() => navigate(`/buy?coin=${symbol}`)}
                          style={{
                            padding: "10px 16px",
                            borderRadius: 12,
                            border: "none",
                            background: PRIMARY_GRADIENT,
                            color: "#fff",
                            fontWeight: 800,
                            boxShadow: "0 8px 22px rgba(59,130,246,0.18)",
                            cursor: "pointer",
                          }}
                        >
                          Buy
                        </button>

                        <button
                          onClick={() => navigate(`/sell?coin=${symbol}`)}
                          style={{
                            padding: "10px 12px",
                            borderRadius: 10,
                            border: "1px solid rgba(255,255,255,0.04)",
                            background: "rgba(255,255,255,0.01)",
                            color: "#d1d5db",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Sell
                        </button>
                      </div>

                      <button
                        onClick={() => setSelectedCoin(symbol)}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 10,
                          border: "1px solid rgba(255,255,255,0.04)",
                          background: "rgba(255,255,255,0.01)",
                          color: "#d1d5db",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        View history
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <style>{`
              @media (max-width: 1200px) {
                div[style*="grid-template-columns: repeat(3, 1fr)"] {
                  grid-template-columns: repeat(2, 1fr);
                }
              }
              @media (max-width: 780px) {
                div[style*="grid-template-columns: repeat(3, 1fr)"] {
                  grid-template-columns: 1fr;
                }
              }
            `}</style>
          </section>
        </main>
      </div>
    </div>
  );
}

/* ---------- BUTTON STYLES ---------- */
const primaryBtn = {
  padding: "10px 12px",
  borderRadius: 8,
  background: PRIMARY_GRADIENT,
  color: "#fff",
  border: "none",
  fontWeight: 800,
  cursor: "pointer",
};

const dangerBtn = {
  padding: "10px 12px",
  borderRadius: 8,
  background: "linear-gradient(90deg,#ef4444,#ef6b6b)",
  color: "#fff",
  border: "none",
  fontWeight: 800,
  cursor: "pointer",
};

const ghostBtn = {
  padding: "10px 12px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.02)",
  color: "#d1d5db",
  border: "1px solid rgba(255,255,255,0.04)",
  fontWeight: 700,
  cursor: "pointer",
};

const logoutBtn = {
  padding: "10px 12px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.02)",
  color: "#ffb4b4",
  border: "1px solid rgba(255,255,255,0.03)",
  fontWeight: 700,
  cursor: "pointer",
};
