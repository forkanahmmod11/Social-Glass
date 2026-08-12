const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useSubscription } from "@/components/shared/useSubscription";
import ToolGate, { incrementTrialUsage } from "@/components/shared/ToolGate";
import PlatformSelector from "@/components/shared/PlatformSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Lightbulb, Loader2, Bookmark, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const IDEA_TYPES = [
  { value: "post", label: "📸 Post Ideas" },
  { value: "reel", label: "🎬 Reel Ideas" },
  { value: "short_video", label: "📱 Short Video Ideas" },
  { value: "thread", label: "🧵 Thread Ideas" },
];

const POTENTIAL_STYLE = {
  "Low": { text: "text-muted-foreground", bg: "bg-white/8", border: "border-white/10" },
  "Medium": { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  "High": { text: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
  "Very High": { text: "text-primary", bg: "bg-primary/10", border: "border-primary/25" },
};

export default function ContentIdeas() {
  const { subscription, loading, user } = useSubscription();
  const [platform, setPlatform] = useState("instagram");
  const [niche, setNiche] = useState("");
  const [ideaType, setIdeaType] = useState("post");
  const [results, setResults] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!niche.trim()) { toast.error("নিশ লিখুন"); return; }
    setGenerating(true);
    setResults(null);

    const typeLabel = IDEA_TYPES.find(t => t.value === ideaType)?.label;
    const res = await db.integrations.Core.InvokeLLM({
      prompt: `You are a viral ${platform} content strategist. Generate 10 specific, actionable ${typeLabel} for the "${niche}" niche on ${platform}.
For each: compelling title, description of the angle and why it works, viral potential (Low/Medium/High/Very High), best posting time. Make them highly specific to "${niche}" — no generic tips.`,
      response_json_schema: {
        type: "object",
        properties: {
          ideas: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                viral_potential: { type: "string", enum: ["Low", "Medium", "High", "Very High"] },
                best_time: { type: "string" }
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
      tool_name: "Content Ideas",
      platform,
      timestamp: new Date().toISOString()
    });
  };

  const saveResults = async () => {
    if (!user) return;
    await db.entities.SavedProject.create({
      user_email: user.email,
      title: `Ideas: ${niche}`,
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg"
            style={{ boxShadow: "0 4px 16px rgba(245,158,11,0.4)" }}>
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Content Ideas</h1>
            <p className="text-xs text-muted-foreground">Unlimited niche-specific content ideas</p>
          </div>
        </div>
      </motion.div>

      <ToolGate subscription={subscription} loading={loading} toolName="content_ideas">
        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <PlatformSelector selected={platform} onChange={setPlatform} />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Niche / Topic</Label>
                <Input
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. Fitness, Tech, Cooking..."
                  className="h-11 bg-white/5 border-white/10 focus:border-primary/40 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Content Type</Label>
                <Select value={ideaType} onValueChange={setIdeaType}>
                  <SelectTrigger className="h-11 bg-white/5 border-white/10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IDEA_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="h-11 w-full gradient-primary text-white gap-2 rounded-xl font-semibold"
              style={{ boxShadow: generating ? "none" : "0 4px 16px rgba(147,87,255,0.35)" }}
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
              {generating ? "Generating Ideas..." : "Generate 10 Ideas"}
            </Button>
          </div>
        </motion.div>

        {/* Loading */}
        <AnimatePresence>
          {generating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {results && !generating && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-muted-foreground">{results.ideas?.length || 0} ideas generated</p>
                {user && (
                  <Button size="sm" className="h-8 text-xs gap-1.5 gradient-primary text-white" onClick={saveResults}>
                    <Bookmark className="w-3 h-3" /> Save All
                  </Button>
                )}
              </div>

              <div className="grid gap-3">
                {results.ideas?.map((idea, i) => {
                  const style = POTENTIAL_STYLE[idea.viral_potential] || POTENTIAL_STYLE["Low"];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="glass-card rounded-2xl p-4 hover:border-white/15 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-lg gradient-primary text-white text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                            {i + 1}
                          </span>
                          <h3 className="text-sm font-semibold leading-snug">{idea.title}</h3>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${style.text} ${style.bg} ${style.border}`}>
                          {idea.viral_potential}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed ml-8 mb-2">{idea.description}</p>
                      {idea.best_time && (
                        <div className="flex items-center gap-1.5 ml-8 text-xs text-orange-400 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>{idea.best_time}</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ToolGate>
    </div>
  );
}