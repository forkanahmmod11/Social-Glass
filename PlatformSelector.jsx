import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const platforms = [
  { id: "youtube", label: "YouTube" },
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
];

export default function PlatformSelector({ selected, onChange, className }) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {platforms.map((p) => (
        <motion.button
          key={p.id}
          onClick={() => onChange(p.id)}
          whileTap={{ scale: 0.96 }}
          className="relative px-4 py-2.5 rounded-2xl text-sm font-semibold overflow-hidden"
          style={{ background: selected === p.id ? "transparent" : "rgba(255,255,255,0.05)" }}
        >
          {selected === p.id && (
            <motion.div
              layoutId="platform-pill"
              className="absolute inset-0 rounded-2xl gradient-primary"
              transition={{ type: "spring", stiffness: 500, damping: 35, mass: 0.6 }}
            />
          )}
          <motion.span
            animate={{
              color: selected === p.id ? "#ffffff" : "hsl(220 12% 55%)",
              scale: selected === p.id ? 1.04 : 1,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="relative z-10 block"
          >
            {p.label}
          </motion.span>
        </motion.button>
      ))}
    </div>
  );
}