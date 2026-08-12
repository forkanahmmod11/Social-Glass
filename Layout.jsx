const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";

import ThemeToggle from "./components/shared/ThemeToggle";
import CountrySelector from "./components/shared/CountrySelector";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Search, Hash, FileText, MessageSquare, Users,
  TrendingUp, Sparkles, Zap, Lightbulb, BarChart3, User, Bookmark,
  CreditCard, LogOut, Menu, X, ChevronDown, Shield, ScrollText, Crown, Bell
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [{ name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" }]
  },
  {
    label: "SEO Tools",
    items: [
      { name: "Keyword Research", icon: Search, page: "KeywordResearch" },
      { name: "Hashtag Generator", icon: Hash, page: "HashtagGenerator" },
      { name: "Post Analyzer", icon: FileText, page: "PostAnalyzer" },
      { name: "YouTube SEO", icon: BarChart3, page: "YouTubeSEO" },
    ]
  },
  {
    label: "Content",
    items: [
      { name: "Long Script", icon: ScrollText, page: "LongScriptGenerator" },
      { name: "Caption Generator", icon: MessageSquare, page: "CaptionGenerator" },
      { name: "Content Generator", icon: Sparkles, page: "ContentGenerator" },
      { name: "Hook Generator", icon: Zap, page: "HookGenerator" },
      { name: "Content Ideas", icon: Lightbulb, page: "ContentIdeas" },
    ]
  },
  {
    label: "Analytics",
    items: [
      { name: "Competitor Analyzer", icon: Users, page: "CompetitorAnalyzer" },
      { name: "Trending Topics", icon: TrendingUp, page: "TrendingTopics" },
      { name: "Engagement Tips", icon: BarChart3, page: "EngagementTips" },
      { name: "Profile Analyzer", icon: User, page: "ProfileAnalyzer" },
    ]
  },
  {
    label: "Account",
    items: [
      { name: "Collections", icon: Bookmark, page: "SavedProjects" },
      { name: "Pricing", icon: CreditCard, page: "Pricing" },
    ]
  }
];

const bottomNavItems = [
  { name: "Home", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Search", icon: Search, page: "KeywordResearch" },
  { name: "Create", icon: Sparkles, page: "ContentGenerator" },
  { name: "Saved", icon: Bookmark, page: "SavedProjects" },
  { name: "Plans", icon: Crown, page: "Pricing" },
];

function DesktopSidebar({ currentPageName, user }) {
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const isAdmin = (u) => u?.role === "admin" || u?.email === "ahmedforkan26@gmail.com";

  return (
    <aside className="hidden lg:flex flex-col w-60 h-screen flex-shrink-0 sidebar-premium">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
        <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center glow-sm">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69abd3fcfda2538030176069/dbefaff5a_file_00000000f33c71faa47adf1e3b1680f8.png"
              alt="SocialGlass"
              className="w-6 h-6 object-contain"
            />
          </div>
          <span className="text-base font-bold gradient-text tracking-tight">SocialGlass</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-3">
            <button
              onClick={() => setCollapsedGroups(prev => ({ ...prev, [group.label]: !prev[group.label] }))}
              className="w-full flex items-center justify-between px-2 py-1 text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest mb-0.5"
            >
              {group.label}
              <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", collapsedGroups[group.label] && "-rotate-90")} />
            </button>
            <AnimatePresence initial={false}>
              {!collapsedGroups[group.label] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-0.5 overflow-hidden"
                >
                  {group.items.map((item) => {
                    const isActive = currentPageName === item.page;
                    return (
                      <Link
                        key={item.page}
                        to={createPageUrl(item.page)}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150",
                          isActive
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        )}
                      >
                        <item.icon className={cn("w-3.5 h-3.5 flex-shrink-0", isActive && "text-primary")} />
                        <span>{item.name}</span>
                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {isAdmin(user) && (
          <div>
            <div className="px-2 py-1 text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest mb-0.5">Admin</div>
            <Link
              to={createPageUrl("AdminPanel")}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150",
                currentPageName === "AdminPanel"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <Shield className="w-3.5 h-3.5 text-orange-400" />
              Admin Panel
            </Link>
          </div>
        )}
      </nav>

      {/* User */}
      {user && (
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors group">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">
                {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{user.full_name || "User"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/10"
              onClick={() => db.auth.logout()}
            >
              <LogOut className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

function MobileDrawer({ open, onClose, currentPageName, user }) {
  const isAdmin = (u) => u?.role === "admin" || u?.email === "ahmedforkan26@gmail.com";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.22 }}
            className="fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col sidebar-premium lg:hidden"
          >
            <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border">
              <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2" onClick={onClose}>
                <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69abd3fcfda2538030176069/dbefaff5a_file_00000000f33c71faa47adf1e3b1680f8.png" className="w-5 h-5 object-contain" />
                </div>
                <span className="text-sm font-bold gradient-text">SocialGlass</span>
              </Link>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/8 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
              {navGroups.flatMap(g => g.items).map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
              {isAdmin(user) && (
                <Link to={createPageUrl("AdminPanel")} onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
                  <Shield className="w-4 h-4 text-orange-400" />Admin Panel
                </Link>
              )}
            </nav>

            {user && (
              <div className="p-3 border-t border-sidebar-border">
                <div className="flex items-center gap-3 p-2">
                  <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{user.full_name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <button onClick={() => db.auth.logout()} className="p-1.5 rounded-lg hover:bg-white/8 transition-colors">
                    <LogOut className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MobileBottomNav({ currentPageName }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bottom-nav-glass">
      <div className="flex items-center justify-around px-1 py-2">
        {bottomNavItems.map((item) => {
          const isActive = currentPageName === item.page;
          const isCenter = item.name === "Create";
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1 min-w-[52px]"
            >
              {isCenter ? (
                <div className="relative flex flex-col items-center">
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-bg"
                      className="absolute inset-0 rounded-2xl gradient-primary"
                      style={{ inset: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 35, mass: 0.6 }}
                    />
                  )}
                  <div className="relative w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center -mt-4 shadow-lg glow-sm z-10">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              ) : (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-bg"
                      className="absolute inset-0 rounded-2xl"
                      style={{ background: "rgba(147,87,255,0.15)" }}
                      transition={{ type: "spring", stiffness: 500, damping: 35, mass: 0.6 }}
                    />
                  )}
                  <motion.div
                    animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -1 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="relative z-10"
                  >
                    <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  </motion.div>
                  <motion.span
                    animate={{ opacity: isActive ? 1 : 0.6 }}
                    transition={{ duration: 0.2 }}
                    className={cn("text-[10px] font-medium relative z-10", isActive ? "text-primary" : "text-muted-foreground")}
                  >
                    {item.name}
                  </motion.span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function Layout({ children, currentPageName }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    db.auth.me().then(setUser).catch(() => {});
  }, []);

  if (currentPageName === "Pricing" || currentPageName === "PaymentSubmit") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DesktopSidebar currentPageName={currentPageName} user={user} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} currentPageName={currentPageName} user={user} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-border flex-shrink-0"
          style={{ background: "rgba(14,16,28,0.8)", backdropFilter: "blur(20px)" }}>
          <button className="lg:hidden p-2 rounded-xl hover:bg-white/8 transition-colors" onClick={() => setDrawerOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <CountrySelector />
            <ThemeToggle />
            <button className="relative p-2 rounded-xl hover:bg-white/8 transition-colors">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
            {!user && (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
                <button onClick={() => db.auth.redirectToLogin(window.location.href)}
                  className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-xl hover:bg-white/5 transition-all">
                  Log in
                </button>
                <button onClick={() => db.auth.redirectToLogin(window.location.href)}
                  className="px-4 py-1.5 text-sm font-semibold text-white rounded-xl gradient-primary glow-sm transition-all">
                  Get Started
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="p-4 lg:p-6 max-w-7xl mx-auto w-full pb-28 lg:pb-8"
          >
            {children}
          </motion.div>
        </main>
      </div>

      <MobileBottomNav currentPageName={currentPageName} />
    </div>
  );
}