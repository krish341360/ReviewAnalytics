import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const COLORS = {
    Positive: "#10b981",
    Negative: "#ef4444",
};

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0];
    return (
        <div style={{
            background: "rgba(13,17,23,0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: "8px 14px",
            fontSize: 13,
            color: COLORS[name],
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
        }}>
            {name}: {value}
        </div>
    );
};

export default function SentimentChart({ data }) {
    if (!data || data.total === 0) return null;

    const chartData = [
        { name: "Positive", value: data.positive },
        { name: "Negative", value: data.negative },
    ];

    const pct = data.total > 0 ? Math.round((data.positive / data.total) * 100) : 0;

    return (
        <div style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>

                {/* Pie chart */}
                <div style={{ width: 180, height: 180, flexShrink: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                cx="50%" cy="50%"
                                innerRadius={52}
                                outerRadius={78}
                                paddingAngle={3}
                                strokeWidth={0}
                            >
                                {chartData.map((entry) => (
                                    <Cell key={entry.name} fill={COLORS[entry.name]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Stats */}
                <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ marginBottom: 16 }}>
                        <p style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Satisfaction Score</p>
                        <p style={{
                            fontSize: 42,
                            fontWeight: 800,
                            color: pct >= 60 ? "#10b981" : "#ef4444",
                            lineHeight: 1,
                        }}>
                            {pct}<span style={{ fontSize: 20, fontWeight: 500, color: "#64748b" }}>%</span>
                        </p>
                    </div>

                    {/* Progress bar */}
                    <div style={{
                        height: 6,
                        background: "rgba(239,68,68,0.2)",
                        borderRadius: 99,
                        overflow: "hidden",
                        marginBottom: 16,
                    }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{
                                height: "100%",
                                background: pct >= 60
                                    ? "linear-gradient(90deg, #10b981, #34d399)"
                                    : "linear-gradient(90deg, #ef4444, #f87171)",
                                borderRadius: 99,
                            }}
                        />
                    </div>

                    {/* Legend */}
                    <div style={{ display: "flex", gap: 16 }}>
                        {chartData.map(({ name, value }) => (
                            <div key={name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{
                                    width: 8, height: 8, borderRadius: "50%",
                                    background: COLORS[name], display: "inline-block",
                                }} />
                                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                                    {name}: <strong style={{ color: COLORS[name] }}>{value}</strong>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}