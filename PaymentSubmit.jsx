const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import { PLAN_CONFIG } from "@/components/shared/PlanConfig";
import { useCurrency } from "@/context/CurrencyContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Loader2, Globe, Copy, Phone, ExternalLink, AlertCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";
import ThemeToggle from "@/components/shared/ThemeToggle";
import CountrySelector from "@/components/shared/CountrySelector";
import { motion, AnimatePresence } from "framer-motion";

// ─── Payment method configurations ───────────────────────────────────────────
const BD_METHODS = {
  bkash: {
    label: "bKash",
    color: "#E2136E",
    bgColor: "rgba(226,19,110,0.08)",
    borderColor: "rgba(226,19,110,0.4)",
    logo: "💗",
    number: "01968434302",
    type: "merchant",
    steps: [
      "আপনার বিকাশ অ্যাপ বা *247# ডায়াল করুন",
      "Send Money বা Payment অপশন বেছে নিন",
      `মার্চেন্ট/পার্সোনাল নম্বরে পাঠান: 01968434302`,
      "Amount দিন এবং PIN দিয়ে নিশ্চিত করুন",
      "SMS-এ আসা Transaction ID নিচে দিন"
    ],
    ussd: "tel:*247#",
    appDeepLink: null
  },
  nagad: {
    label: "Nagad",
    color: "#F6821F",
    bgColor: "rgba(246,130,31,0.08)",
    borderColor: "rgba(246,130,31,0.4)",
    logo: "🟠",
    number: "01968434302",
    type: "merchant",
    steps: [
      "নগদ অ্যাপ বা *167# ডায়াল করুন",
      "Send Money অপশন বেছে নিন",
      `নম্বরে পাঠান: 01968434302`,
      "পরিমাণ দিন এবং PIN দিয়ে কনফার্ম করুন",
      "Transaction ID টি কপি করে নিচে পেস্ট করুন"
    ],
    ussd: "tel:*167#",
    appDeepLink: null
  },
  rocket: {
    label: "Rocket",
    color: "#8B0BAE",
    bgColor: "rgba(139,11,174,0.08)",
    borderColor: "rgba(139,11,174,0.4)",
    logo: "🚀",
    number: "019684343029",
    type: "merchant",
    steps: [
      "*322# ডায়াল করুন বা Rocket অ্যাপ খুলুন",
      "Send Money বেছে নিন",
      `নম্বরে পাঠান: 019684343029 (Rocket-এ শেষে 9 যোগ করুন)`,
      "পরিমাণ ও PIN দিয়ে নিশ্চিত করুন",
      "প্রাপ্ত Transaction ID নিচে লিখুন"
    ],
    ussd: "tel:*322#",
    appDeepLink: null
  },
  upay: {
    label: "Upay",
    color: "#1A56DB",
    bgColor: "rgba(26,86,219,0.08)",
    borderColor: "rgba(26,86,219,0.4)",
    logo: "🔵",
    number: "01968434302",
    type: "merchant",
    steps: [
      "Upay অ্যাপ খুলুন",
      "Send Money বেছে নিন",
      `নম্বরে পাঠান: 01968434302`,
      "পরিমাণ ও PIN দিয়ে কনফার্ম করুন",
      "Transaction ID নিচে দিন"
    ],
    ussd: null,
    appDeepLink: null
  }
};

const OTHER_METHODS = {
  stripe: { label: "Stripe", type: "online", logo: "💳" },
  paypal: { label: "PayPal", type: "online", logo: "🅿️" },
  upi: { label: "UPI", type: "manual", logo: "🇮🇳", number: "N/A", steps: ["UPI ID-তে পাঠান", "Transaction ID দিন"] },
  razorpay: { label: "Razorpay", type: "online", logo: "💳" },
  paytm: { label: "Paytm", type: "manual", logo: "🏦", number: "N/A" },
  easypaisa: { label: "Easypaisa", type: "manual", logo: "💚", number: "N/A" },
  jazzcash: { label: "JazzCash", type: "manual", logo: "🔴", number: "N/A" },
};

const ALL_METHODS = { ...BD_METHODS, ...OTHER_METHODS };

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getPlanDays(planKey) {
  const map = { days_15: 15, days_30: 30, days_90: 90, days_180: 180, days_365: 365 };
  return map[planKey] || 30;
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  const steps = ["পরিকল্পনা", "পেমেন্ট পদ্ধতি", "পেমেন্ট করুন", "নিশ্চিত করুন"];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${i < current ? "gradient-primary text-primary-foreground" : i === current ? "gradient-primary text-primary-foreground ring-4 ring-primary/30" : "bg-muted text-muted-foreground"}`}>
              {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 hidden sm:block">{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 sm:mx-2 transition-all ${i < current ? "bg-primary" : "bg-border"}`} style={{ minWidth: 20, maxWidth: 60 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PaymentSubmit() {
  const urlParams = new URLSearchParams(window.location.search);
  const planKey = urlParams.get("plan") || "days_30";

  React.useEffect(() => {
    db.auth.isAuthenticated().then(auth => {
      if (!auth) db.auth.redirectToLogin(window.location.href);
    });
  }, []);

  const plan = PLAN_CONFIG[planKey];
  const { countryData, formatPrice } = useCurrency();
  const availableMethods = (countryData.payment_methods || ["bkash", "nagad", "rocket"]).filter(m => ALL_METHODS[m]);

  const [step, setStep] = useState(1); // 1=method select, 2=payment guide, 3=tx confirm
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activated, setActivated] = useState(false);
  const [copied, setCopied] = useState(false);

  const methodConfig = selectedMethod ? ALL_METHODS[selectedMethod] : null;
  const isBdMethod = selectedMethod && BD_METHODS[selectedMethod];

  const copyNumber = (num) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    toast.success("নম্বর কপি হয়েছে!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActivate = async () => {
    if (!transactionId.trim()) {
      toast.error("Transaction ID দিন");
      return;
    }
    if (transactionId.trim().length < 6) {
      toast.error("সঠিক Transaction ID দিন (কমপক্ষে ৬ অক্ষর)");
      return;
    }
    setSubmitting(true);

    const user = await db.auth.me();

    // Save payment request as PENDING — admin must approve
    await db.entities.PaymentRequest.create({
      user_email: user.email,
      plan_name: planKey,
      payment_method: selectedMethod,
      transaction_id: transactionId.trim(),
      amount_bdt: plan.price,
      status: "pending"
    });

    setSubmitting(false);
    setActivated(true);
  };

  // ── Pending screen ───────────────────────────────────────────────────────────
  if (activated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full">
          <Card className="glass-card overflow-hidden">
            <div className="h-2 bg-yellow-500" />
            <CardContent className="p-8 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500/40 flex items-center justify-center mx-auto mb-5">
                <Loader2 className="w-10 h-10 text-yellow-500" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">পেমেন্ট যাচাই হচ্ছে</h2>
              <p className="text-muted-foreground mb-1">{plan?.name} প্ল্যান</p>
              <p className="text-sm text-muted-foreground mb-6">আপনার Transaction ID জমা হয়েছে</p>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-4 text-sm text-yellow-600 dark:text-yellow-400 text-left space-y-1">
                <p className="font-semibold">⏳ অ্যাডমিন যাচাই করবেন</p>
                <p>সাধারণত ১–২৪ ঘণ্টার মধ্যে আপনার সাবস্ক্রিপশন সক্রিয় হবে। অনুমোদনের পর সব টুলস আনলক হবে।</p>
              </div>
              <Link to={createPageUrl("Dashboard")}>
                <Button variant="outline" className="w-full">
                  ড্যাশবোর্ডে যান
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Pricing")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Pricing
          </Link>
          <div className="flex items-center gap-2">
            <CountrySelector />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Plan summary pill */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Badge className="gradient-primary text-primary-foreground px-4 py-1.5 text-sm font-semibold">
            {plan?.name} — {formatPrice(plan?.price)}
          </Badge>
          {countryData.currency !== "BDT" && (
            <span className="text-xs text-muted-foreground">≈ ৳{plan?.price} BDT</span>
          )}
        </div>

        <StepIndicator current={step} />

        <AnimatePresence mode="wait">
          {/* ── STEP 1: Method Selection ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-primary" />
                    পেমেন্ট পদ্ধতি বেছে নিন
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {availableMethods.map(m => {
                    const cfg = ALL_METHODS[m];
                    const isBd = BD_METHODS[m];
                    return (
                      <button
                        key={m}
                        onClick={() => { setSelectedMethod(m); setStep(2); }}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.01] active:scale-[0.99] text-left"
                        style={{
                          background: isBd ? cfg.bgColor : "rgba(255,255,255,0.03)",
                          borderColor: isBd ? cfg.borderColor : "rgba(255,255,255,0.1)",
                        }}
                      >
                        <span className="text-2xl">{cfg.logo}</span>
                        <div className="flex-1">
                          <p className="font-semibold" style={{ color: isBd ? cfg.color : undefined }}>{cfg.label}</p>
                          {isBd && <p className="text-xs text-muted-foreground">তাৎক্ষণিক অ্যাক্টিভেশন</p>}
                        </div>
                        {isBd && (
                          <Badge className="text-xs" style={{ background: cfg.bgColor, color: cfg.color, border: `1px solid ${cfg.borderColor}` }}>
                            সরাসরি
                          </Badge>
                        )}
                        <ArrowLeft className="w-4 h-4 rotate-180 text-muted-foreground" />
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── STEP 2: Payment Guide ── */}
          {step === 2 && methodConfig && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card className="glass-card overflow-hidden">
                <div className="h-1" style={{ background: isBdMethod ? methodConfig.color : "hsl(var(--primary))" }} />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-2xl">{methodConfig.logo}</span>
                      {methodConfig.label} দিয়ে পেমেন্ট
                    </CardTitle>
                    <button onClick={() => setStep(1)} className="text-xs text-muted-foreground hover:text-foreground underline">বদলান</button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {isBdMethod && (
                    <>
                      {/* Amount to pay */}
                      <div className="rounded-2xl p-4 border" style={{ background: methodConfig.bgColor, borderColor: methodConfig.borderColor }}>
                        <p className="text-xs text-muted-foreground mb-1">পাঠাতে হবে</p>
                        <p className="text-3xl font-extrabold" style={{ color: methodConfig.color }}>৳{plan?.price}</p>
                      </div>

                      {/* Number */}
                      <div className="space-y-1.5">
                        <Label>পাঠাবেন এই নম্বরে</Label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 flex items-center gap-3 p-3 rounded-xl border font-mono text-lg font-bold"
                            style={{ background: methodConfig.bgColor, borderColor: methodConfig.borderColor, color: methodConfig.color }}>
                            <Phone className="w-4 h-4" />
                            {methodConfig.number}
                          </div>
                          <Button size="sm" variant="outline" className="gap-1 shrink-0" onClick={() => copyNumber(methodConfig.number)}>
                            {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            Copy
                          </Button>
                        </div>
                      </div>

                      {/* USSD button */}
                      {methodConfig.ussd && (
                        <a href={methodConfig.ussd} className="flex items-center gap-2 w-full">
                          <Button variant="outline" className="w-full gap-2" style={{ borderColor: methodConfig.borderColor, color: methodConfig.color }}>
                            <ExternalLink className="w-4 h-4" />
                            {methodConfig.label} খুলুন ({methodConfig.ussd.replace("tel:", "")})
                          </Button>
                        </a>
                      )}

                      {/* Steps */}
                      <div className="space-y-2">
                        <Label className="text-sm">কিভাবে পাঠাবেন</Label>
                        <div className="space-y-2">
                          {methodConfig.steps.map((s, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                                style={{ background: methodConfig.bgColor, color: methodConfig.color, border: `1px solid ${methodConfig.borderColor}` }}>
                                {i + 1}
                              </div>
                              <p className="text-muted-foreground leading-relaxed">{s}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-600 dark:text-amber-400">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        পেমেন্ট করার পর Transaction ID লিখে রাখুন — পরের ধাপে লাগবে
                      </div>

                      <Button
                        className="w-full text-primary-foreground font-bold py-5 text-base"
                        style={{ background: methodConfig.color }}
                        onClick={() => setStep(3)}
                      >
                        পেমেন্ট করেছি →
                      </Button>
                    </>
                  )}

                  {!isBdMethod && (
                    <div className="text-center py-8 space-y-4">
                      <p className="text-muted-foreground">এই পেমেন্ট পদ্ধতির জন্য আমাদের সাথে যোগাযোগ করুন।</p>
                      <Button onClick={() => setStep(3)} className="gradient-primary text-primary-foreground">
                        Transaction ID দিয়ে এগিয়ে যান
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── STEP 3: Transaction ID Confirm ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Transaction ID দিন
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="bg-primary/8 border border-primary/20 rounded-2xl p-4 text-sm">
                    <p className="font-semibold mb-1">✅ পেমেন্ট নিশ্চিত করুন</p>
                    <p className="text-muted-foreground">
                      {methodConfig?.label} SMS বা অ্যাপে যে Transaction ID পেয়েছেন সেটা নিচে দিন।
                      Transaction ID দিলে আপনার সাবস্ক্রিপশন <strong>তাৎক্ষণিকভাবে</strong> সক্রিয় হবে।
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Transaction ID *</Label>
                    <Input
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value)}
                      placeholder="যেমন: 8H6A3BXK2M বা TXN123456"
                      className="font-mono text-base h-12"
                    />
                    <p className="text-xs text-muted-foreground">
                      {methodConfig?.label === "bKash" && "বিকাশ SMS: TrxID দিয়ে শুরু হওয়া কোডটি"}
                      {methodConfig?.label === "Nagad" && "নগদ SMS-এ Transaction ID খুঁজুন"}
                      {methodConfig?.label === "Rocket" && "Rocket SMS-এ TxnID দিয়ে শুরু কোডটি"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      className="w-full gradient-primary text-primary-foreground font-bold py-5 text-base"
                      onClick={handleActivate}
                      disabled={submitting || !transactionId.trim()}
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> সক্রিয় করা হচ্ছে...</>
                      ) : (
                        "সাবস্ক্রিপশন সক্রিয় করুন ✓"
                      )}
                    </Button>
                    <button
                      onClick={() => setStep(2)}
                      className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                      ← আগের ধাপে যান
                    </button>
                  </div>

                  <div className="flex items-start gap-2 bg-muted rounded-xl p-3 text-xs text-muted-foreground">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    ভুল Transaction ID দিলে সাবস্ক্রিপশন বাতিল হতে পারে। সঠিক TxID দেওয়া নিশ্চিত করুন।
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}