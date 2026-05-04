import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const revenueFields = [
    { key: "estimated_buyers",            label: "Est. Buyers",          icon: "👥", color: "#3b82f6" },
    { key: "estimated_revenue",           label: "Est. Revenue",         icon: "💰", color: "#8b5cf6" },
    { key: "satisfaction_rate",           label: "Satisfaction Rate",    icon: "⭐", color: "#10b981" },
    { key: "lost_revenue_from_negatives", label: "Lost to Negatives",    icon: "📉", color: "#ef4444" },
    { key: "revenue_opportunity",         label: "Growth Opportunity",   icon: "🚀", color: "#f59e0b" },
];

export default function InsightsCard({ insights, revenue, url }) {
    const [tab, setTab] = useState("gpt");

    const tabs = [
        { id: "gpt",     label: "GPT Analysis" },
        { id: "claude",  label: "Claude Critique" },
        { id: "revenue", label: "Revenue Impact" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20,
                overflow: "hidden",
                marginTop: 20,
            }}
        >
            {/* URL header */}
            {url && (
                <div style={{
                    padding: "12px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                }}>
                    <span style={{ fontSize: 12, color: "#475569" }}>🔗</span>
                    <span style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {url}
                    </span>
                </div>
            )}

            {/* Tab bar */}
            <div style={{
                display: "flex",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                padding: "0 20px",
                gap: 4,
            }}>
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        style={{
                            background: "none",
                            border: "none",
                            borderBottom: tab === t.id ? "2px solid #8b5cf6" : "2px solid transparent",
                            padding: "14px 16px",
                            color: tab === t.id ? "#a78bfa" : "#64748b",
                            fontSize: 13,
                            fontWeight: tab === t.id ? 600 : 400,
                            fontFamily: "Inter, sans-serif",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div style={{ padding: 24 }}>
                <AnimatePresence mode="wait">
                    {tab === "gpt" && (
                        <TabContent key="gpt">
                            <MarkdownText text={insights?.gpt} />
                        </TabContent>
                    )}
                    {tab === "claude" && (
                        <TabContent key="claude">
                            <MarkdownText text={insights?.claude} />
                        </TabContent>
                    )}
                    {tab === "revenue" && (
                        <TabContent key="revenue">
                            {revenue && typeof revenue === "object" ? (
                                <div>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                                        {revenueFields.map(f => (
                                            <motion.div
                                                key={f.key}
                                                initial={{ opacity: 0, scale: 0.92 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3 }}
                                                style={{
                                                    background: `rgba(${hexToRgb(f.color)}, 0.06)`,
                                                    border: `1px solid rgba(${hexToRgb(f.color)}, 0.15)`,
                                                    borderRadius: 14,
                                                    padding: "16px 18px",
                                                }}
                                            >
                                                <p style={{ fontSize: 20, marginBottom: 6 }}>{f.icon}</p>
                                                <p style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</p>
                                                <p style={{ fontSize: 22, fontWeight: 700, color: f.color }}>{revenue[f.key]}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                    {revenue.note && (
                                        <p style={{ marginTop: 16, fontSize: 11, color: "#475569", lineHeight: 1.6 }}>
                                            ℹ️ {revenue.note}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p style={{ color: "#64748b", fontSize: 14 }}>No revenue data available.</p>
                            )}
                        </TabContent>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

function TabContent({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.22 }}
        >
            {children}
        </motion.div>
    );
}

function MarkdownText({ text }) {
    if (!text) return <p style={{ color: "#64748b", fontSize: 14 }}>No data available.</p>;

    return (
        <div style={{
            fontSize: 14,
            lineHeight: 1.8,
            color: "#cbd5e1",
            fontFamily: "Inter, sans-serif",
            whiteSpace: "pre-wrap",
        }}>
            {text.split("\n").map((line, i) => {
                // Bold headings like **Overall Sentiment:**
                if (line.startsWith("**") && line.endsWith("**")) {
                    return (
                        <p key={i} style={{ fontWeight: 700, color: "#f1f5f9", marginTop: 16, marginBottom: 4, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "#a78bfa" }}>
                            {line.replace(/\*\*/g, "")}
                        </p>
                    );
                }
                if (line.includes("**")) {
                    const parts = line.split(/\*\*(.*?)\*\*/g);
                    return (
                        <p key={i} style={{ marginBottom: 2 }}>
                            {parts.map((part, j) => j % 2 === 1 ? <strong key={j} style={{ color: "#f1f5f9" }}>{part}</strong> : part)}
                        </p>
                    );
                }
                if (line.startsWith("- ")) {
                    return (
                        <p key={i} style={{ marginBottom: 4, paddingLeft: 14, position: "relative" }}>
                            <span style={{ position: "absolute", left: 0, color: "#8b5cf6" }}>›</span>
                            {line.slice(2)}
                        </p>
                    );
                }
                return <p key={i} style={{ marginBottom: 2 }}>{line}</p>;
            })}
        </div>
    );
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1],16)}, ${parseInt(result[2],16)}, ${parseInt(result[3],16)}` : "255,255,255";
}