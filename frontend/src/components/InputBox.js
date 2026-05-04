import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SUPPORTED_PLATFORMS = [
    { label: "Trustpilot",   hint: "https://www.trustpilot.com/review/netflix.com" },
    { label: "Google Play",  hint: "https://play.google.com/store/apps/details?id=com.instagram.android" },
    { label: "Steam",        hint: "https://store.steampowered.com/app/730/CounterStrike_2/" },
    { label: "App Store",    hint: "https://apps.apple.com/us/app/instagram/id389801252" },
    { label: "Flipkart",     hint: "Any Flipkart product page" },
];

export default function InputBox({ onAnalyze, loading }) {
    const [input, setInput]       = useState("");
    const [focused, setFocused]   = useState(false);
    const [hint, setHint]         = useState(null);

    const handleSubmit = () => {
        const urls = input.split("\n").map(u => u.trim()).filter(u => u.length > 0);
        if (urls.length > 0) onAnalyze(urls);
    };

    const handleKey = (e) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
    };

    return (
        <div style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}>

            {/* Textarea */}
            <motion.div
                animate={{ boxShadow: focused
                    ? "0 0 0 2px rgba(139,92,246,0.5), 0 20px 60px rgba(0,0,0,0.4)"
                    : "0 4px 24px rgba(0,0,0,0.3)"
                }}
                transition={{ duration: 0.25 }}
                style={{
                    borderRadius: 16,
                    border: focused ? "1px solid rgba(139,92,246,0.6)" : "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(12px)",
                    overflow: "hidden",
                    transition: "border 0.25s",
                }}
            >
                <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyDown={handleKey}
                    placeholder={"Paste a product URL here…\n\nSupported: Trustpilot · Google Play · Steam · App Store · Flipkart"}
                    rows={4}
                    style={{
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "#f1f5f9",
                        fontFamily: "Inter, sans-serif",
                        fontSize: 15,
                        lineHeight: 1.6,
                        padding: "18px 20px",
                        resize: "none",
                    }}
                />

                {/* Footer bar */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 16px",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    background: "rgba(255,255,255,0.02)",
                }}>
                    <span style={{ fontSize: 12, color: "#475569" }}>⌘ + Enter to analyze</span>

                    <motion.button
                        onClick={handleSubmit}
                        disabled={loading || !input.trim()}
                        whileHover={{ scale: loading ? 1 : 1.04 }}
                        whileTap={{ scale: loading ? 1 : 0.97 }}
                        style={{
                            background: loading
                                ? "rgba(139,92,246,0.3)"
                                : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                            border: "none",
                            borderRadius: 10,
                            padding: "8px 22px",
                            color: "#fff",
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 600,
                            fontSize: 14,
                            cursor: loading ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            opacity: !input.trim() ? 0.4 : 1,
                        }}
                    >
                        {loading ? (
                            <>
                                <Spinner />
                                Analyzing…
                            </>
                        ) : "Analyze Reviews →"}
                    </motion.button>
                </div>
            </motion.div>

            {/* Platform pills */}
            <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SUPPORTED_PLATFORMS.map((p) => (
                    <motion.button
                        key={p.label}
                        onClick={() => setHint(hint === p.label ? null : p.label)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                            background: hint === p.label
                                ? "rgba(139,92,246,0.2)"
                                : "rgba(255,255,255,0.04)",
                            border: hint === p.label
                                ? "1px solid rgba(139,92,246,0.5)"
                                : "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 20,
                            padding: "5px 14px",
                            color: hint === p.label ? "#a78bfa" : "#64748b",
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: "pointer",
                            fontFamily: "Inter, sans-serif",
                            transition: "all 0.2s",
                        }}
                    >
                        {p.label}
                    </motion.button>
                ))}
            </div>

            {/* Hint tooltip */}
            <AnimatePresence>
                {hint && (
                    <motion.div
                        key={hint}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            marginTop: 10,
                            padding: "10px 14px",
                            background: "rgba(139,92,246,0.08)",
                            border: "1px solid rgba(139,92,246,0.2)",
                            borderRadius: 10,
                            fontSize: 12,
                            color: "#a78bfa",
                            fontFamily: "monospace",
                        }}
                    >
                        Example: {SUPPORTED_PLATFORMS.find(p => p.label === hint)?.hint}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Spinner() {
    return (
        <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            style={{ display: "inline-block", fontSize: 14 }}
        >
            ◌
        </motion.span>
    );
}