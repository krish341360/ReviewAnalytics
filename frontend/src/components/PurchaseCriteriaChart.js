import { motion } from "framer-motion";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    Cell, ResponsiveContainer, LabelList,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div style={{
            background: "rgba(13,17,23,0.97)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "12px 16px",
            fontSize: 12,
            fontFamily: "Inter, sans-serif",
            maxWidth: 260,
        }}>
            <p style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>{d.criterion}</p>
            <p style={{ color: "#94a3b8", marginBottom: 2 }}>Mentions: <strong style={{ color: "#f1f5f9" }}>{d.mentions}</strong></p>
            <p style={{ color: "#10b981" }}>Positive: {d.positive_mentions}</p>
            <p style={{ color: "#ef4444" }}>Negative: {d.negative_mentions}</p>
            {d.representative_quote && (
                <p style={{ color: "#64748b", fontStyle: "italic", marginTop: 6, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 6 }}>
                    "{d.representative_quote}"
                </p>
            )}
        </div>
    );
};

export default function PurchaseCriteriaChart({ criteria }) {
    if (!criteria || criteria.length === 0) return null;

    // Sort by mentions descending, top 8
    const data = [...criteria]
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, 8);

    const getColor = (d) => {
        if (d.is_gap) return "#f59e0b";
        const score = d.sentiment_score ?? (d.mentions > 0 ? d.positive_mentions / d.mentions : 0.5);
        return score >= 0.6 ? "#10b981" : "#ef4444";
    };

    return (
        <div>
            {/* Legend */}
            <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                {[
                    { color: "#10b981", label: "Strong positive signal" },
                    { color: "#ef4444", label: "Pain point / complaint" },
                    { color: "#f59e0b", label: "Gap = opportunity" },
                ].map(({ color, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: "inline-block" }} />
                        <span style={{ fontSize: 11, color: "#64748b" }}>{label}</span>
                    </div>
                ))}
            </div>

            <ResponsiveContainer width="100%" height={320}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
                >
                    <XAxis
                        type="number"
                        tick={{ fill: "#475569", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        type="category"
                        dataKey="criterion"
                        width={140}
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <Bar dataKey="mentions" radius={[0, 6, 6, 0]} barSize={22}>
                        {data.map((entry, i) => (
                            <Cell key={i} fill={getColor(entry)} fillOpacity={0.85} />
                        ))}
                        <LabelList
                            dataKey="mentions"
                            position="right"
                            style={{ fill: "#64748b", fontSize: 11 }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Gap opportunities callout */}
            {data.some(d => d.is_gap) && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        marginTop: 16,
                        padding: "12px 16px",
                        background: "rgba(245,158,11,0.08)",
                        border: "1px solid rgba(245,158,11,0.2)",
                        borderRadius: 10,
                        fontSize: 12,
                        color: "#fbbf24",
                    }}
                >
                    🚀 <strong>Gap opportunities detected:</strong>{" "}
                    {data.filter(d => d.is_gap).map(d => d.criterion).join(", ")} —
                    customers want these but competitors aren't delivering.
                </motion.div>
            )}
        </div>
    );
}
