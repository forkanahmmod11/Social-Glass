import React from "react";
import { motion } from "framer-motion";

export default function TriangleLoader({ size = 64, label }) {
  // Equilateral triangle vertices within a 100x100 viewBox
  const cx = 50;
  const r = size / 2;
  const pts = [
    { x: cx, y: cx - r * 0.62 }, // top
    { x: cx - r * 0.55, y: cx + r * 0.36 }, // bottom-left
    { x: cx + r * 0.55, y: cx + r * 0.36 }, // bottom-right
  ];
  const dotR = Math.max(3, size * 0.075);

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ width: size, height: size, position: "relative" }}
      >
        {/* Slow rotating frame for premium feel */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          style={{ position: "absolute", inset: 0 }}
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            style={{ overflow: "visible" }}
          >
            {/* Triangle outline drawing effect */}
            <motion.polygon
              points={`${pts[0].x},${pts[0].y} ${pts[1].x},${pts[1].y} ${pts[2].x},${pts[2].y}`}
              fill="none"
              stroke="url(#tg-grad)"
              strokeWidth={2.4}
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0.35 }}
              animate={{ pathLength: [0, 1, 1, 0], opacity: [0.2, 0.55, 0.55, 0.2] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="tg-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(263,85%,65%)" />
                <stop offset="100%" stopColor="hsl(300,85%,65%)" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Static dots layer — circulating light */}
        {pts.map((p, i) => (
          <motion.span
            key={i}
            style={{
              position: "absolute",
              left: `calc(${p.x}% - ${dotR}px)`,
              top: `calc(${p.y}% - ${dotR}px)`,
              width: dotR * 2,
              height: dotR * 2,
              borderRadius: "9999px",
              background: "linear-gradient(135deg, hsl(263,85%,72%), hsl(300,85%,72%))",
            }}
            animate={{
              scale: [1, 1.7, 1],
              opacity: [0.35, 1, 0.35],
              boxShadow: [
                "0 0 0 rgba(147,87,255,0)",
                "0 0 14px rgba(147,87,255,0.7), 0 0 28px rgba(147,87,255,0.35)",
                "0 0 0 rgba(147,87,255,0)",
              ],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.6,
            }}
          />
        ))}
      </motion.div>

      {label && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-xs font-medium text-muted-foreground tracking-wide"
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}