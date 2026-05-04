import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Single-product mode
import InputBox from "../components/InputBox";
import InsightsCard from "../components/InsightsCard";
import SentimentChart from "../components/SentimentChart";

// Competitor analysis mode
import CompetitorInputBox from "../components/CompetitorInputBox";
import CompetitorTable from "../components/CompetitorTable";
import PurchaseCriteriaChart from "../components/PurchaseCriteriaChart";
import RevenueCompare from "../components/RevenueCompare";

const MODES = [
    { id: "competitor", label: "Amazon Competitor Analysis", icon: "🏆" },
    { id: "single",     label: "Single Product",             icon: "🔍" },
];

export default function Dashboard() {
    const [mode, setMode]       = useState("competitor");
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);

    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

    // Single-product state
    const [singleData, setSingleData] = useState([]);

    // Competitor analysis state
    const [compareData, setCompareData] = useState(null);

    // ── Single product analyze ──────────────────────────────────────────────
    const handleAnalyze = async (urls) => {
        setLoading(true); setError(null); setSingleData([]);
        try {
            const res  = await fetch(`${API_BASE_URL}/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ urls }),
            });
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            setSingleData(await res.json());
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    };

    // ── Competitor compare ──────────────────────────────────────────────────
    const handleCompare = async ({ your_url, competitor_urls }) => {
        setLoading(true); setError(null); setCompareData(null);
        try {
            const res = await fetch(`${API_BASE_URL}/compare`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ your_url, competitor_urls }),
            });
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            setCompareData(await res.json());
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: "100vh", padding: "0 24px 80px", maxWidth: 1060, margin: "0 auto" }}>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: "center", padding: "64px 0 40px" }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: "rgba(139,92,246,0.12)",
                        border: "1px solid rgba(139,92,246,0.25)",
                        borderRadius: 99, padding: "5px 14px",
                        fontSize: 12, color: "#a78bfa", fontWeight: 500, marginBottom: 20,
                    }}
                >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#8b5cf6", display: "inline-block" }} />
                    AI-Powered Amazon Intelligence
                </motion.div>

                <h1 style={{
                    fontSize: "clamp(30px, 5vw, 50px)", fontWeight: 800,
                    letterSpacing: "-0.02em", lineHeight: 1.1,
                    background: "linear-gradient(135deg, #f1f5f9 30%, #a78bfa 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    backgroundClip: "text", marginBottom: 12,
                }}>
                    Review Analytics
                </h1>
                <p style={{ fontSize: 15, color: "#64748b", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.6 }}>
                    Identify purchase criteria, estimate monthly revenue,
                    and outmaneuver competitors — all from review data.
                </p>

                {/* Mode toggle */}
                <div style={{
                    display: "inline-flex",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12, padding: 4, gap: 2, marginBottom: 36,
                }}>
                    {MODES.map(m => (
                        <motion.button
                            key={m.id}
                            onClick={() => setMode(m.id)}
                            whileTap={{ scale: 0.97 }}
                            style={{
                                background: mode === m.id
                                    ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                                    : "transparent",
                                border: "none", borderRadius: 9,
                                padding: "8px 18px",
                                color: mode === m.id ? "#fff" : "#64748b",
                                fontSize: 13, fontWeight: mode === m.id ? 600 : 400,
                                fontFamily: "Inter, sans-serif",
                                cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 6,
                                transition: "color 0.2s",
                            }}
                        >
                            {m.icon} {m.label}
                        </motion.button>
                    ))}
                </div>

                {/* Input area */}
                <AnimatePresence mode="wait">
                    {mode === "competitor" ? (
                        <motion.div key="competitor" {...fadeSlide}>
                            <CompetitorInputBox onCompare={handleCompare} loading={loading} />
                        </motion.div>
                    ) : (
                        <motion.div key="single" {...fadeSlide}>
                            <InputBox onAnalyze={handleAnalyze} loading={loading} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{
                            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                            borderRadius: 12, padding: "14px 20px", color: "#fca5a5", fontSize: 14, marginBottom: 24,
                        }}
                    >
                        ⚠️ {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ textAlign: "center", padding: "60px 0" }}
                    >
                        <div style={{
                            width: 48, height: 48,
                            border: "2px solid rgba(139,92,246,0.2)",
                            borderTop: "2px solid #8b5cf6",
                            borderRadius: "50%", margin: "0 auto 20px",
                            animation: "spin 1s linear infinite",
                        }} />
                        <p style={{ color: "#64748b", fontSize: 14 }}>
                            {mode === "competitor"
                                ? "Scraping listings, reviews & running AI analysis across all products…"
                                : "Scraping reviews & running analysis…"
                            }
                        </p>
                        <p style={{ color: "#334155", fontSize: 12, marginTop: 6 }}>
                            This may take 30–90 seconds depending on how many listings you added.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Competitor results ─────────────────────────────────────────── */}
            <AnimatePresence>
                {compareData && !loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                        {/* Summary bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            style={{
                                display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24,
                            }}
                        >
                            <StatPill icon="📦" label="Products Analyzed" value={compareData.products?.length} />
                            <StatPill icon="💬" label="Reviews Used"       value={compareData.total_reviews_used?.toLocaleString()} />
                            <StatPill icon="🎯" label="Purchase Criteria"  value={compareData.purchase_criteria?.length} />
                        </motion.div>

                        {/* Ranked table */}
                        <Section title="Revenue Rankings" subtitle="Sorted by estimated monthly revenue">
                            <CompetitorTable products={compareData.products} />
                        </Section>

                        {/* Revenue chart */}
                        <Section title="Monthly Revenue Comparison" subtitle="Your listing vs. each competitor">
                            <RevenueCompare products={compareData.products} />
                        </Section>

                        {/* Purchase criteria */}
                        <Section
                            title="Key Purchase Criteria"
                            subtitle="What customers actually care about — extracted from all reviews"
                        >
                            <PurchaseCriteriaChart criteria={compareData.purchase_criteria} />
                        </Section>

                        {/* AI analysis */}
                        <Section title="Competitive Intelligence" subtitle="GPT + Claude market analysis">
                            <InsightsCard
                                insights={compareData.analysis}
                                revenue={null}
                            />
                        </Section>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Single product results ─────────────────────────────────────── */}
            <AnimatePresence>
                {singleData.length > 0 && !loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {singleData.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                style={{
                                    background: "rgba(255,255,255,0.025)",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    borderRadius: 24, padding: 28, marginBottom: 24,
                                }}
                            >
                                <SectionLabel>Sentiment Analysis</SectionLabel>
                                <div style={{ marginTop: 12 }}>
                                    {item.review_count === 0
                                        ? <EmptyState />
                                        : <SentimentChart data={item.sentiment} />
                                    }
                                </div>
                                <Divider />
                                <div style={{ marginTop: 20 }}>
                                    <SectionLabel>AI Insights</SectionLabel>
                                    <InsightsCard insights={item.insights} revenue={item.revenue} url={item.url} />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

const fadeSlide = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -8 },
    transition: { duration: 0.2 },
};

function Section({ title, subtitle, children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 20, padding: 24, marginBottom: 20,
            }}
        >
            <p style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>{title}</p>
            {subtitle && <p style={{ fontSize: 12, color: "#475569", marginBottom: 20 }}>{subtitle}</p>}
            {children}
        </motion.div>
    );
}

function StatPill({ icon, label, value }) {
    return (
        <div style={{
            flex: "1 1 auto", minWidth: 140,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, padding: "12px 16px",
            display: "flex", alignItems: "center", gap: 12,
        }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            <div>
                <p style={{ fontSize: 10, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>{value ?? "—"}</p>
            </div>
        </div>
    );
}

function SectionLabel({ children }) {
    return <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#475569" }}>{children}</p>;
}

function Divider() {
    return <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "16px 0" }} />;
}

function EmptyState() {
    return (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#475569" }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>🔍</p>
            <p style={{ fontSize: 14 }}>No reviews found for this URL.</p>
        </div>
    );
}