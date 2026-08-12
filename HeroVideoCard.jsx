const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { Film, Sparkles } from "lucide-react";

export default function HeroVideoCard() {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.entities.HeroVideo.filter({ is_active: true }, "-updated_date", 1)
      .then((rows) => { if (rows[0]) setVideo(rows[0]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AnimatePresence>
      {video && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: "linear-gradient(135deg, rgba(147,87,255,0.16) 0%, rgba(80,100,255,0.08) 100%)",
            border: "1px solid rgba(147,87,255,0.28)",
            boxShadow: "0 10px 50px rgba(147,87,255,0.18), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Ambient glow orb */}
          <div
            className="absolute -top-10 right-10 w-40 h-40 rounded-full pointer-events-none blur-3xl opacity-30"
            style={{ background: "radial-gradient(circle, hsl(263,85%,65%), transparent)" }}
          />
          <motion.div
            className="absolute -bottom-12 left-8 w-48 h-48 rounded-full pointer-events-none blur-3xl opacity-20"
            animate={{ opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: "radial-gradient(circle, hsl(300,85%,65%), transparent)" }}
          />

          <div className="relative z-10 p-5 lg:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <motion.div
                  animate={{ rotate: [0, 12, -8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center glow-sm"
                >
                  <Film className="w-4 h-4 text-white" />
                </motion.div>
                <div>
                  <p className="text-sm font-bold">{video.title || "Featured Showcase"}</p>
                  <p className="text-[11px] text-muted-foreground">Premium animation</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
                <Sparkles className="w-3 h-3" /> Premium
              </span>
            </div>

            {/* Video */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(147,87,255,0.22)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}
            >
              <video
                src={video.video_url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto object-cover block"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}