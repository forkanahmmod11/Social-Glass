const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle, Loader2 } from "lucide-react";

const DEFAULT_ADS = [
  { title: "Boost Your Social Media Growth", description: "Discover powerful AI tools to grow your audience faster.", bg: "from-purple-600 to-pink-500", emoji: "🚀", link_url: null, image_url: null },
  { title: "Content That Goes Viral", description: "Generate captions, hashtags and hooks with one click.", bg: "from-blue-500 to-cyan-400", emoji: "✨", link_url: null, image_url: null },
  { title: "SocialGlass Pro — Unlock All Tools", description: "Upgrade to a paid plan for unlimited access to all AI features.", bg: "from-green-500 to-emerald-400", emoji: "🎯", link_url: null, image_url: null }
];

const BG_GRADIENTS = ["from-purple-600 to-pink-500", "from-blue-500 to-cyan-400", "from-green-500 to-emerald-400"];

export default function AdModal({ open, onComplete }) {
  const [adIndex, setAdIndex] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [watched, setWatched] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [ads, setAds] = useState(DEFAULT_ADS);

  useEffect(() => {
    db.entities.AdConfig.filter({ is_active: true }, "slot", 3)
      .then(configs => {
        if (configs.length > 0) {
          const merged = DEFAULT_ADS.map((def, i) => {
            const cfg = configs.find(c => c.slot === i + 1);
            return cfg ? { ...def, ...cfg, bg: BG_GRADIENTS[i] } : def;
          });
          setAds(merged);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    setAdIndex(0);
    setWatched(0);
    setCountdown(5);
    setCanSkip(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setCountdown(5);
    setCanSkip(false);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [adIndex, open]);

  const handleNext = () => {
    const newWatched = watched + 1;
    setWatched(newWatched);
    if (newWatched >= 3) {
      onComplete();
    } else {
      setAdIndex(prev => prev + 1);
    }
  };

  const ad = ads[adIndex];

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden" hideClose>
        {/* Ad Display */}
        {ad.image_url ? (
          <a
            href={ad.link_url || "#"}
            target={ad.link_url ? "_blank" : "_self"}
            rel="noopener noreferrer"
            className="block cursor-pointer"
            onClick={e => !ad.link_url && e.preventDefault()}
          >
            <img src={ad.image_url} alt={ad.title} className="w-full object-cover max-h-64" />
          </a>
        ) : (
          <div className={`bg-gradient-to-br ${ad.bg} p-10 text-white text-center space-y-3`}>
            <div className="text-6xl">{ad.emoji}</div>
            <h3 className="text-2xl font-bold">{ad.title}</h3>
            <p className="text-white/80 text-sm">{ad.description}</p>
          </div>
        )}

        {/* Progress */}
        <div className="p-5 space-y-4">
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all ${
                  i < watched ? "bg-primary" : i === adIndex ? "bg-primary/50" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Ad {Math.min(watched + 1, 3)} of 3 — Watch to unlock your free trial
          </p>
          <Button
            className="w-full gradient-primary text-primary-foreground gap-2"
            disabled={!canSkip}
            onClick={handleNext}
          >
            {canSkip ? (
              watched >= 2 ? (
                <><CheckCircle className="w-4 h-4" /> Claim Free Trial</>
              ) : (
                <><Play className="w-4 h-4" /> Next Ad ({watched + 1}/3)</>
              )
            ) : (
              <><Loader2 className="w-4 h-4 animate-spin" /> Wait {countdown}s...</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}