const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useSubscription } from "@/components/shared/useSubscription";
import ToolGate, { incrementTrialUsage } from "@/components/shared/ToolGate";
import PlatformSelector from "@/components/shared/PlatformSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { User, Loader2, CheckCircle, AlertTriangle, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

function ScoreBar({ label, value }) {
  const color = value >= 70 ? "#22c55e" : value >= 40 ? "#eab308" : "#ef4444";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-white/8 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

export default function ProfileAnalyzer() {
  const { subscription, loading, user } = useSubscription();
  const [platform, setPlatform] = useState("instagram");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [results, setResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!bio.trim() && !username.trim()) { toast.error("Username বা bio দিন"); return; }
    setAnalyzing(true);
    setResults(null);

    const res = await db.integrations.Core.InvokeLLM({
      prompt: `You are a ${platform} profile optimization expert. Analyze this profile: Username: ${username || "Not provided"}, Bio: "${bio || "Not provided"}"
Score 0-100 (realistic): overall, bio score, SEO score.
Provide: bio analysis, 3 strengths, 5 improvements, optimized bio rewrite (under 150 chars), 8 keyword suggestions, 5 growth tips.`,
      response_json_schema: {
        type: "object",
        properties: {
          overall_score: { type: "number" },
          bio_score: { type: "number" },
          seo_score: { type: "number" },
          bio_analysis: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          improvements: { type: "array", items: { type: "string" } },
          suggested_bio: { type: "string" },
          keyword_suggestions: { type: "array", items: { type: "string" } },
          growth_tips: { type: "array", items: { type: "string" } }
        }
      }
    });

    setResults(res);
    setAnalyzing(false);
    incrementTrialUsage();

    if (user) await db.entities.UsageLog.create({
      user_email: user.email,
      tool_name: "Profile Analyzer",
      platform,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-400 flex items-center justify-center shadow-lg"
            style={{ boxShadow: "0 4px 16px rgba(244,63,94,0.4)" }}>
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Profile Analyzer</h1>
            <p className="text-xs text-muted-foreground">Optimize your social media profile for growth</p>
          </div>
        </div>
      </motion.div>

      <ToolGate subscription={subscription} loading={loading} toolName="profile_analyzer">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <PlatformSelector selected={platform} onChange={setPlatform} />
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Username</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@username"
                className="h-11 bg-white/5 border-white/10 focus:border-primary/40 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Profile Bio</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="আপনার profile bio paste করুন..."
                className="h-24 bg-white/5 border-white/10 focus:border-primary/40 rounded-xl resize-none" />
            </div>
            <Button onClick={handleAnalyze} disabled={analyzing}
              className="h-11 w-full gradient-primary text-white gap-2 rounded-xl font-semibold"
              style={{ boxShadow: analyzing ? "none" : "0 4px 16px rgba(147,87,255,0.35)" }}>
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
              {analyzing ? "Analyzing..." : "Analyze Profile"}
            </Button>
          </div>
        </motion.div>

        <AnimatePresence>
          {analyzing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="h-32 rounded-2xl bg-white/5 animate-pulse" />
              <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {results && !analyzing && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Scores */}
              <div className="glass-card rounded-2xl p-5 space-y-4">
                <ScoreBar label="Overall Score" value={results.overall_score || 0} />
                <ScoreBar label="Bio Score" value={results.bio_score || 0} />
                <ScoreBar label="SEO Score" value={results.seo_score || 0} />
              </div>

              {/* Analysis */}
              <div className="glass-card rounded-2xl p-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Bio Analysis</p>
                <p className="text-sm leading-relaxed">{results.bio_analysis}</p>
              </div>

              {/* Strengths & Improvements */}
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
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />{s}
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-bold">Improvements</span>
                  </div>
                  <ul className="space-y-2">
                    {results.improvements?.map((imp, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                        className="flex items-start gap-2 text-xs">
                        <span className="w-4 h-4 rounded bg-yellow-500/15 text-yellow-400 text-[9px] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                        {imp}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggested Bio */}
              {results.suggested_bio && (
                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/6"
                    style={{ background: "rgba(34,197,94,0.06)" }}>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-bold text-green-400">Optimized Bio</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 hover:bg-white/8"
                      onClick={() => { navigator.clipboard.writeText(results.suggested_bio); toast.success("Bio copied!"); }}>
                      <Copy className="w-3 h-3" /> Copy
                    </Button>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium">{results.suggested_bio}</p>
                  </div>
                </div>
              )}

              {/* Keywords & Growth Tips */}
              {results.keyword_suggestions?.length > 0 && (
                <div className="glass-card rounded-2xl p-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">🏷️ Keyword Suggestions</p>
                  <div className="flex flex-wrap gap-2">
                    {results.keyword_suggestions.map((kw, i) => (
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

              {results.growth_tips?.length > 0 && (
                <div className="glass-card rounded-2xl p-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">🚀 Growth Tips</p>
                  <ul className="space-y-2">
                    {results.growth_tips.map((tip, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}
                        className="flex items-start gap-2.5 text-xs p-2.5 bg-white/4 border border-white/6 rounded-xl">
                        <span className="w-5 h-5 rounded-lg gradient-primary text-white text-[10px] flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</span>
                        {tip}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </ToolGate>
    </div>
  );
}