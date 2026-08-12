const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useSubscription } from "@/components/shared/useSubscription";
import ToolGate, { incrementTrialUsage } from "@/components/shared/ToolGate";
import PlatformSelector from "@/components/shared/PlatformSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Loader2, Copy, Flame } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function HookGenerator() {
  const { subscription, loading, user } = useSubscription();
  const [platform, setPlatform] = useState("tiktok");
  const [topic, setTopic] = useState("");
  const [results, setResults] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) { toast.error("টপিক লিখুন"); return; }
    setGenerating(true);
    setResults(null);

    const res = await db.integrations.Core.InvokeLLM({
      prompt: `You are a viral content hook specialist for ${platform}. Generate 10 ultra-high-converting hooks for "${topic}" on ${platform}.
Hook styles: shocking stat, controversial opinion, confession style, curiosity gap question, story time, before/after, common mistake, insider secret, fear/urgency, bold promise.
For each: the hook text, psychological trigger used, engagement score 1-10.`,
      response_json_schema: {
        type: "object",
        properties: {
          hooks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                hook: { type: "string" },
                style: { type: "string" },
                engagement_score: { type: "number" }
              }
            }
          }
        }
      }
    });

    setResults(res);
    setGenerating(false);
    incrementTrialUsage();

    if (user) await db.entities.UsageLog.create({
      user_email: user.email,
      tool_name: "Hook Generator",
      platform,
      timestamp: new Date().toISOString()
    });
  };

  const scoreColor = (s) => s >= 8 ? "text-green-400 bg-green-500/10" : s >= 6 ? "text-yellow-400 bg-yellow-500/10" : "text-muted-foreground bg-white/8";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-400 flex items-center justify-center shadow-lg"
            style={{ boxShadow: "0 4px 16px rgba(234,179,8,0.4)" }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Hook Generator</h1>
            <p className="text-xs text-muted-foreground">10 viral scroll-stopping hooks instantly</p>
          </div>
        </div>
      </motion.div>

      <ToolGate subscription={subscription} loading={loading} toolName="hook_generator">
        {/* Input */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <PlatformSelector selected={platform} onChange={setPlatform} />
            <div className="flex gap-3">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="আপনার টপিক লিখুন..."
                onKeyDown={(e) => e.key === "Enter" && !generating && handleGenerate()}
                className="flex-1 h-11 bg-white/5 border-white/10 focus:border-primary/40 rounded-xl"
              />
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="h-11 px-6 gradient-primary text-white gap-2 rounded-xl font-semibold"
                style={{ boxShadow: generating ? "none" : "0 4px 16px rgba(234,179,8,0.35)" }}
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {generating ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Loading */}
        <AnimatePresence>
          {generating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" style={{ animationDelay: `${i * 0.08}s` }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {results && !generating && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-bold">{results.hooks?.length || 0} Viral Hooks</span>
                </div>
                <div className="divide-y divide-white/5">
                  {results.hooks?.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * i }}
                      className="flex items-start gap-3 px-4 py-4 group hover:bg-white/3 transition-colors"
                    >
                      {/* Number badge */}
                      <div className="w-7 h-7 rounded-xl gradient-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug mb-2">{item.hook}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground bg-white/6 border border-white/8 px-2 py-0.5 rounded-full">
                            {item.style}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreColor(item.engagement_score)}`}>
                            ⚡ {item.engagement_score}/10
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={() => { navigator.clipboard.writeText(item.hook); toast.success("Hook copied!"); }}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ToolGate>
    </div>
  );
}