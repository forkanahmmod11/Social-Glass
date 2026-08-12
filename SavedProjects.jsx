const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import { useSubscription } from "@/components/shared/useSubscription";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Bookmark, Trash2, Search, Download, Copy,
  ChevronDown, ChevronUp, Hash, Lightbulb, Zap,
  FileText, BarChart3, Sparkles, MessageSquare, Star
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const TYPE_CONFIG = {
  keywords: { label: "Keywords", icon: Search, color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  hashtags: { label: "Hashtags", icon: Hash, color: "bg-green-500/10 text-green-600 border-green-200" },
  captions: { label: "Captions", icon: MessageSquare, color: "bg-purple-500/10 text-purple-600 border-purple-200" },
  content_ideas: { label: "Content Ideas", icon: Lightbulb, color: "bg-orange-500/10 text-orange-600 border-orange-200" },
  hooks: { label: "Hooks", icon: Zap, color: "bg-red-500/10 text-red-600 border-red-200" },
  analysis: { label: "Analysis", icon: BarChart3, color: "bg-yellow-500/10 text-yellow-600 border-yellow-200" },
};

function renderContent(type, rawContent) {
  let data;
  try { data = JSON.parse(rawContent || "{}"); } catch { return <p className="text-sm text-muted-foreground">{rawContent}</p>; }

  if (type === "keywords" && Array.isArray(data)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {data.slice(0, 20).map((kw, i) => (
          <Badge key={i} variant="secondary" className="text-xs">{typeof kw === "string" ? kw : kw.keyword || kw.term || JSON.stringify(kw)}</Badge>
        ))}
      </div>
    );
  }
  if (type === "hashtags" && Array.isArray(data)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {data.slice(0, 20).map((tag, i) => (
          <Badge key={i} className="text-xs bg-green-500/10 text-green-700 border-green-200">{String(tag).startsWith("#") ? tag : `#${tag}`}</Badge>
        ))}
      </div>
    );
  }
  if ((type === "hooks" || type === "content_ideas") && Array.isArray(data)) {
    return (
      <ul className="space-y-1.5">
        {data.slice(0, 5).map((item, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <span className="text-primary font-bold flex-shrink-0">{i + 1}.</span>
            <span className="text-foreground/80">{typeof item === "string" ? item : item.hook || item.idea || item.title || JSON.stringify(item)}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (type === "captions" && typeof data === "string") {
    return <p className="text-sm text-foreground/80 leading-relaxed line-clamp-4">{data}</p>;
  }
  if (typeof data === "object") {
    const entries = Object.entries(data).slice(0, 4);
    return (
      <div className="space-y-1.5">
        {entries.map(([k, v]) => (
          <div key={k} className="flex gap-2 text-sm">
            <span className="font-medium text-muted-foreground capitalize min-w-20">{k.replace(/_/g, " ")}:</span>
            <span className="text-foreground/80 line-clamp-2">{typeof v === "string" ? v : Array.isArray(v) ? v.join(", ") : JSON.stringify(v)}</span>
          </div>
        ))}
      </div>
    );
  }
  return <p className="text-sm text-muted-foreground">{String(data)}</p>;
}

export default function SavedProjects() {
  const { user } = useSubscription();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (user) loadProjects();
  }, [user]);

  const loadProjects = async () => {
    const data = await db.entities.SavedProject.filter(
      { user_email: user.email }, "-created_date", 100
    );
    setProjects(data);
    setLoading(false);
  };

  const deleteProject = async (id) => {
    await db.entities.SavedProject.delete(id);
    setProjects(projects.filter(p => p.id !== id));
    toast.success("Removed from collections");
  };

  const copyProject = (project) => {
    const text = project.content || "";
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const exportProject = (project) => {
    const blob = new Blob([project.content || ""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || p.type === typeFilter;
    return matchSearch && matchType;
  });

  const countByType = (type) => projects.filter(p => p.type === type).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star className="w-6 h-6 text-primary" /> Collections
          </h1>
          <p className="text-muted-foreground mt-1">
            {projects.length} saved item{projects.length !== 1 ? "s" : ""} across all tools
          </p>
        </div>
      </div>

      {/* Type filter tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={typeFilter === "all" ? "default" : "outline"}
          onClick={() => setTypeFilter("all")}
          className={typeFilter === "all" ? "gradient-primary text-primary-foreground" : ""}
        >
          All ({projects.length})
        </Button>
        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
          const count = countByType(key);
          if (count === 0) return null;
          return (
            <Button
              key={key}
              size="sm"
              variant={typeFilter === key ? "default" : "outline"}
              onClick={() => setTypeFilter(key)}
              className={typeFilter === key ? "gradient-primary text-primary-foreground" : ""}
            >
              <cfg.icon className="w-3.5 h-3.5 mr-1" />
              {cfg.label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your collections..."
          className="pl-9"
        />
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No saved items yet</h3>
          <p className="text-muted-foreground text-sm">
            Click the bookmark icon on any generated result to save it here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((project) => {
              const cfg = TYPE_CONFIG[project.type] || TYPE_CONFIG.analysis;
              const Icon = cfg.icon;
              const isExpanded = expanded[project.id];
              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                >
                  <Card className="glass-card h-full flex flex-col">
                    <CardContent className="p-4 flex flex-col gap-3 h-full">
                      {/* Card header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm leading-tight truncate">{project.title}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge className={`text-xs px-1.5 py-0 border ${cfg.color}`}>{cfg.label}</Badge>
                              {project.platform && project.platform !== "all" && (
                                <span className="text-xs text-muted-foreground capitalize">{project.platform}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {format(new Date(project.created_date), "MMM d")}
                        </span>
                      </div>

                      {/* Content preview */}
                      <div className={`flex-1 overflow-hidden ${!isExpanded ? "max-h-24" : ""}`}>
                        {renderContent(project.type, project.content)}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 px-2 text-muted-foreground"
                          onClick={() => setExpanded(prev => ({ ...prev, [project.id]: !prev[project.id] }))}
                        >
                          {isExpanded ? <><ChevronUp className="w-3.5 h-3.5 mr-1" /> Less</> : <><ChevronDown className="w-3.5 h-3.5 mr-1" /> More</>}
                        </Button>
                        <div className="flex items-center gap-0.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyProject(project)}>
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => exportProject(project)}>
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteProject(project.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}