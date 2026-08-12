const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import { PLAN_CONFIG } from "@/components/shared/PlanConfig";
import { useCurrency } from "@/context/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Crown, Zap, Gift, Globe, Star, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/shared/ThemeToggle";
import AdModal from "@/components/shared/AdModal";
import CountrySelector from "@/components/shared/CountrySelector";
import { unlockGlobalTrial, isGlobalTrialUnlocked } from "@/components/shared/ToolGate";

const PAYMENT_METHOD_LABELS = {
  bkash: "bKash", nagad: "Nagad", rocket: "Rocket", upay: "Upay",
  upi: "UPI", razorpay: "Razorpay", paytm: "Paytm",
  easypaisa: "Easypaisa", jazzcash: "JazzCash", stripe: "Stripe", paypal: "PayPal",
};

const PLAN_ICONS = ["⚡", "🔥", "💎", "🚀", "👑"];
const POPULAR_KEY = "days_30";
const BEST_VALUE_KEY = "days_365";

const planKeys = Object.keys(PLAN_CONFIG);

export default function Pricing() {
  const [showAdModal, setShowAdModal] = useState(false);
  const [trialAlreadyUsed] = useState(() => isGlobalTrialUnlocked());
  const { countryData, formatPrice, detecting } = useCurrency();

  const paymentMethods = countryData.payment_methods || ["bkash", "nagad", "rocket", "upay"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69abd3fcfda2538030176069/dbefaff5a_file_00000000f33c71faa47adf1e3b1680f8.png" alt="SocialGlass" className="w-7 h-7 object-contain" />
            </div>
            <span className="text-xl font-bold gradient-text">SocialGlass</span>
          </Link>
          <div className="flex items-center gap-2">
            <CountrySelector />
            <ThemeToggle />
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-5">
            <Zap className="w-4 h-4" /> Choose Your Plan
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold mb-5 leading-tight">
            Power Up Your<br />
            <span className="gradient-text">Social Media</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            All features unlocked in every plan. Pick the duration that fits you.
          </p>
          {detecting && (
            <p className="text-sm text-muted-foreground mt-3 flex items-center justify-center gap-1">
              <Globe className="w-3.5 h-3.5 animate-pulse" /> Detecting your location...
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            Prices in <strong className="text-foreground">{countryData.currency}</strong> · {countryData.country}
          </p>
        </motion.div>

        {/* Trust Badges */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap justify-center gap-4 mb-12">
          {[
            { icon: Shield, text: "Secure Payment" },
            { icon: Star, text: "All Tools Included" },
            { icon: Sparkles, text: "AI-Powered" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-full px-4 py-2">
              <Icon className="w-4 h-4 text-primary" /> {text}
            </div>
          ))}
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-14">
          {planKeys.map((key, i) => {
            const plan = PLAN_CONFIG[key];
            const isPopular = key === POPULAR_KEY;
            const isBestValue = key === BEST_VALUE_KEY;
            const isHighlighted = isPopular || isBestValue;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={isHighlighted ? "lg:-translate-y-2" : ""}
              >
                <div className={`relative flex flex-col h-full rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1
                  ${isHighlighted
                    ? "border-primary shadow-xl shadow-primary/20 bg-card"
                    : "border-border bg-card hover:border-primary/40"
                  }`}>
                  {/* Top badge */}
                  {isPopular && (
                    <div className="absolute top-0 inset-x-0 text-center py-1.5 gradient-primary text-primary-foreground text-xs font-bold tracking-wide">
                      🔥 MOST POPULAR
                    </div>
                  )}
                  {isBestValue && (
                    <div className="absolute top-0 inset-x-0 text-center py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-xs font-bold tracking-wide">
                      👑 BEST VALUE
                    </div>
                  )}

                  <div className={`p-6 flex-1 flex flex-col ${isHighlighted ? "pt-10" : ""}`}>
                    {/* Icon + Name */}
                    <div className="text-3xl mb-3">{PLAN_ICONS[i]}</div>
                    <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mb-5">Full access · {plan.period}</p>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-extrabold">{formatPrice(plan.price)}</span>
                      </div>
                      {countryData.currency !== "BDT" && (
                        <p className="text-xs text-muted-foreground mt-1">≈ ৳{plan.price} BDT</p>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5 flex-1 mb-6">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm">
                          <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-primary" />
                          </div>
                          <span className="text-muted-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      className={`w-full rounded-xl font-semibold ${isHighlighted
                        ? "gradient-primary text-primary-foreground shadow-lg"
                        : "border border-border bg-background hover:bg-accent"
                      }`}
                      variant={isHighlighted ? "default" : "outline"}
                      onClick={async () => {
                        const auth = await db.auth.isAuthenticated();
                        if (!auth) {
                          db.auth.redirectToLogin(window.location.href);
                        } else {
                          window.location.href = createPageUrl("PaymentSubmit") + `?plan=${key}`;
                        }
                      }}
                    >
                      Get Started →
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Payment Methods */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="rounded-3xl border border-border bg-card p-8 text-center max-w-2xl mx-auto mb-10">
            <h3 className="font-bold text-lg mb-1">Payment Methods in {countryData.country}</h3>
            <p className="text-sm text-muted-foreground mb-4">Choose your preferred payment option</p>
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {paymentMethods.map(m => (
                <Badge key={m} variant="secondary" className="text-sm px-4 py-1.5 rounded-full">{PAYMENT_METHOD_LABELS[m] || m}</Badge>
              ))}
            </div>
            {(paymentMethods.includes("bkash") || paymentMethods.includes("nagad") || paymentMethods.includes("rocket")) && (
              <div className="bg-muted rounded-2xl px-5 py-3 text-sm">
                Send payment to: <span className="font-bold text-foreground">01968434302</span>
              </div>
            )}
            {(paymentMethods.includes("stripe") || paymentMethods.includes("paypal")) && (
              <p className="text-sm text-muted-foreground">Secure online payment via Stripe or PayPal</p>
            )}
          </div>
        </motion.div>

        {/* Free Trial Banner */}
        {!trialAlreadyUsed && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 via-primary to-violet-600 p-8 text-center text-primary-foreground max-w-2xl mx-auto shadow-2xl">
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
              <Gift className="w-10 h-10 mx-auto mb-3" />
              <h3 className="font-bold text-xl mb-1">Try Before You Buy</h3>
              <p className="text-primary-foreground/80 text-sm mb-5">
                Watch <strong>3 short ads</strong> once → Get <strong>5 free searches</strong> across all tools
              </p>
              <Button
                className="bg-white text-primary hover:bg-white/90 font-bold gap-2 shadow-lg px-8"
                onClick={() => setShowAdModal(true)}
              >
                🎬 Watch Ads & Get Free Trial
              </Button>
            </div>
          </motion.div>
        )}

        <AdModal
          open={showAdModal}
          onComplete={() => { unlockGlobalTrial(); setShowAdModal(false); }}
        />
      </div>
    </div>
  );
}