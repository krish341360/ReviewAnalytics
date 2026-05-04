import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CompetitorInputBox({ onCompare, loading }) {
    const [yourUrl, setYourUrl]           = useState("");
    const [competitors, setCompetitors]   = useState([""]);
    const [focused, setFocused]           = useState(null);

    const addCompetitor = () => {
        if (competitors.length < 9) setCompetitors([...competitors, ""]);
    };

    const updateCompetitor = (i, val) => {
        const updated = [...competitors];
        updated[i] = val;
        setCompetitors(updated);
    };

    const removeCompetitor = (i) => {
        setCompetitors(competitors.filter((_, idx) => idx !== i));
    };

    const handleSubmit = () => {
        const competitor_urls = competitors.map(u => u.trim()).filter(u => u.length > 0);
        onCompare({ your_url: yourUrl.trim(), competitor_urls });
    };

    const canSubmit = !loading && yourUrl.trim().length > 0;

    return (
        <div style={{ width: "100%", maxWidth: 760, margin: "0 auto" }}>

            {/* Your listing */}
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b5cf6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                ★ Your Amazon Listing
            </label>
            <UrlInput
                value={yourUrl}
                onChange={setYourUrl}
                placeholder="https://www.amazon.in/dp/B0XXXXXXXX"
                highlight
                focused={focused === "your"}
                onFocus={() => setFocused("your")}
                onBlur={() => setFocused(null)}
            />

            {/* Competitors */}
            <div style={{ marginTop: 20 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                    Competitor Listings ({competitors.filter(u => u.trim()).length}/{competitors.length} filled)
                </label>

                <AnimatePresence>
                    {competitors.map((url, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}
                        >
                            <span style={{ fontSize: 12, color: "#475569", width: 24, textAlign: "right", flexShrink: 0 }}>
                                {i + 1}.
                            </span>
                            <div style={{ flex: 1 }}>
                                <UrlInput
                                    value={url}
                                    onChange={(v) => updateCompetitor(i, v)}
                                    placeholder={`Competitor ${i + 1} Amazon URL`}
                                    focused={focused === i}
                                    onFocus={() => setFocused(i)}
                                    onBlur={() => setFocused(null)}
                                />
                            </div>
                            {competitors.length > 1 && (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => removeCompetitor(i)}
                                    style={{
                                        background: "rgba(239,68,68,0.1)",
                                        border: "1px solid rgba(239,68,68,0.2)",
                                        borderRadius: 8,
                                        width: 32, height: 32,
                                        color: "#ef4444",
                                        cursor: "pointer",
                                        fontSize: 16,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    ×
                                </motion.button>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {competitors.length < 9 && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={addCompetitor}
                        style={{
                            width: "100%",
                            marginTop: 4,
                            padding: "10px",
                            background: "rgba(255,255,255,0.02)",
                            border: "1px dashed rgba(255,255,255,0.12)",
                            borderRadius: 10,
                            color: "#475569",
                            fontSize: 13,
                            cursor: "pointer",
                            fontFamily: "Inter, sans-serif",
                        }}
                    >
                        + Add Competitor ({9 - competitors.length} remaining)
                    </motion.button>
                )}
            </div>

            {/* Submit */}
            <motion.button
                onClick={handleSubmit}
                disabled={!canSubmit}
                whileHover={{ scale: canSubmit ? 1.02 : 1 }}
                whileTap={{ scale: canSubmit ? 0.98 : 1 }}
                style={{
                    width: "100%",
                    marginTop: 20,
                    padding: "14px",
                    background: canSubmit
                        ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                        : "rgba(139,92,246,0.2)",
                    border: "none",
                    borderRadius: 12,
                    color: canSubmit ? "#fff" : "#64748b",
                    fontSize: 15,
                    fontWeight: 600,
                    fontFamily: "Inter, sans-serif",
                    cursor: canSubmit ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                }}
            >
                {loading ? (
                    <>
                        <Spinner />
                        Analyzing {1 + competitors.filter(u => u.trim()).length} listings…
                    </>
                ) : (
                    `Run Competitor Analysis →`
                )}
            </motion.button>

            <p style={{ fontSize: 11, color: "#334155", textAlign: "center", marginTop: 10 }}>
                Scrapes reviews + runs GPT analysis across all listings · May take 30–60s
            </p>
        </div>
    );
}

function UrlInput({ value, onChange, placeholder, highlight, focused, onFocus, onBlur }) {
    return (
        <motion.input
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            animate={{
                boxShadow: focused
                    ? highlight
                        ? "0 0 0 2px rgba(139,92,246,0.6)"
                        : "0 0 0 2px rgba(59,130,246,0.4)"
                    : "none",
            }}
            style={{
                width: "100%",
                padding: "11px 14px",
                background: highlight ? "rgba(139,92,246,0.06)" : "rgba(255,255,255,0.03)",
                border: highlight ? "1px solid rgba(139,92,246,0.25)" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                color: "#f1f5f9",
                fontFamily: "Inter, monospace",
                fontSize: 13,
                outline: "none",
                transition: "border 0.2s",
            }}
        />
    );
}

function Spinner() {
    return (
        <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            style={{ display: "inline-block" }}
        >◌</motion.span>
    );
}
