const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useSubscription } from "@/components/shared/useSubscription";
import ToolGate, { incrementTrialUsage } from "@/components/shared/ToolGate";
import PlatformSelector from "@/components/shared/PlatformSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, TrendingUp, BarChart3, Gauge, Sparkles, Copy, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function KeywordResearch() {
  const { subscription, loading, user } = useSubscription();
  const [platform, setPlatform] = useState("youtube");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) { toast.error("কিওয়ার্ড লিখুন"); return; }
    setSearching(true);
    setResults(null);

    const res = await db.integrations.Core.InvokeLLM({
      prompt: `You are a professional ${platform} SEO analyst. Perform comprehensive keyword research for: "${query}" on ${platform}. Generate 15 keywords with realistic varied data. Mix short-tail (high volume, high competition) and long-tail (lower volume, lower competition). Also provide 10 related keyword suggestions and a top opportunity insight.`,
      response_json_schema: {
        type: "object",
        properties: {
          keywords: {
            type: "array",
            items: {
              type: "object",
              properties: {
                keyword: { type: "string" },
                search_volume: { type: "string" },
                competition: { type: "string", enum: ["Low", "Medium", "High"] },
                difficulty: { type: "number" },
                is_long_tail: { type: "boolean" },
                cpc_estimate: { type: "string" },
                trend: { type: "string", enum: ["Rising", "Stable", "Declining"] }
              }
            }
          },
          top_opportunity: { type: "string" },
          suggestions: { type: "array", items: { type: "string" } }
        }
      },
    });

    setResults(res);
    setSearching(false);
    incrementTrialUsage();

    if (user) await db.entities.UsageLog.create({
      user_email: user.email,
      tool_name: "Keyword Research",
      platform,
      timestamp: new Date().toISOString()
    });
  };

  const diffColor = (d) => d <= 30 ? "text-green-400" : d <= 60 ? "text-yellow-400" : "text-red-400";
  const diffBg = (d) => d <= 30 ? "bg-green-500/10" : d <= 60 ? "bg-yellow-500/10" : "bg-red-500/10";
  const compColors = { Low: "bg-green-500/15 text-green-400 border-green-500/20", Medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20", High: "bg-red-500/15 text-red-400 border-red-500/20" };
  const trendIcon = (t) => t === "Rising" ? "↑" : t === "Declining" ? "↓" : "→";
  const trendColor = (t) => t === "Rising" ? "text-green-400" : t === "Declining" ? "text-red-400" : "text-muted-foreground";

  const copyKeyword = (kw) => {
    navigator.clipboard.writeText(kw);
    toast.success("Copied!");
  };

  const saveResults = async () => {
    if (!user) { toast.error("Login করুন"); return; }
    await db.entities.SavedProject.create({
      user_email: user.email,
      title: `Keywords: ${query}`,
      type: "keywords",
      platform,
      content: JSON.stringify(results)
    });
    toast.success("Saved to Collections!");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg"
            style={{ boxShadow: "0 4px 16px rgba(59,130,246,0.4)" }}>
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Keyword Research</h1>
            <p className="text-xs text-muted-foreground">Discover viral SEO keywords for any platform</p>
          </div>
        </div>
      </motion.div>

      <ToolGate subscription={subscription} loading={loading} toolName="keyword_research">
        {/* Search Box */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <PlatformSelector selected={platform} onChange={setPlatform} />
            <div className="flex gap-3">
              <Input
                placeholder="কিওয়ার্ড বা টপিক লিখুন..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !searching && handleSearch()}
                className="flex-1 h-11 bg-white/5 border-white/10 focus:border-primary/40 rounded-xl"
              />
              <Button
                onClick={handleSearch}
                disabled={searching}
                className="h-11 px-6 gradient-primary text-white gap-2 rounded-xl font-semibold"
                style={{ boxShadow: searching ? "none" : "0 4px 16px rgba(147,87,255,0.35)" }}
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {searching ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Loading shimmer */}
        <AnimatePresence>
          {searching && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {results && !searching && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

              {/* Top opportunity */}
              {results.top_opportunity && (
                <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-2xl"
                  style={{ background: "rgba(147,87,255,0.1)", border: "1px solid rgba(147,87,255,0.25)" }}>
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wide">🎯 Top Opportunity</p>
                    <p className="text-sm">{results.top_opportunity}</p>
                  </div>
                </motion.div>
              )}

              {/* Keywords table card */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-white/8">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold">{results.keywords?.length || 0} Keywords Found</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-white/12 hover:bg-white/8"
                        onClick={() => {
                          navigator.clipboard.writeText(results.keywords?.map(k => k.keyword).join("\n") || "");
                          toast.success("All keywords copied!");
                        }}>
                        <Copy className="w-3 h-3" /> Copy All
                      </Button>
                      {user && (
                        <Button size="sm" className="h-8 text-xs gap-1.5 gradient-primary text-white" onClick={saveResults}>
                          <Bookmark className="w-3 h-3" /> Save
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/6">
                          {["Keyword", "Volume", "Competition", "Difficulty", "Type", "Trend", "CPC"].map(h => (
                            <th key={h} className="text-left py-3 px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.keywords?.map((kw, i) => (
                          <motion.tr
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.02 * i }}
                            className="border-b border-white/5 hover:bg-white/4 transition-colors group cursor-pointer"
                            onClick={() => copyKeyword(kw.keyword)}
                          >
                            <td className="py-3 px-3 font-medium max-w-[180px]">
                              <div className="flex items-center gap-2">
                                <span className="truncate">{kw.keyword}</span>
                                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-40 flex-shrink-0 transition-opacity" />
                              </div>
                            </td>
                            <td className="py-3 px-3 text-sm text-muted-foreground whitespace-nowrap">{kw.search_volume}</td>
                            <td className="py-3 px-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${compColors[kw.competition]}`}>
                                {kw.competition}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`text-sm font-bold px-2 py-0.5 rounded-lg ${diffBg(kw.difficulty)} ${diffColor(kw.difficulty)}`}>
                                {kw.difficulty}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              {kw.is_long_tail
                                ? <span className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full">Long-tail</span>
                                : <span className="text-xs bg-white/8 text-muted-foreground border border-white/10 px-2 py-0.5 rounded-full">Short</span>
                              }
                            </td>
                            <td className="py-3 px-3">
                              <span className={`text-sm font-semibold ${trendColor(kw.trend)}`}>
                                {trendIcon(kw.trend)} {kw.trend}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">{kw.cpc_estimate}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>

              {/* Suggestions */}
              {results.suggestions?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="glass-card rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Gauge className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold">Related Suggestions</span>
                      <span className="text-xs text-muted-foreground bg-white/6 px-2 py-0.5 rounded-full">{results.suggestions.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {results.suggestions.map((s, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.02 * i }}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setQuery(s)}
                          className="text-xs px-3 py-1.5 rounded-full bg-white/6 border border-white/10 hover:bg-primary/15 hover:border-primary/30 hover:text-primary transition-all"
                        >
                          {s}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </ToolGate>
    </div>
  );
}