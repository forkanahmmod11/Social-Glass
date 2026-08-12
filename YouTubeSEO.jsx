const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useSubscription } from "@/components/shared/useSubscription";
import ToolGate, { incrementTrialUsage } from "@/components/shared/ToolGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BarChart3, Loader2, CheckCircle, AlertTriangle, Copy, Tag } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const YT_METRICS = [
  { key: "overall_seo_score", label: "Overall SEO", icon: "🎯" },
  { key: "title_score", label: "Title", icon: "📝" },
  { key: "description_score", label: "Description", icon: "📄" },
  { key: "keyword_score", label: "Keywords", icon: "🔍" },
  { key: "ctr_potential", label: "CTR Potential", icon: "👆" },
  { key: "watch_time_potential", label: "Watch Time", icon: "⏱️" },
];

function MiniScoreCard({ label, value, icon }) {
  const color = value >= 70 ? "#22c55e" : value >= 40 ? "#eab308" : "#ef4444";
  const r = 14, c = 2 * Math.PI * r;
  return (
    <div className="glass-card rounded-2xl p-3 text-center">
      <div className="flex items-center justify-center mb-1 relative w-10 h-10 mx-auto">
        <svg width="40" height="40" viewBox="0 0 36 36" className="-rotate-90">
          <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
          <motion.circle cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${c}` }}
            animate={{ strokeDasharray: `${(value / 100) * c} ${c}` }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }} />
        </svg>
        <span className="absolute text-[10px] font-bold" style={{ color }}>{value}</span>
      </div>
      <p className="text-[9px] font-semibold text-muted-foreground">{icon} {label}</p>
    </div>
  );
}

export default function YouTubeSEO() {
  const { subscription, loading, user } = useSubscription();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [results, setResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!title.trim()) { toast.error("Video title লিখুন"); return; }
    setAnalyzing(true);
    setResults(null);

    const res = await db.integrations.Core.InvokeLLM({
      prompt: `You are a YouTube SEO expert. Audit this YouTube video: Title: "${title}", Description: "${description || "Not provided"}".
Score 0-100 (strict/realistic): overall SEO, title, description, keywords, CTR potential, watch time potential.
Provide: title analysis, 3 alternative titles, 20 suggested tags, 5 improvements, optimized description (500 words), thumbnail text suggestion.`,
      response_json_schema: {
        type: "object",
        properties: {
          overall_seo_score: { type: "number" },
          title_score: { type: "number" },
          description_score: { type: "number" },
          keyword_score: { type: "number" },
          ctr_potential: { type: "number" },
          watch_time_potential: { type: "number" },
          title_analysis: { type: "string" },
          suggested_titles: { type: "array", items: { type: "string" } },
          suggested_tags: { type: "array", items: { type: "string" } },
          improvements: { type: "array", items: { type: "string" } },
          optimized_description: { type: "string" },
          thumbnail_text: { type: "string" }
        }
      }
    });

    setResults(res);
    setAnalyzing(false);
    incrementTrialUsage();

    if (user) await db.entities.UsageLog.create({
      user_email: user.email,
      tool_name: "YouTube SEO",
      platform: "youtube",
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-400 flex items-center justify-center shadow-lg"
            style={{ boxShadow: "0 4px 16px rgba(239,68,68,0.4)" }}>
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">YouTube SEO Analyzer</h1>
            <p className="text-xs text-muted-foreground">Optimize videos for YouTube search algorithm</p>
          </div>
        </div>
      </motion.div>

      <ToolGate subscription={subscription} loading={loading} toolName="youtube_seo">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Video Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="আপনার YouTube video title লিখুন..."
                className="h-11 bg-white/5 border-white/10 focus:border-primary/40 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Video Description <span className="text-muted-foreground/50 normal-case">(optional)</span></Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Video description paste করুন..."
                className="min-h-[100px] bg-white/5 border-white/10 focus:border-primary/40 rounded-xl resize-none" />
            </div>
            <Button onClick={handleAnalyze} disabled={analyzing}
              className="h-11 w-full gradient-primary text-white gap-2 rounded-xl font-semibold"
              style={{ boxShadow: analyzing ? "none" : "0 4px 16px rgba(147,87,255,0.35)" }}>
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
              {analyzing ? "Analyzing SEO..." : "Analyze YouTube SEO"}
            </Button>
          </div>
        </motion.div>

        <AnimatePresence>
          {analyzing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" style={{ animationDelay: `${i * 0.07}s` }} />
                ))}
              </div>
              <div className="h-40 rounded-2xl bg-white/5 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {results && !analyzing && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              {/* Score cards */}
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                {YT_METRICS.map((m, i) => (
                  <motion.div key={m.key} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.06 * i }}>
                    <MiniScoreCard label={m.label} value={results[m.key] || 0} icon={m.icon} />
                  </motion.div>
                ))}
              </div>

              {/* Thumbnail text */}
              {results.thumbnail_text && (
                <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
                  <span className="text-xl">🖼️</span>
                  <div>
                    <p className="text-xs font-bold text-red-400 mb-0.5">Thumbnail Text Suggestion</p>
                    <p className="text-sm font-bold">{results.thumbnail_text}</p>
                  </div>
                </motion.div>
              )}

              {/* Alternative Titles */}
              {results.suggested_titles?.length > 0 && (
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-bold">Alternative Optimized Titles</span>
                  </div>
                  <div className="space-y-2">
                    {results.suggested_titles.map((t, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                        className="flex items-center justify-between gap-3 p-3 bg-white/4 border border-white/6 rounded-xl">
                        <p className="text-sm flex-1 leading-snug">{t}</p>
                        <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 hover:bg-white/8"
                          onClick={() => { navigator.clipboard.writeText(t); toast.success("Title copied!"); }}>
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {results.suggested_tags?.length > 0 && (
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold">Suggested Tags</span>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-white/12 hover:bg-white/8"
                      onClick={() => { navigator.clipboard.writeText(results.suggested_tags.join(", ")); toast.success("All tags copied!"); }}>
                      <Copy className="w-3 h-3" /> Copy All
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {results.suggested_tags.map((tag, i) => (
                      <motion.button key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.02 * i }}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => { navigator.clipboard.writeText(tag); toast.success("Copied!"); }}
                        className="text-xs px-3 py-1.5 rounded-full bg-white/6 border border-white/10 hover:bg-primary/15 hover:border-primary/30 hover:text-primary transition-all">
                        {tag}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvements */}
              {results.improvements?.length > 0 && (
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-bold">Improvements</span>
                  </div>
                  <ul className="space-y-2">
                    {results.improvements.map((item, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}
                        className="flex items-start gap-2.5 text-xs p-2.5 bg-white/4 border border-white/6 rounded-xl">
                        <span className="w-5 h-5 rounded-lg gradient-primary text-white text-[10px] flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</span>
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Optimized Description */}
              {results.optimized_description && (
                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/6"
                    style={{ background: "rgba(34,197,94,0.06)" }}>
                    <span className="text-sm font-bold text-green-400">✨ Optimized Description</span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 hover:bg-white/8"
                      onClick={() => { navigator.clipboard.writeText(results.optimized_description); toast.success("Description copied!"); }}>
                      <Copy className="w-3 h-3" /> Copy
                    </Button>
                  </div>
                  <div className="p-4 max-h-64 overflow-y-auto">
                    <p className="text-xs whitespace-pre-wrap leading-relaxed text-muted-foreground">{results.optimized_description}</p>
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