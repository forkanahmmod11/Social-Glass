const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useMemo } from "react";

import { useSubscription } from "@/components/shared/useSubscription";
import ToolGate, { incrementTrialUsage } from "@/components/shared/ToolGate";
import PlatformSelector from "@/components/shared/PlatformSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Hash, Loader2, Copy, Bookmark, Sparkles, ChevronDown,
  TrendingUp, Clock, Target, Activity, Zap, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const GROUPS = [
  { key: "low_competition", label: "Low Competition", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", dot: "bg-green-400", desc: "Easy to rank • Niche reach" },
  { key: "medium_competition", label: "Medium Competition", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", dot: "bg-yellow-400", desc: "Balanced reach" },
  { key: "high_competition", label: "High Competition", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", dot: "bg-red-400", desc: "Broad exposure" },
];

const containerStagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemSlide = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

function MiniStat({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      variants={itemSlide}
      className="glass-card rounded-2xl p-4 flex items-center gap-3"
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(147,87,255,0.12)" }}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm font-bold truncate">{value}</p>
      </div>
    </motion.div>
  );
}

export default function HashtagGenerator() {
  const { subscription, loading, user } = useSubscription();
  const [platform, setPlatform] = useState("instagram");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const totalHashtags = useMemo(
    () => GROUPS.reduce((sum, g) => sum + (results?.[g.key]?.length || 0), 0),
    [results]
  );

  const handleGenerate = async () => {
    if (!query.trim()) { toast.error("টপিক লিখুন"); return; }
    setGenerating(true);
    setResults(null);
    setShowAnalysis(false);

    const res = await db.integrations.Core.InvokeLLM({
      prompt: `You are an expert ${platform} hashtag strategist doing a DEEP analysis for: "${query}" on ${platform}.

Generate 10 hashtags per competition tier:
- low_competition: niche tags 10K-500K posts (easy to rank, fast discovery)
- medium_competition: 500K-5M posts (balanced reach)
- high_competition: 5M+ posts (broad exposure, algorithm push)
Each hashtag: the #tag and an estimated post count string.

ALSO perform a deep strategic analysis:
- estimated_reach: realistic estimated reach potential for this set (e.g. "12K-45K accounts")
- optimal_mix: recommended hashtag mix ratio (e.g. "5 low / 3 medium / 2 high")
- best_time: best posting window for max hashtag discovery on ${platform}
- trend_prediction: short 1-line prediction of which tags will trend up
- engagement_boost: expected engagement lift % (e.g. "+18-32% vs untagged")
- pro_tip: one advanced insider tactic for this niche's hashtag strategy
- strategy_tip: overall strategy summary

Be specific, realistic, and data-driven.`.trim(),
      response_json_schema: {
        type: "object",
        properties: {
          low_competition: { type: "array", items: { type: "object", properties: { tag: { type: "string" }, posts: { type: "string" } } } },
          medium_competition: { type: "array", items: { type: "object", properties: { tag: { type: "string" }, posts: { type: "string" } } } },
          high_competition: { type: "array", items: { type: "object", properties: { tag: { type: "string" }, posts: { type: "string" } } } },
          strategy_tip: { type: "string" },
          estimated_reach: { type: "string" },
          optimal_mix: { type: "string" },
          best_time: { type: "string" },
          trend_prediction: { type: "string" },
          engagement_boost: { type: "string" },
          pro_tip: { type: "string" },
        }
      },
    });

    setResults(res);
    setGenerating(false);
    incrementTrialUsage();

    if (user) await db.entities.UsageLog.create({
      user_email: user.email,
      tool_name: "Hashtag Generator",
      platform,
      timestamp: new Date().toISOString()
    });
  };

  const copyGroup = (tags) => {
    navigator.clipboard.writeText(tags.map(t => t.tag).join(" "));
    toast.success("Hashtags copied!");
  };

  const copyAll = () => {
    const all = GROUPS.flatMap(g => results?.[g.key] || []).map(t => t.tag).join(" ");
    navigator.clipboard.writeText(all);
    toast.success(`All ${totalHashtags} hashtags copied!`);
  };

  const saveResults = async () => {
    if (!user) return;
    await db.entities.SavedProject.create({
      user_email: user.email,
      title: `Hashtags: ${query}`,
      type: "hashtags",
      platform,
      content: JSON.stringify(results)
    });
    toast.success("Saved to Collections!");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 26 }}>
        <div className="flex items-center gap-3 mb-1">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.1 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center shadow-lg"
            style={{ boxShadow: "0 4px 16px rgba(139,92,246,0.4)" }}
          >
            <Hash className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold">Hashtag Generator</h1>
            <p className="text-xs text-muted-foreground">Viral hashtags + deep reach analysis</p>
          </div>
        </div>
      </motion.div>

      <ToolGate subscription={subscription} loading={loading} toolName="hashtag_generator">
        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, type: "spring", stiffness: 280, damping: 24 }}
        >
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <PlatformSelector selected={platform} onChange={setPlatform} />
            <div className="flex gap-3">
              <Input
                placeholder="টপিক বা নিশ লিখুন..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !generating && handleGenerate()}
                className="flex-1 h-11 bg-white/5 border-white/10 focus:border-primary/40 rounded-xl"
              />
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="h-11 px-6 gradient-primary text-white gap-2 rounded-xl font-semibold"
                style={{ boxShadow: generating ? "none" : "0 4px 16px rgba(147,87,255,0.35)" }}
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />}
                {generating ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Loading — animated shimmer skeleton */}
        <AnimatePresence>
          {generating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="h-32 rounded-2xl overflow-hidden relative"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: i * 0.1 }}
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(147,87,255,0.08), transparent)" }}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence mode="wait">
          {results && !generating && (
            <motion.div
              key="results"
              variants={containerStagger}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: 12 }}
              className="space-y-4"
            >
              {/* Strategy tip */}
              {results.strategy_tip && (
                <motion.div
                  variants={itemSlide}
                  className="flex items-start gap-3 p-4 rounded-2xl"
                  style={{ background: "rgba(147,87,255,0.1)", border: "1px solid rgba(147,87,255,0.25)" }}
                >
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wide">💡 Strategy Tip</p>
                    <p className="text-sm">{results.strategy_tip}</p>
                  </div>
                </motion.div>
              )}

              {/* Deep analysis stats */}
              <motion.div variants={itemSlide} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MiniStat icon={TrendingUp} label="Est. Reach" value={results.estimated_reach || "—"} color="text-green-400" />
                <MiniStat icon={Target} label="Optimal Mix" value={results.optimal_mix || "—"} color="text-violet-400" />
                <MiniStat icon={Clock} label="Best Time" value={results.best_time || "—"} color="text-blue-400" />
                <MiniStat icon={Activity} label="Eng. Boost" value={results.engagement_boost || "—"} color="text-orange-400" />
              </motion.div>

              {/* Expandable deep analysis */}
              <motion.div variants={itemSlide}>
                <button
                  onClick={() => setShowAnalysis((v) => !v)}
                  className="w-full glass-card rounded-2xl p-4 flex items-center justify-between hover:border-white/15 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(147,87,255,0.12)" }}>
                      <BarChart3 className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-bold">Deep Analysis</span>
                  </div>
                  <motion.span animate={{ rotate: showAnalysis ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {showAnalysis && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 glass-card rounded-2xl p-4 space-y-3">
                        {results.trend_prediction && (
                          <div className="flex items-start gap-2.5 text-sm">
                            <Zap className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Trend Prediction</p>
                              <p>{results.trend_prediction}</p>
                            </div>
                          </div>
                        )}
                        {results.pro_tip && (
                          <div className="flex items-start gap-2.5 text-sm pt-3 border-t border-white/6">
                            <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Pro Insider Tip</p>
                              <p>{results.pro_tip}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Header actions */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-muted-foreground">{totalHashtags} hashtags generated</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-white/12 hover:bg-white/8" onClick={copyAll}>
                    <Copy className="w-3 h-3" /> Copy All
                  </Button>
                  {user && (
                    <Button size="sm" className="h-8 text-xs gap-1.5 gradient-primary text-white" onClick={saveResults}>
                      <Bookmark className="w-3 h-3" /> Save
                    </Button>
                  )}
                </div>
              </div>

              {/* Groups */}
              {GROUPS.map((group, gi) => (
                <motion.div
                  key={group.key}
                  variants={itemSlide}
                  className="glass-card rounded-2xl overflow-hidden"
                >
                  <div className={`flex items-center justify-between px-4 py-3 border-b border-white/6 ${group.bg}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${group.dot}`} />
                      <span className={`text-sm font-bold ${group.color}`}>{group.label}</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">— {group.desc}</span>
                    </div>
                    <Button
                      variant="ghost" size="sm"
                      className={`h-7 text-xs gap-1 ${group.color} hover:bg-white/8`}
                      onClick={() => copyGroup(results[group.key] || [])}
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </Button>
                  </div>
                  <div className="p-4 flex flex-wrap gap-2">
                    {results[group.key]?.map((t, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, scale: 0.85, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.5 + gi * 0.08 + i * 0.03, type: "spring", stiffness: 400, damping: 18 }}
                        whileHover={{ scale: 1.06, y: -2 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => { navigator.clipboard.writeText(t.tag); toast.success("Copied!"); }}
                        className={`text-xs px-3 py-1.5 rounded-full border ${group.bg} ${group.border} ${group.color} hover:opacity-80 transition-all`}
                      >
                        {t.tag}
                        <span className="text-muted-foreground ml-1 opacity-70">({t.posts})</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </ToolGate>
    </div>
  );
}