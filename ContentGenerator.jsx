const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useSubscription } from "@/components/shared/useSubscription";
import ToolGate, { incrementTrialUsage } from "@/components/shared/ToolGate";
import PlatformSelector from "@/components/shared/PlatformSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Copy, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const CONTENT_TYPES = [
  { value: "social_post", label: "📱 Social Media Post" },
  { value: "viral_hook", label: "⚡ Viral Hook" },
  { value: "video_script", label: "🎬 Short Video Script" },
  { value: "thread", label: "🧵 Thread Ideas" },
];

const ANGLES = [
  { label: "Educational", emoji: "📚", color: "text-blue-400" },
  { label: "Storytelling", emoji: "📖", color: "text-violet-400" },
  { label: "Opinion", emoji: "🔥", color: "text-orange-400" },
];

export default function ContentGenerator() {
  const { subscription, loading, user } = useSubscription();
  const [platform, setPlatform] = useState("instagram");
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState("social_post");
  const [results, setResults] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) { toast.error("টপিক লিখুন"); return; }
    setGenerating(true);
    setResults(null);

    const typeLabel = CONTENT_TYPES.find(t => t.value === contentType)?.label;
    const res = await db.integrations.Core.InvokeLLM({
      prompt: `You are a viral content expert for ${platform}. Generate 3 distinct high-quality ${typeLabel} about "${topic}" for ${platform}.
Angles: 1) Educational/Value-driven 2) Storytelling/Personal 3) Controversial/Opinion.
Each: scroll-stopping hook, platform-optimized body, strong CTA, posting time tip.`,
      response_json_schema: {
        type: "object",
        properties: {
          content_pieces: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                content: { type: "string" },
                tips: { type: "string" }
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
      tool_name: "Content Generator",
      platform,
      timestamp: new Date().toISOString()
    });
  };

  const saveResults = async () => {
    if (!user) return;
    await db.entities.SavedProject.create({
      user_email: user.email,
      title: `Content: ${topic}`,
      type: "content_ideas",
      platform,
      content: JSON.stringify(results)
    });
    toast.success("Saved to Collections!");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center shadow-lg"
            style={{ boxShadow: "0 4px 16px rgba(236,72,153,0.4)" }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Content Generator</h1>
            <p className="text-xs text-muted-foreground">AI-powered viral content creation</p>
          </div>
        </div>
      </motion.div>

      <ToolGate subscription={subscription} loading={loading} toolName="content_generator">
        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <PlatformSelector selected={platform} onChange={setPlatform} />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Topic</Label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="আপনার টপিক লিখুন..."
                  className="h-11 bg-white/5 border-white/10 focus:border-primary/40 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="h-11 bg-white/5 border-white/10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Angles preview */}
            <div className="flex gap-2">
              {ANGLES.map((a) => (
                <div key={a.label} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/8">
                  <span>{a.emoji}</span>
                  <span className={a.color}>{a.label}</span>
                </div>
              ))}
              <span className="text-xs text-muted-foreground flex items-center">← 3 angles generated</span>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="h-11 w-full gradient-primary text-white gap-2 rounded-xl font-semibold"
              style={{ boxShadow: generating ? "none" : "0 4px 16px rgba(147,87,255,0.35)" }}
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "Creating Content..." : "Generate Content"}
            </Button>
          </div>
        </motion.div>

        {/* Loading */}
        <AnimatePresence>
          {generating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {results && !generating && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-muted-foreground">{results.content_pieces?.length || 0} content pieces</p>
                {user && (
                  <Button size="sm" className="h-8 text-xs gap-1.5 gradient-primary text-white" onClick={saveResults}>
                    <Bookmark className="w-3 h-3" /> Save
                  </Button>
                )}
              </div>

              {results.content_pieces?.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i }}
                  className="glass-card rounded-2xl overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/6"
                    style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
                        {ANGLES[i]?.emoji} {item.title}
                      </span>
                    </div>
                    <Button
                      variant="ghost" size="sm"
                      className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground hover:bg-white/8"
                      onClick={() => { navigator.clipboard.writeText(item.content); toast.success("Copied!"); }}
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </Button>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{item.content}</p>
                    {item.tips && (
                      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-white/4 border border-white/6 rounded-xl p-3">
                        <span>💡</span>
                        <span>{item.tips}</span>
                      </div>
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