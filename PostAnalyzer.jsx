const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useSubscription } from "@/components/shared/useSubscription";
import ToolGate, { incrementTrialUsage } from "@/components/shared/ToolGate";
import PlatformSelector from "@/components/shared/PlatformSelector";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, CheckCircle, AlertTriangle, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const METRICS = [
  { key: "seo_score", label: "SEO Score", icon: "🔍" },
  { key: "keyword_optimization", label: "Keywords", icon: "🏷️" },
  { key: "engagement_potential", label: "Engagement", icon: "💬" },
  { key: "readability", label: "Readability", icon: "📖" },
  { key: "hook_strength", label: "Hook", icon: "⚡" },
  { key: "viral_potential", label: "Viral", icon: "🔥" },
];

function ScoreRing({ value, size = 56 }) {
  const r = 20, c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  const color = value >= 70 ? "#22c55e" : value >= 40 ? "#eab308" : "#ef4444";
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" className="-rotate-90">
      <circle cx="25" cy="25" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <motion.circle
        cx="25" cy="25" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeLinecap="round"
        initial={{ strokeDasharray: `0 ${c}` }}
        animate={{ strokeDasharray: `${dash} ${c - dash}` }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      />
    </svg>
  );
}

export default function PostAnalyzer() {
  const { subscription, loading, user } = useSubscription();
  const [platform, setPlatform] = useState("instagram");
  const [text, setText] = useState("");
  const [results, setResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) { toast.error("Post text পেস্ট করুন"); return; }
    setAnalyzing(true);
    setResults(null);

    const res = await db.integrations.Core.InvokeLLM({
      prompt: `You are a senior ${platform} content strategist. Deeply analyze this post: "${text}"
Score each 0-100 (realistic: most posts score 40-75): SEO, keywords, engagement, readability, hook strength, viral potential.
Provide: strengths, weaknesses, 5 actionable suggestions, 8 recommended keywords, improved rewritten version scoring 85+.`,
      response_json_schema: {
        type: "object",
        properties: {
          seo_score: { type: "number" },
          keyword_optimization: { type: "number" },
          engagement_potential: { type: "number" },
          readability: { type: "number" },
          hook_strength: { type: "number" },
          viral_potential: { type: "number" },
          strengths: { type: "array", items: { type: "string" } },
          weaknesses: { type: "array", items: { type: "string" } },
          suggestions: { type: "array", items: { type: "string" } },
          recommended_keywords: { type: "array", items: { type: "string" } },
          improved_version: { type: "string" }
        }
      }
    });

    setResults(res);
    setAnalyzing(false);
    incrementTrialUsage();

    if (user) await db.entities.UsageLog.create({
      user_email: user.email,
      tool_name: "Post Analyzer",
      platform,
      timestamp: new Date().toISOString()
    });
  };

  const scoreColor = (s) => s >= 70 ? "text-green-400" : s >= 40 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-lg"
            style={{ boxShadow: "0 4px 16px rgba(249,115,22,0.4)" }}>
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Post SEO Analyzer</h1>
            <p className="text-xs text-muted-foreground">Deep analysis + AI-rewritten optimized version</p>
          </div>
        </div>
      </motion.div>

      <ToolGate subscription={subscription} loading={loading} toolName="post_analyzer">
        {/* Input */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <PlatformSelector selected={platform} onChange={setPlatform} />
            <Textarea
              placeholder="আপনার post caption বা description এখানে paste করুন..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[140px] bg-white/5 border-white/10 focus:border-primary/40 rounded-xl resize-none"
            />
            <Button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="h-11 w-full gradient-primary text-white gap-2 rounded-xl font-semibold"
              style={{ boxShadow: analyzing ? "none" : "0 4px 16px rgba(147,87,255,0.35)" }}
            >
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {analyzing ? "Analyzing Post..." : "Analyze Post"}
            </Button>
          </div>
        </motion.div>

        {/* Loading */}
        <AnimatePresence>
          {analyzing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" style={{ animationDelay: `${i * 0.07}s` }} />
                ))}
              </div>
              <div className="h-40 rounded-2xl bg-white/5 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {results && !analyzing && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

              {/* Score cards */}
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                {METRICS.map((m, i) => {
                  const val = results[m.key] || 0;
                  return (
                    <motion.div
                      key={m.key}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.06 * i }}
                      className="glass-card rounded-2xl p-3 text-center"
                    >
                      <div className="flex items-center justify-center mb-1.5 relative">
                        <ScoreRing value={val} size={52} />
                        <span className="absolute text-[11px] font-bold" style={{ color: val >= 70 ? "#22c55e" : val >= 40 ? "#eab308" : "#ef4444" }}>
                          {val}
                        </span>
                      </div>
                      <p className="text-[10px] font-semibold text-muted-foreground">{m.icon} {m.label}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-bold">Strengths</span>
                  </div>
                  <ul className="space-y-2">
                    {results.strengths?.map((s, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                        className="flex items-start gap-2 text-xs">
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{s}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-bold">Weaknesses</span>
                  </div>
                  <ul className="space-y-2">
                    {results.weaknesses?.map((w, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                        className="flex items-start gap-2 text-xs">
                        <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span>{w}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggestions */}
              <div className="glass-card rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold">Improvement Suggestions</span>
                </div>
                <ul className="space-y-2">
                  {results.suggestions?.map((s, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}
                      className="flex items-start gap-2.5 text-xs p-2.5 bg-white/4 border border-white/6 rounded-xl">
                      <span className="w-5 h-5 rounded-lg gradient-primary text-white text-[10px] flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</span>
                      <span>{s}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Keywords */}
              {results.recommended_keywords?.length > 0 && (
                <div className="glass-card rounded-2xl p-4">
                  <p className="text-sm font-bold mb-3">🏷️ Recommended Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {results.recommended_keywords.map((kw, i) => (
                      <motion.button key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.03 * i }}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => { navigator.clipboard.writeText(kw); toast.success("Copied!"); }}
                        className="text-xs px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all">
                        {kw}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Improved version */}
              {results.improved_version && (
                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/6"
                    style={{ background: "rgba(34,197,94,0.06)" }}>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-bold text-green-400">AI-Improved Version</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 hover:bg-white/8"
                      onClick={() => { navigator.clipboard.writeText(results.improved_version); toast.success("Improved version copied!"); }}>
                      <Copy className="w-3 h-3" /> Copy
                    </Button>
                  </div>
                  <div className="p-4">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{results.improved_version}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </ToolGate>
    </div>
  );
}