import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    Cell, ResponsiveContainer, ReferenceLine,
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
        }}>
            <p style={{ fontWeight: 700, color: d.is_primary ? "#a78bfa" : "#f1f5f9", marginBottom: 6 }}>
                {d.is_primary ? "★ Your Listing" : `Competitor #${d.rank}`}
            </p>
            <p style={{ color: "#64748b", fontSize: 11, marginBottom: 8 }}>{d.title?.slice(0, 60)}…</p>
            <p style={{ color: "#10b981" }}>Monthly Revenue: <strong>{d.monthly_revenue}</strong></p>
            <p style={{ color: "#94a3b8" }}>Monthly Units: <strong>{d.monthly_units?.toLocaleString()}</strong></p>
            <p style={{ color: "#94a3b8" }}>Price: ₹{d.price?.toLocaleString("en-IN")}</p>
            <p style={{ color: "#94a3b8" }}>Rating: {d.rating} ⭐</p>
        </div>
    );
};

export default function RevenueCompare({ products }) {
    if (!products || products.length === 0) return null;

    const data = products.map(p => ({
        label: p.is_primary ? "★ Yours" : `C${p.rank}`,
        monthly_revenue: p.revenue?.monthly_revenue,
        monthly_units: p.revenue?.monthly_units,
        raw_monthly: p.revenue?.raw_monthly || 0,
        is_primary: p.is_primary,
        title: p.title,
        price: p.price,
        rating: p.rating,
        rank: p.rank,
    }));

    const maxRevenue = Math.max(...data.map(d => d.raw_monthly));
    const yourRevenue = data.find(d => d.is_primary)?.raw_monthly || 0;
    const avgRevenue = data.reduce((s, d) => s + d.raw_monthly, 0) / data.length;

    return (
        <div>
            {/* Summary pills */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                <Pill label="Market Leader" value={data[0]?.monthly_revenue || "—"} color="#f59e0b" />
                <Pill label="Your Revenue" value={data.find(d => d.is_primary)?.monthly_revenue || "—"} color="#8b5cf6" />
                <Pill
                    label="vs. Market Leader"
                    value={yourRevenue > 0 && maxRevenue > 0
                        ? `${yourRevenue >= maxRevenue ? "+" : ""}${Math.round(((yourRevenue - maxRevenue) / maxRevenue) * 100)}%`
                        : "—"
                    }
                    color={yourRevenue >= maxRevenue ? "#10b981" : "#ef4444"}
                />
            </div>

            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <XAxis
                        dataKey="label"
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />

                    {/* Average line */}
                    <ReferenceLine
                        y={avgRevenue}
                        stroke="rgba(255,255,255,0.15)"
                        strokeDasharray="4 4"
                        label={{ value: "avg", fill: "#475569", fontSize: 10 }}
                    />

                    <Bar dataKey="raw_monthly" radius={[6, 6, 0, 0]} barSize={36}>
                        {data.map((entry, i) => (
                            <Cell
                                key={i}
                                fill={entry.is_primary
                                    ? "url(#primaryGrad)"
                                    : "rgba(59,130,246,0.4)"
                                }
                                stroke={entry.is_primary ? "#8b5cf6" : "none"}
                                strokeWidth={entry.is_primary ? 1.5 : 0}
                            />
                        ))}
                    </Bar>

                    <defs>
                        <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                        </linearGradient>
                    </defs>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function Pill({ label, value, color }) {
    return (
        <div style={{
            padding: "8px 14px",
            background: `rgba(${hexToRgb(color)}, 0.07)`,
            border: `1px solid rgba(${hexToRgb(color)}, 0.2)`,
            borderRadius: 10,
            flex: "1 1 auto",
            minWidth: 130,
        }}>
            <p style={{ fontSize: 10, color: "#475569", marginBottom: 2, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color }}>{value}</p>
        </div>
    );
}

function hexToRgb(hex) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? `${parseInt(r[1],16)}, ${parseInt(r[2],16)}, ${parseInt(r[3],16)}` : "255,255,255";
}
