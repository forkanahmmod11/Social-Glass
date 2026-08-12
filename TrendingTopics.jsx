const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useSubscription } from "@/components/shared/useSubscription";
import ToolGate, { incrementTrialUsage } from "@/components/shared/ToolGate";
import PlatformSelector from "@/components/shared/PlatformSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Loader2, Flame, Clock, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TREND_STYLE = {
  Rising: { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/25", icon: "📈" },
  Hot: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/25", icon: "🔥" },
  Viral: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/25", icon: "💥" },
};

export default function TrendingTopics() {
  const { subscription, loading, user } = useSubscription();
  const [platform, setPlatform] = useState("tiktok");
  const [niche, setNiche] = useState("");
  const [results, setResults] = useState(null);
  const [fetching, setFetching] = useState(false);

  const handleFetch = async () => {
    setFetching(true);
    setResults(null);

    const res = await db.integrations.Core.InvokeLLM({
      prompt: `You are a real-time ${platform} trend analyst. Identify top 10 trending topics on ${platform}${niche ? ` in "${niche}" niche` : ""}.
For each: topic name, trend level (Rising/Hot/Viral), why trending, engagement multiplier, best content angle, specific post idea, best posting window.`,
      response_json_schema: {
        type: "object",
        properties: {
          trending_topics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                topic: { type: "string" },
                trend_level: { type: "string", enum: ["Rising", "Hot", "Viral"] },
                why_trending: { type: "string" },
                engagement_multiplier: { type: "string" },
                best_angle: { type: "string" },
                post_idea: { type: "string" },
                posting_window: { type: "string" }
              }
            }
          },
          platform_tip: { type: "string" }
        }
      },
    });

    setResults(res);
    setFetching(false);
    incrementTrialUsage();

    if (user) await db.entities.UsageLog.create({
      user_email: user.email,
      tool_name: "Trending Topics",
      platform,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center shadow-lg"
            style={{ boxShadow: "0 4px 16px rgba(34,197,94,0.4)" }}>
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Trending Topics</h1>
            <p className="text-xs text-muted-foreground">Discover what's viral right now</p>
          </div>
        </div>
      </motion.div>

      <ToolGate subscription={subscription} loading={loading} toolName="trending_topics">
        {/* Input */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <PlatformSelector selected={platform} onChange={setPlatform} />
            <div className="flex gap-3">
              <Input
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="নিশ লিখুন (optional)..."
                onKeyDown={(e) => e.key === "Enter" && !fetching && handleFetch()}
                className="flex-1 h-11 bg-white/5 border-white/10 focus:border-primary/40 rounded-xl"
              />
              <Button
                onClick={handleFetch}
                disabled={fetching}
                className="h-11 px-6 gradient-primary text-white gap-2 rounded-xl font-semibold"
                style={{ boxShadow: fetching ? "none" : "0 4px 16px rgba(34,197,94,0.35)" }}
              >
                {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                {fetching ? "Finding..." : "Find Trends"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Loading */}
        <AnimatePresence>
          {fetching && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {results && !fetching && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Platform tip */}
              {results.platform_tip && (
                <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 p-4 rounded-2xl"
                  style={{ background: "rgba(147,87,255,0.1)", border: "1px solid rgba(147,87,255,0.25)" }}>
                  <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wide">Platform Tip</p>
                    <p className="text-sm">{results.platform_tip}</p>
                  </div>
                </motion.div>
              )}

              {results.trending_topics?.map((item, i) => {
                const style = TREND_STYLE[item.trend_level] || TREND_STYLE["Rising"];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * i }}
                    className="glass-card rounded-2xl overflow-hidden"
                  >
                    <div className={`flex items-center justify-between px-4 py-3 border-b border-white/6 ${style.bg}`}>
                      <div className="flex items-center gap-2.5">
                        <Flame className={`w-4 h-4 ${style.text}`} />
                        <span className="text-sm font-bold">{item.topic}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.engagement_multiplier && (
                          <span className="text-xs text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                            {item.engagement_multiplier}
                          </span>
                        )}
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${style.bg} ${style.border} ${style.text}`}>
                          {style.icon} {item.trend_level}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      {item.why_trending && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground/70">Why trending: </span>
                          {item.why_trending}
                        </p>
                      )}
                      {item.best_angle && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground/70">Best angle: </span>
                          {item.best_angle}
                        </p>
                      )}
                      {item.post_idea && (
                        <div className="p-3 rounded-xl bg-primary/8 border border-primary/15">
                          <p className="text-xs font-bold text-primary mb-1">💡 Post Idea</p>
                          <p className="text-xs">{item.post_idea}</p>
                        </div>
                      )}
                      {item.posting_window && (
                        <div className="flex items-center gap-1.5 text-xs text-orange-400 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>{item.posting_window}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </ToolGate>
    </div>
  );
}