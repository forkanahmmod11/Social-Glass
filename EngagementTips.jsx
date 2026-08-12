const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useSubscription } from "@/components/shared/useSubscription";
import ToolGate, { incrementTrialUsage } from "@/components/shared/ToolGate";
import PlatformSelector from "@/components/shared/PlatformSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3, Loader2, Clock, Hash, MessageSquare, TrendingUp, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SECTIONS = [
  { key: "best_posting_times", label: "Best Posting Times", icon: Clock, color: "text-blue-400", renderType: "times" },
  { key: "hashtag_tips", label: "Hashtag Strategy", icon: Hash, color: "text-violet-400", renderType: "list" },
  { key: "caption_tips", label: "Caption Tips", icon: MessageSquare, color: "text-emerald-400", renderType: "list" },
  { key: "growth_hacks", label: "Growth Hacks", icon: TrendingUp, color: "text-orange-400", renderType: "numbered" },
  { key: "algorithm_tips", label: "Algorithm Tips", icon: Zap, color: "text-yellow-400", renderType: "numbered" },
];

export default function EngagementTips() {
  const { subscription, loading, user } = useSubscription();
  const [platform, setPlatform] = useState("instagram");
  const [niche, setNiche] = useState("");
  const [results, setResults] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    setResults(null);

    const res = await db.integrations.Core.InvokeLLM({
      prompt: `You are a ${platform} growth expert. Provide comprehensive, data-driven engagement strategy for ${platform}${niche ? ` in "${niche}" niche` : ""}.
Include: 6-8 best posting times (day, time, engagement level), hashtag strategy tips, caption tips, 5 growth hacks, algorithm tips. All actionable and platform-specific.`,
      response_json_schema: {
        type: "object",
        properties: {
          best_posting_times: { type: "array", items: { type: "object", properties: { day: { type: "string" }, time: { type: "string" }, engagement_level: { type: "string" } } } },
          hashtag_tips: { type: "array", items: { type: "string" } },
          caption_tips: { type: "array", items: { type: "string" } },
          growth_hacks: { type: "array", items: { type: "string" } },
          algorithm_tips: { type: "array", items: { type: "string" } }
        }
      },
    });

    setResults(res);
    setGenerating(false);
    incrementTrialUsage();

    if (user) await db.entities.UsageLog.create({
      user_email: user.email,
      tool_name: "Engagement Tips",
      platform,
      timestamp: new Date().toISOString()
    });
  };

  const engLevel = (e) => {
    const s = (e || "").toLowerCase();
    if (s.includes("high") || s.includes("peak")) return "text-green-400";
    if (s.includes("medium") || s.includes("moderate")) return "text-yellow-400";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-400 flex items-center justify-center shadow-lg"
            style={{ boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}>
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Engagement Booster</h1>
            <p className="text-xs text-muted-foreground">AI-powered tips to maximize your reach</p>
          </div>
        </div>
      </motion.div>

      <ToolGate subscription={subscription} loading={loading} toolName="engagement_tips">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <PlatformSelector selected={platform} onChange={setPlatform} />
            <div className="flex gap-3">
              <Input
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="আপনার নিশ লিখুন (optional)..."
                onKeyDown={(e) => e.key === "Enter" && !generating && handleGenerate()}
                className="flex-1 h-11 bg-white/5 border-white/10 focus:border-primary/40 rounded-xl"
              />
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="h-11 px-6 gradient-primary text-white gap-2 rounded-xl font-semibold"
                style={{ boxShadow: generating ? "none" : "0 4px 16px rgba(147,87,255,0.35)" }}
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                {generating ? "Generating..." : "Get Tips"}
              </Button>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {generating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {results && !generating && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Posting Times */}
              {results.best_posting_times?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="glass-card rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-bold">Best Posting Times</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {results.best_posting_times.map((item, i) => (
                        <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 * i }}
                          className="text-center p-3 rounded-xl bg-blue-500/8 border border-blue-500/15">
                          <p className="text-xs font-bold text-blue-300">{item.day}</p>
                          <p className="text-sm font-bold text-blue-400 my-0.5">{item.time}</p>
                          <p className={`text-[10px] font-medium ${engLevel(item.engagement_level)}`}>{item.engagement_level}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Other sections */}
              {SECTIONS.filter(s => s.key !== "best_posting_times").map((section, si) => (
                <motion.div key={section.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * si }}>
                  <div className="glass-card rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <section.icon className={`w-4 h-4 ${section.color}`} />
                      <span className="text-sm font-bold">{section.label}</span>
                    </div>
                    {section.renderType === "numbered" ? (
                      <ul className="space-y-2">
                        {results[section.key]?.map((item, i) => (
                          <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i }}
                            className="flex items-start gap-2.5 text-xs p-2.5 bg-white/4 border border-white/6 rounded-xl">
                            <span className={`w-5 h-5 rounded-lg gradient-primary text-white text-[10px] flex items-center justify-center flex-shrink-0 font-bold`}>{i + 1}</span>
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="space-y-2">
                        {results[section.key]?.map((item, i) => (
                          <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i }}
                            className="flex items-start gap-2 text-xs">
                            <span className={`${section.color} mt-0.5`}>▸</span>
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                    )}
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