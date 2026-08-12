const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useSubscription } from "@/components/shared/useSubscription";
import ToolGate, { incrementTrialUsage } from "@/components/shared/ToolGate";
import PlatformSelector from "@/components/shared/PlatformSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Loader2, TrendingUp, Hash, Search, Target, Copy } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function CompetitorAnalyzer() {
  const { subscription, loading, user } = useSubscription();
  const [platform, setPlatform] = useState("instagram");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!query.trim()) { toast.error("Competitor username বা keyword লিখুন"); return; }
    setAnalyzing(true);
    setResults(null);

    const res = await db.integrations.Core.InvokeLLM({
      prompt: `You are a social media competitive intelligence expert. Deep analyze "${query}" on ${platform}.
Provide: overview, estimated engagement rate, posting frequency, content strategy, 3 strengths, 3 gaps/opportunities, 8-10 top hashtags, 8-10 keywords, 5 action items ranked by potential impact.`,
      response_json_schema: {
        type: "object",
        properties: {
          overview: { type: "string" },
          estimated_engagement_rate: { type: "string" },
          top_hashtags: { type: "array", items: { type: "string" } },
          top_keywords: { type: "array", items: { type: "string" } },
          content_strategy: { type: "string" },
          posting_frequency: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          opportunities: { type: "array", items: { type: "string" } },
          action_items: { type: "array", items: { type: "string" } }
        }
      },
    });

    setResults(res);
    setAnalyzing(false);
    incrementTrialUsage();

    if (user) await db.entities.UsageLog.create({
      user_email: user.email,
      tool_name: "Competitor Analyzer",
      platform,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-400 flex items-center justify-center shadow-lg"
            style={{ boxShadow: "0 4px 16px rgba(14,165,233,0.4)" }}>
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Competitor Analyzer</h1>
            <p className="text-xs text-muted-foreground">Find gaps and opportunities to outperform</p>
          </div>
        </div>
      </motion.div>

      <ToolGate subscription={subscription} loading={loading} toolName="competitor_analyzer">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <PlatformSelector selected={platform} onChange={setPlatform} />
            <div className="flex gap-3">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Competitor username বা keyword..."
                onKeyDown={(e) => e.key === "Enter" && !analyzing && handleAnalyze()}
                className="flex-1 h-11 bg-white/5 border-white/10 focus:border-primary/40 rounded-xl"
              />
              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="h-11 px-6 gradient-primary text-white gap-2 rounded-xl font-semibold"
                style={{ boxShadow: analyzing ? "none" : "0 4px 16px rgba(147,87,255,0.35)" }}
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {analyzing ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {analyzing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {results && !analyzing && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Stats */}
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { icon: TrendingUp, label: "Engagement Rate", value: results.estimated_engagement_rate, color: "text-green-400" },
                  { icon: Hash, label: "Posting Frequency", value: results.posting_frequency, color: "text-blue-400" },
                  { icon: Target, label: "Strategy", value: results.content_strategy, color: "text-violet-400" },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.06 * i }}
                    className="glass-card rounded-2xl p-4 text-center">
                    <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                    <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                    <p className={`text-sm font-bold ${stat.color} truncate`}>{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Overview */}
              <div className="glass-card rounded-2xl p-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">📊 Overview</p>
                <p className="text-sm leading-relaxed">{results.overview}</p>
              </div>

              {/* Strengths & Opportunities */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass-card rounded-2xl p-4">
                  <p className="text-xs font-bold text-green-400 uppercase tracking-wide mb-3">✅ Strengths to Learn</p>
                  <ul className="space-y-2">
                    {results.strengths?.map((s, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                        className="flex items-start gap-2 text-xs">
                        <span className="w-4 h-4 rounded-full bg-green-500/15 text-green-400 text-[9px] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                        {s}
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card rounded-2xl p-4">
                  <p className="text-xs font-bold text-orange-400 uppercase tracking-wide mb-3">🎯 Your Opportunities</p>
                  <ul className="space-y-2">
                    {results.opportunities?.map((o, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                        className="flex items-start gap-2 text-xs">
                        <span className="w-4 h-4 rounded-full bg-orange-500/15 text-orange-400 text-[9px] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                        {o}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Hashtags & Keywords */}
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: "🏷️ Top Hashtags", items: results.top_hashtags },
                  { label: "🔍 Keywords", items: results.top_keywords },
                ].map((group, gi) => (
                  <div key={gi} className="glass-card rounded-2xl p-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">{group.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.items?.map((item, i) => (
                        <motion.button key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.03 * i }}
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => { navigator.clipboard.writeText(item); toast.success("Copied!"); }}
                          className="text-xs px-2.5 py-1 rounded-full bg-white/6 border border-white/10 hover:bg-primary/15 hover:border-primary/30 hover:text-primary transition-all">
                          {item}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Items */}
              <div className="glass-card rounded-2xl p-4">
                <p className="text-xs font-bold text-primary uppercase tracking-wide mb-3">⚡ Action Items (by Impact)</p>
                <ul className="space-y-2">
                  {results.action_items?.map((item, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}
                      className="flex items-start gap-2.5 text-xs p-2.5 bg-white/4 border border-white/6 rounded-xl">
                      <span className="w-5 h-5 rounded-lg gradient-primary text-white text-[10px] flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</span>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ToolGate>
    </div>
  );
}