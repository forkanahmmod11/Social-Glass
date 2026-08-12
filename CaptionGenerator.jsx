const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useSubscription } from "@/components/shared/useSubscription";
import ToolGate, { incrementTrialUsage } from "@/components/shared/ToolGate";
import PlatformSelector from "@/components/shared/PlatformSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Loader2, Copy, Bookmark, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const TONES = [
  { label: "Viral", emoji: "🔥" },
  { label: "Professional", emoji: "💼" },
  { label: "Marketing", emoji: "📣" },
  { label: "Funny", emoji: "😂" },
];

export default function CaptionGenerator() {
  const { subscription, loading, user } = useSubscription();
  const [platform, setPlatform] = useState("instagram");
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState("Viral");
  const [results, setResults] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) { toast.error("টপিক লিখুন"); return; }
    setGenerating(true);
    setResults(null);

    const res = await db.integrations.Core.InvokeLLM({
      prompt: `You are a viral content creator for ${platform}. Generate 5 high-converting ${tone.toLowerCase()} captions for: "${topic}".
${context ? `Context: ${context}` : ""}
Each caption: powerful hook, full body with ${platform} formatting, CTA, 15-20 hashtags, engagement tip, best time to post.
Make each distinctly different: storytelling, question hook, bold statement, data/facts, humor.`,
      response_json_schema: {
        type: "object",
        properties: {
          captions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                style: { type: "string" },
                caption: { type: "string" },
                hashtags: { type: "string" },
                engagement_tip: { type: "string" },
                best_time_to_post: { type: "string" }
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
      tool_name: "Caption Generator",
      platform,
      timestamp: new Date().toISOString()
    });
  };

  const saveResults = async () => {
    if (!user) return;
    await db.entities.SavedProject.create({
      user_email: user.email,
      title: `Captions: ${topic}`,
      type: "captions",
      platform,
      content: JSON.stringify(results)
    });
    toast.success("Saved to Collections!");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg"
            style={{ boxShadow: "0 4px 16px rgba(16,185,129,0.4)" }}>
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Caption Generator</h1>
            <p className="text-xs text-muted-foreground">AI-powered engaging captions with hashtags</p>
          </div>
        </div>
      </motion.div>

      <ToolGate subscription={subscription} loading={loading} toolName="caption_generator">
        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <PlatformSelector selected={platform} onChange={setPlatform} />

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Topic / Subject</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="আপনার পোস্ট কিসের ব্যাপারে?"
                className="h-11 bg-white/5 border-white/10 focus:border-primary/40 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Additional Context <span className="text-muted-foreground/50 normal-case">(optional)</span></Label>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="আরও বিস্তারিত লিখুন..."
                className="h-20 bg-white/5 border-white/10 focus:border-primary/40 rounded-xl resize-none"
              />
            </div>

            {/* Tone selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tone</Label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <motion.button
                    key={t.label}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTone(t.label)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                      tone === t.label
                        ? "gradient-primary text-white shadow-lg"
                        : "bg-white/6 border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                    )}
                  >
                    {t.emoji} {t.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="h-11 w-full gradient-primary text-white gap-2 rounded-xl font-semibold"
              style={{ boxShadow: generating ? "none" : "0 4px 16px rgba(147,87,255,0.35)" }}
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
              {generating ? "Generating Captions..." : "Generate 5 Captions"}
            </Button>
          </div>
        </motion.div>

        {/* Loading */}
        <AnimatePresence>
          {generating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {results && !generating && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-muted-foreground">{results.captions?.length || 0} captions generated</p>
                {user && (
                  <Button size="sm" className="h-8 text-xs gap-1.5 gradient-primary text-white" onClick={saveResults}>
                    <Bookmark className="w-3 h-3" /> Save All
                  </Button>
                )}
              </div>

              {results.captions?.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i }}
                  className="glass-card rounded-2xl overflow-hidden"
                >
                  {/* Caption header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/6"
                    style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        #{i + 1} {item.style}
                      </span>
                    </div>
                    <Button
                      variant="ghost" size="sm"
                      className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground hover:bg-white/8"
                      onClick={() => {
                        navigator.clipboard.writeText(`${item.caption}\n\n${item.hashtags}`);
                        toast.success("Caption + hashtags copied!");
                      }}
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </Button>
                  </div>

                  {/* Caption body */}
                  <div className="p-4 space-y-3">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{item.caption}</p>

                    {item.hashtags && (
                      <div className="p-3 rounded-xl bg-violet-500/8 border border-violet-500/15">
                        <p className="text-xs text-violet-400 font-medium leading-relaxed">{item.hashtags}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      {item.engagement_tip && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="text-yellow-500">💡</span>
                          <span>{item.engagement_tip}</span>
                        </div>
                      )}
                      {item.best_time_to_post && (
                        <div className="flex items-center gap-1.5 text-xs text-orange-400 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>{item.best_time_to_post}</span>
                        </div>
                      )}
                    </div>
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