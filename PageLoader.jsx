import React from "react";
import { motion } from "framer-motion";
import TriangleLoader from "@/components/shared/TriangleLoader";

export default function PageLoader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50 overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[20%] left-[20%] w-96 h-96 rounded-full bg-primary/6 blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[20%] right-[20%] w-80 h-80 rounded-full bg-purple-500/5 blur-[80px] pointer-events-none animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(258,90%,60%,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(258,90%,60%,0.025)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-6 relative z-10"
      >
        {/* Logo with glow ring */}
        <div className="relative">
          {/* Outer glow ring */}
          <motion.div
            className="absolute inset-[-8px] rounded-[22px] gradient-primary opacity-20 blur-[8px]"
            animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.06, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Inner ring */}
          <motion.div
            className="absolute inset-[-3px] rounded-[19px] border-2 border-primary/30"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center relative z-10"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69abd3fcfda2538030176069/dbefaff5a_file_00000000f33c71faa47adf1e3b1680f8.png"
              alt="SocialGlass"
              className="w-12 h-12 object-contain"
            />
          </motion.div>
        </div>

        {/* Brand */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-2xl font-bold font-display gradient-text block tracking-tight">SocialGlass</span>
          <span className="text-xs text-muted-foreground mt-1 block">AI Social Media Suite</span>
        </motion.div>

        {/* Three-dot triangle circulation */}
        <TriangleLoader size={60} label="Loading…" />
      </motion.div>
    </div>
  );
}