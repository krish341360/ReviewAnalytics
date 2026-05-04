import { motion } from "framer-motion";

const CONFIDENCE_COLORS = {
    high: "#10b981",
    low:  "#f59e0b",
    none: "#64748b",
};

export default function CompetitorTable({ products }) {
    if (!products || products.length === 0) return null;

    return (
        <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                    <tr>
                        {["Rank", "Product", "Price", "Rating", "Reviews", "Monthly Units", "Monthly Revenue", "Confidence"].map(h => (
                            <th key={h} style={{
                                textAlign: h === "Product" ? "left" : "center",
                                padding: "10px 12px",
                                fontSize: 10,
                                fontWeight: 600,
                                color: "#475569",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                borderBottom: "1px solid rgba(255,255,255,0.06)",
                                whiteSpace: "nowrap",
                            }}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {products.map((p, i) => (
                        <motion.tr
                            key={p.asin || i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.07 }}
                            style={{
                                background: p.is_primary
                                    ? "rgba(139,92,246,0.07)"
                                    : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                                borderLeft: p.is_primary ? "3px solid #8b5cf6" : "3px solid transparent",
                            }}
                        >
                            {/* Rank */}
                            <td style={{ textAlign: "center", padding: "12px", fontWeight: 700, color: p.rank <= 3 ? "#f59e0b" : "#64748b" }}>
                                {p.rank === 1 ? "🥇" : p.rank === 2 ? "🥈" : p.rank === 3 ? "🥉" : `#${p.rank}`}
                            </td>

                            {/* Product */}
                            <td style={{ padding: "12px", maxWidth: 260 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    {p.thumbnail && (
                                        <img
                                            src={p.thumbnail}
                                            alt=""
                                            style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 6, background: "rgba(255,255,255,0.04)", flexShrink: 0 }}
                                        />
                                    )}
                                    <div>
                                        {p.is_primary && (
                                            <span style={{ fontSize: 9, fontWeight: 700, color: "#8b5cf6", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 4, padding: "1px 6px", marginBottom: 3, display: "inline-block" }}>
                                                YOUR LISTING
                                            </span>
                                        )}
                                        <p style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.4, marginTop: p.is_primary ? 2 : 0 }}>
                                            {p.title?.slice(0, 70)}{p.title?.length > 70 ? "…" : ""}
                                        </p>
                                    </div>
                                </div>
                            </td>

                            {/* Price */}
                            <Td>₹{p.price?.toLocaleString("en-IN") || "—"}</Td>

                            {/* Rating */}
                            <Td>
                                <span style={{ color: p.rating >= 4.3 ? "#10b981" : p.rating >= 3.8 ? "#f59e0b" : "#ef4444", fontWeight: 600 }}>
                                    {p.rating || "—"} ⭐
                                </span>
                            </Td>

                            {/* Reviews */}
                            <Td>{p.review_count?.toLocaleString() || "0"}</Td>

                            {/* Monthly Units */}
                            <Td>
                                <span style={{ fontWeight: 600, color: "#94a3b8" }}>
                                    {p.revenue?.monthly_units?.toLocaleString() || "—"}
                                </span>
                            </Td>

                            {/* Monthly Revenue */}
                            <Td>
                                <span style={{ fontWeight: 700, color: "#10b981", fontSize: 13 }}>
                                    {p.revenue?.monthly_revenue || "—"}
                                </span>
                            </Td>

                            {/* Confidence */}
                            <Td>
                                <span style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    color: CONFIDENCE_COLORS[p.revenue?.confidence] || "#64748b",
                                    background: `${CONFIDENCE_COLORS[p.revenue?.confidence]}18`,
                                    border: `1px solid ${CONFIDENCE_COLORS[p.revenue?.confidence]}30`,
                                    borderRadius: 99,
                                    padding: "2px 8px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                }}>
                                    {p.revenue?.confidence || "—"}
                                </span>
                            </Td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Td({ children }) {
    return (
        <td style={{ textAlign: "center", padding: "12px", color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
            {children}
        </td>
    );
}
