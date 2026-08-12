import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Gift, Lock, Sparkles, Zap, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canAccessTool } from "./PlanConfig";
import AdModal from "./AdModal";
import { motion, AnimatePresence } from "framer-motion";

const GLOBAL_UNLOCKED_KEY = "sg_global_trial_unlocked";
const GLOBAL_USAGE_KEY = "sg_global_trial_used";
const FREE_TRIAL_LIMIT = 5;

export function isGlobalTrialUnlocked() {
  return localStorage.getItem(GLOBAL_UNLOCKED_KEY) === "true";
}

export function unlockGlobalTrial() {
  if (localStorage.getItem(GLOBAL_UNLOCKED_KEY) === "true") return;
  localStorage.setItem(GLOBAL_UNLOCKED_KEY, "true");
  localStorage.setItem(GLOBAL_USAGE_KEY, "0");
}

export function getGlobalTrialUsed() {
  return parseInt(localStorage.getItem(GLOBAL_USAGE_KEY) || "0", 10);
}

export function incrementTrialUsage() {
  const used = getGlobalTrialUsed();
  localStorage.setItem(GLOBAL_USAGE_KEY, String(used + 1));
  window.dispatchEvent(new Event("storage"));
}

export function getGlobalTrialRemaining() {
  return Math.max(0, FREE_TRIAL_LIMIT - getGlobalTrialUsed());
}

export function incrementTrialUsageForTool() { incrementTrialUsage(); }
export function getTrialUsageForTool() { return getGlobalTrialUsed(); }
export function isTrialUnlockedForTool() { return isGlobalTrialUnlocked(); }
export function unlockTrialForTool() { unlockGlobalTrial(); }
export function resetTrialForTool() {}
export function isTrialUnlocked() { return isGlobalTrialUnlocked(); }
export function unlockTrial() { unlockGlobalTrial(); }

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary"
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-muted-foreground"
      >
        Loading tool...
      </motion.p>
    </div>
  );
}

function TrialBanner({ trialRemaining }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 relative overflow-hidden rounded-2xl p-4"
      style={{
        background: "linear-gradient(135deg, rgba(147,87,255,0.15), rgba(80,100,255,0.1))",
        border: "1px solid rgba(147,87,255,0.3)"
      }}
    >
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl"
        style={{ background: "radial-gradient(circle, hsl(263,85%,65%), transparent)" }} />
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 glow-sm">
            <Gift className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              Free Trial Active — <span className="text-primary">{trialRemaining} search{trialRemaining !== 1 ? "es" : ""} left</span>
            </p>
            <p className="text-xs text-muted-foreground">Upgrade for unlimited access</p>
          </div>
        </div>
        <Link to={createPageUrl("Pricing")}>
          <Button size="sm" className="gradient-primary text-white text-xs h-8 px-4 glow-sm flex-shrink-0">
            Upgrade <Crown className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
      {/* Progress dots */}
      <div className="flex gap-1.5 mt-3">
        {Array.from({ length: FREE_TRIAL_LIMIT }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{
              background: i < (FREE_TRIAL_LIMIT - trialRemaining)
                ? "rgba(147,87,255,0.3)"
                : "linear-gradient(90deg, hsl(263,85%,65%), hsl(300,85%,65%))"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function TrialExhaustedGate() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center min-h-[400px] p-4"
    >
      <div className="text-center max-w-sm mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-3xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6"
        >
          <Lock className="w-9 h-9 text-destructive" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="text-2xl font-bold mb-2">Free Trial Ended</h2>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            You've used all <strong className="text-foreground">5 free searches</strong>. Get a plan to continue using AI tools without limits.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Link to={createPageUrl("Pricing")}>
            <Button className="gradient-primary text-white gap-2 px-8 py-5 text-sm font-semibold glow-sm w-full">
              <Crown className="w-4 h-4" /> View Plans
            </Button>
          </Link>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" /> Starting ৳99</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" /> Instant Access</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function UnlockGate({ onWatchAds }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center min-h-[420px] p-4"
    >
      <div className="text-center max-w-sm mx-auto w-full">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 180 }}
          className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center mx-auto mb-6 glow-primary relative"
        >
          <Sparkles className="w-11 h-11 text-white" />
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-3xl gradient-primary opacity-40"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <h2 className="text-2xl font-bold mb-2">Unlock Free Trial</h2>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            Watch <strong className="text-foreground">3 short ads</strong> once to get{" "}
            <strong className="text-primary">5 free searches</strong> across all tools.
          </p>
        </motion.div>

        {/* Feature list */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="glass-card rounded-2xl p-4 mb-6 text-left space-y-2.5"
        >
          {[
            { icon: "🔍", text: "Keyword Research" },
            { icon: "🏷️", text: "Hashtag Generator" },
            { icon: "✍️", text: "Caption Generator" },
            { icon: "⚡", text: "Hook Generator" },
            { icon: "💡", text: "Content Ideas" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm">
              <span>{item.icon}</span>
              <span className="text-foreground/80">{item.text}</span>
              <span className="ml-auto text-xs text-primary font-medium">Free</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="space-y-3"
        >
          <Button
            className="gradient-primary text-white gap-2 px-6 py-5 text-sm font-semibold glow-sm w-full"
            onClick={onWatchAds}
          >
            🎬 Watch 3 Ads & Get Free Trial
          </Button>
          <Link to={createPageUrl("Pricing")}>
            <Button variant="outline" className="gap-2 px-6 w-full border-primary/20 hover:border-primary/40 hover:bg-primary/5">
              <Crown className="w-4 h-4 text-primary" /> Get Premium Instead
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function ToolGate({ subscription, loading, toolName, children }) {
  const [showAdModal, setShowAdModal] = useState(false);
  const [trialUnlocked, setTrialUnlocked] = useState(() => isGlobalTrialUnlocked());
  const [trialRemaining, setTrialRemaining] = useState(() => getGlobalTrialRemaining());

  useEffect(() => {
    const sync = () => {
      setTrialUnlocked(isGlobalTrialUnlocked());
      setTrialRemaining(getGlobalTrialRemaining());
    };
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  if (loading) return <LoadingState />;

  const hasPaidAccess = subscription && canAccessTool(subscription.plan_name, toolName);
  if (hasPaidAccess) return children;

  if (trialUnlocked && trialRemaining > 0) {
    return (
      <div>
        <TrialBanner trialRemaining={trialRemaining} />
        {children}
      </div>
    );
  }

  if (trialUnlocked && trialRemaining === 0) {
    return <TrialExhaustedGate />;
  }

  return (
    <>
      <AdModal
        open={showAdModal}
        onComplete={() => {
          unlockGlobalTrial();
          setTrialUnlocked(true);
          setTrialRemaining(FREE_TRIAL_LIMIT);
          setShowAdModal(false);
        }}
      />
      <UnlockGate onWatchAds={() => setShowAdModal(true)} />
    </>
  );
}