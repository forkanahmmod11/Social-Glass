const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import { useSubscription } from "@/components/shared/useSubscription";
import { PLAN_CONFIG } from "@/components/shared/PlanConfig";
import {
  Search, Hash, FileText, MessageSquare, Sparkles, Zap, Lightbulb,
  TrendingUp, Users, BarChart3, User, ArrowRight, Crown, Calendar,
  ScrollText, ChevronRight, Activity, Clock, Flame, Star, Play } from
"lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import TriangleLoader from "@/components/shared/TriangleLoader";
import HeroVideoCard from "@/components/shared/HeroVideoCard";

const tools = [
{ name: "Keyword Research", icon: Search, page: "KeywordResearch", desc: "Find viral SEO keywords", gradient: "from-blue-500 to-cyan-400", color: "#3b82f6" },
{ name: "Hashtag Generator", icon: Hash, page: "HashtagGenerator", desc: "Trending hashtags", gradient: "from-violet-500 to-purple-400", color: "#8b5cf6" },
{ name: "Post Analyzer", icon: FileText, page: "PostAnalyzer", desc: "Analyze post SEO", gradient: "from-orange-500 to-amber-400", color: "#f97316" },
{ name: "Caption Generator", icon: MessageSquare, page: "CaptionGenerator", desc: "Engaging captions", gradient: "from-emerald-500 to-teal-400", color: "#10b981" },
{ name: "Long Script", icon: ScrollText, page: "LongScriptGenerator", desc: "Full video scripts", gradient: "from-violet-600 to-indigo-500", color: "#7c3aed" },
{ name: "Content Generator", icon: Sparkles, page: "ContentGenerator", desc: "AI content creation", gradient: "from-pink-500 to-rose-400", color: "#ec4899" },
{ name: "Hook Generator", icon: Zap, page: "HookGenerator", desc: "Viral hooks", gradient: "from-yellow-500 to-orange-400", color: "#eab308" },
{ name: "Content Ideas", icon: Lightbulb, page: "ContentIdeas", desc: "Unlimited ideas", gradient: "from-amber-500 to-yellow-400", color: "#f59e0b" },
{ name: "Trending Topics", icon: TrendingUp, page: "TrendingTopics", desc: "Discover trends", gradient: "from-green-500 to-emerald-400", color: "#22c55e" },
{ name: "Competitor Analyzer", icon: Users, page: "CompetitorAnalyzer", desc: "Analyze competitors", gradient: "from-sky-500 to-blue-400", color: "#0ea5e9" },
{ name: "Engagement Tips", icon: BarChart3, page: "EngagementTips", desc: "Boost engagement", gradient: "from-indigo-500 to-violet-400", color: "#6366f1" },
{ name: "Profile Analyzer", icon: User, page: "ProfileAnalyzer", desc: "Optimize profile", gradient: "from-rose-500 to-pink-400", color: "#f43f5e" },
{ name: "YouTube SEO", icon: BarChart3, page: "YouTubeSEO", desc: "YouTube optimization", gradient: "from-red-500 to-rose-400", color: "#ef4444" }];

const quickTools = tools.slice(0, 6);

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
};

export default function Dashboard() {
  const { subscription, loading, user } = useSubscription();
  const [usageLogs, setUsageLogs] = useState([]);

  useEffect(() => {
    if (user) {
      db.entities.UsageLog.filter({ user_email: user.email }, "-created_date", 10).
      then(setUsageLogs).catch(() => {});
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <TriangleLoader size={64} label="Loading your dashboard…" />
      </div>);

  }

  const plan = subscription ? PLAN_CONFIG[subscription.plan_name] : null;
  const daysLeft = subscription?.end_date ?
  Math.max(0, Math.ceil((new Date(subscription.end_date) - new Date()) / (1000 * 60 * 60 * 24))) :
  0;

  const daysProgress = plan && subscription?.start_date ?
  Math.min(100, Math.max(0, 100 - daysLeft / parseInt(subscription.plan_name.replace("days_", "")) * 100)) :
  0;

  return (
    <div className="space-y-7">

      {/* ── Hero Card ─────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="relative overflow-hidden p-6 lg:p-8 rounded-3xl opacity-65"
        style={{
          background: "linear-gradient(135deg, rgba(147,87,255,0.2) 0%, rgba(100,60,200,0.14) 50%, rgba(80,100,255,0.1) 100%)",
          border: "1px solid rgba(147,87,255,0.28)",
          boxShadow: "0 8px 48px rgba(147,87,255,0.15), inset 0 1px 0 rgba(255,255,255,0.07)"
        }}>
          {/* Orbs */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(263,85%,65%), transparent)" }} />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-15 blur-2xl pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(220,85%,65%), transparent)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(ellipse, hsl(300,85%,65%), transparent)" }} />

          {/* Floating decor — left: circle bobbing up & down */}
          <motion.div
            className="absolute left-6 bottom-10 w-12 h-12 rounded-full pointer-events-none hidden sm:block"
            animate={{ y: [0, -16, 0], opacity: [0.35, 0.7, 0.35] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              border: "2px solid rgba(147,87,255,0.55)",
              boxShadow: "0 0 22px rgba(147,87,255,0.3)",
              background: "radial-gradient(circle at 30% 30%, rgba(147,87,255,0.15), transparent)"
            }} />
          

          {/* Floating decor — right: triangle up + square down */}
          <motion.div
            className="absolute right-8 top-8 flex flex-col items-center gap-1.5 pointer-events-none hidden sm:flex"
            animate={{ y: [0, 12, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}>
            
            <div
              style={{
                width: 0, height: 0,
                borderLeft: "11px solid transparent",
                borderRight: "11px solid transparent",
                borderBottom: "18px solid rgba(250,180,80,0.7)",
                filter: "drop-shadow(0 0 8px rgba(250,180,80,0.4))"
              }} />
            
            <div
              className="w-6 h-6 rounded-[3px]"
              style={{
                background: "rgba(250,180,80,0.55)",
                boxShadow: "0 0 14px rgba(250,180,80,0.35)"
              }} />
            
          </motion.div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  animate={{ rotate: [0, 15, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                  
                  <Flame className="w-4.5 h-4.5 text-orange-400" />
                </motion.div>
                <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">SocialGlass AI</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-1">
                Hello, {user?.full_name?.split(" ")[0] || "Creator"} 👋
              </h1>
              <p className="text-muted-foreground text-sm">Ready to grow your social presence today?</p>

              {!subscription &&
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 flex items-center gap-2">
                
                  <Link to={createPageUrl("Pricing")}>
                    <motion.button
                    whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(147,87,255,0.5)" }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl gradient-primary text-white text-sm font-semibold">
                    
                      <Crown className="w-4 h-4" /> Get Premium
                    </motion.button>
                  </Link>
                </motion.div>
              }
            </div>

            {subscription &&
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0 glass-card rounded-2xl p-4 min-w-[160px]">
              
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <p className="text-sm font-bold text-yellow-400">{plan?.name} Plan</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Days left</span>
                    <span className="font-semibold text-foreground">{daysLeft}d</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${daysProgress}%` }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    className="h-full rounded-full gradient-primary" />
                  
                  </div>
                </div>
              </motion.div>
            }
          </div>
        </div>
      </motion.div>

      {/* ── Premium Showcase Video (admin-uploaded) ── */}
      <HeroVideoCard />

      {/* ── Quick Access ──────────────────────────── */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mb-4">
          
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Quick Access</h2>
          <Link to={createPageUrl("KeywordResearch")} className="text-xs text-primary hover:text-primary/80 flex items-center gap-0.5 transition-colors">
            All tools <ChevronRight className="w-3 h-3" />
          </Link>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          
          {quickTools.map((tool) =>
          <motion.div key={tool.page} variants={itemVariants}>
              <Link to={createPageUrl(tool.page)}>
                <motion.div
                whileHover={{ y: -3, boxShadow: `0 12px 30px ${tool.color}30` }}
                whileTap={{ scale: 0.96 }}
                className="glass-card p-3 flex flex-col items-center gap-2.5 text-center cursor-pointer transition-colors hover:border-white/15 rounded-[20px]">
                
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-lg`}
                style={{ boxShadow: `0 4px 16px ${tool.color}40` }}>
                    <tool.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground/80 leading-tight">{tool.name}</span>
                </motion.div>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── All Tools ─────────────────────────────── */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="flex items-center justify-between mb-4">
          
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">All AI Tools</h2>
          <span className="text-xs text-muted-foreground bg-white/6 border border-white/8 px-2.5 py-1 rounded-full">
            {tools.length} tools
          </span>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          
          {tools.map((tool) =>
          <motion.div key={tool.page} variants={itemVariants}>
              <Link to={createPageUrl(tool.page)}>
                <motion.div
                whileHover={{
                  y: -2,
                  borderColor: `${tool.color}50`,
                  boxShadow: `0 8px 28px ${tool.color}20`
                }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex items-center gap-3.5 p-4 rounded-2xl cursor-pointer transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)"
                }}>
                
                  <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center flex-shrink-0 shadow-md transition-transform duration-200 group-hover:scale-110`}
                  style={{ boxShadow: `0 4px 14px ${tool.color}35` }}>
                  
                    <tool.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{tool.name}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{tool.desc}</p>
                  </div>
                  <motion.div
                  animate={{ x: 0 }}
                  whileHover={{ x: 3 }}
                  className="flex-shrink-0">
                  
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                  </motion.div>
                </motion.div>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── No Subscription CTA ───────────────────── */}
      {!subscription &&
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}>
        
          <div className="relative overflow-hidden rounded-3xl p-6 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(147,87,255,0.14), rgba(80,100,255,0.08))",
          border: "1px solid rgba(147,87,255,0.22)"
        }}>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-24 blur-3xl opacity-30 pointer-events-none gradient-primary rounded-full" />
            <div className="relative">
              <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              
                <Crown className="w-10 h-10 mx-auto mb-3 text-yellow-400" />
              </motion.div>
              <h3 className="text-lg font-bold mb-1">Unlock All 13 AI Tools</h3>
              <p className="text-muted-foreground text-sm mb-5">Unlimited access starting from just ৳99</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to={createPageUrl("Pricing")}>
                  <motion.button
                  whileHover={{ scale: 1.04, boxShadow: "0 0 28px rgba(147,87,255,0.45)" }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-7 py-2.5 rounded-2xl gradient-primary text-white text-sm font-semibold">
                  
                    View Plans <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> Best value</span>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" /> Instant access</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      }

      {/* ── Recent Activity ───────────────────────── */}
      {usageLogs.length > 0 &&
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}>
        
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Recent Activity</h2>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden">
            {usageLogs.slice(0, 5).map((log, i) =>
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.42 + i * 0.05 }}
            className="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
            
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 glow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{log.tool_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{log.platform || "general"}</p>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground bg-white/5 border border-white/8 px-2 py-0.5 rounded-full">
                  {format(new Date(log.created_date), "MMM dd, HH:mm")}
                </span>
              </motion.div>
          )}
          </div>
        </motion.div>
      }
    </div>);

}