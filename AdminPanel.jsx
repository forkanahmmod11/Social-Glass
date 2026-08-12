const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import { PLAN_CONFIG } from "@/components/shared/PlanConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, Users, CreditCard, CheckCircle, XCircle, Clock,
  Search, DollarSign, TrendingUp, Loader2, Eye, Globe, Plus, Pencil, Trash2,   Megaphone, Upload, ExternalLink, Video
} from "lucide-react";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { motion } from "framer-motion";

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [countryPricings, setCountryPricings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [processing, setProcessing] = useState({});
  const [editingCountry, setEditingCountry] = useState(null);
  const [countryForm, setCountryForm] = useState({});
  const [savingCountry, setSavingCountry] = useState(false);
  const [adConfigs, setAdConfigs] = useState([null, null, null]);
  const [adForms, setAdForms] = useState([{}, {}, {}]);
  const [savingAd, setSavingAd] = useState({});
  const [uploadingAd, setUploadingAd] = useState({});
  const [heroVideo, setHeroVideo] = useState(null);
  const [heroForm, setHeroForm] = useState({ video_url: "", title: "" });
  const [uploadingHero, setUploadingHero] = useState(false);
  const [savingHero, setSavingHero] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const isAdmin = (u) => u?.role === "admin" || u?.email === "ahmedforkan26@gmail.com";

  const loadData = async () => {
    const me = await db.auth.me();
    setUser(me);
    if (!isAdmin(me)) return;

    const [paymentData, subData, userData, countryData, adData] = await Promise.all([
      db.entities.PaymentRequest.list("-created_date", 100),
      db.entities.Subscription.list("-created_date", 100),
      db.entities.User.list("-created_date", 100),
      db.entities.CountryPricing.list(),
      db.entities.AdConfig.list("slot", 3),
    ]);

    setPayments(paymentData);
    setSubscriptions(subData);
    setUsers(userData);
    setCountryPricings(countryData);

    const configs = [null, null, null];
    const forms = [{}, {}, {}];
    adData.forEach(ad => {
      const idx = ad.slot - 1;
      if (idx >= 0 && idx < 3) {
        configs[idx] = ad;
        forms[idx] = { title: ad.title, description: ad.description, image_url: ad.image_url || "", link_url: ad.link_url || "" };
      }
    });
    setAdConfigs(configs);
    setAdForms(forms);

    const heroData = await db.entities.HeroVideo.filter({ is_active: true }, "-updated_date", 1).catch(() => []);
    if (heroData[0]) {
      setHeroVideo(heroData[0]);
      setHeroForm({ video_url: heroData[0].video_url || "", title: heroData[0].title || "" });
    }
    setLoading(false);
  };

  const PLAN_DAYS = { days_15: 15, days_30: 30, days_90: 90, days_180: 180, days_365: 365 };

  const approvePayment = async (payment) => {
    setProcessing(prev => ({ ...prev, [payment.id]: true }));

    await db.entities.PaymentRequest.update(payment.id, { status: "approved" });

    const now = new Date();
    const days = PLAN_DAYS[payment.plan_name] || 30;
    const endDate = addDays(now, days);

    await db.entities.Subscription.create({
      user_email: payment.user_email,
      plan_name: payment.plan_name,
      status: "active",
      start_date: format(now, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
      keyword_searches_used: 0,
      hashtag_generations_used: 0,
      price_bdt: payment.amount_bdt
    });

    toast.success(`✅ Approved for ${payment.user_email} — ${days} days activated`);
    setProcessing(prev => ({ ...prev, [payment.id]: false }));
    loadData();
  };

  const rejectPayment = async (payment) => {
    setProcessing(prev => ({ ...prev, [payment.id]: true }));
    await db.entities.PaymentRequest.update(payment.id, { status: "rejected" });
    toast.success("Payment rejected");
    setProcessing(prev => ({ ...prev, [payment.id]: false }));
    loadData();
  };

  const openEditCountry = (cp) => {
    setEditingCountry(cp?.id || "new");
    setCountryForm(cp ? {
      country: cp.country,
      country_code: cp.country_code,
      currency: cp.currency,
      symbol: cp.symbol,
      price_multiplier: cp.price_multiplier,
      payment_methods: cp.payment_methods,
      is_active: cp.is_active !== false,
    } : { is_active: true, price_multiplier: 1 });
  };

  const saveCountry = async () => {
    setSavingCountry(true);
    const data = {
      ...countryForm,
      price_multiplier: parseFloat(countryForm.price_multiplier) || 1,
    };
    if (editingCountry === "new") {
      await db.entities.CountryPricing.create(data);
      toast.success("Country pricing added");
    } else {
      await db.entities.CountryPricing.update(editingCountry, data);
      toast.success("Country pricing updated");
    }
    setSavingCountry(false);
    setEditingCountry(null);
    loadData();
  };

  const deleteCountry = async (id) => {
    await db.entities.CountryPricing.delete(id);
    toast.success("Deleted");
    loadData();
  };

  const saveAd = async (slot) => {
    const idx = slot - 1;
    setSavingAd(prev => ({ ...prev, [slot]: true }));
    const data = { ...adForms[idx], slot, is_active: true };
    if (adConfigs[idx]) {
      await db.entities.AdConfig.update(adConfigs[idx].id, data);
    } else {
      await db.entities.AdConfig.create(data);
    }
    toast.success(`Ad ${slot} saved`);
    setSavingAd(prev => ({ ...prev, [slot]: false }));
    loadData();
  };

  const uploadAdImage = async (slot, file) => {
    const idx = slot - 1;
    setUploadingAd(prev => ({ ...prev, [slot]: true }));
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setAdForms(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], image_url: file_url };
      return updated;
    });
    setUploadingAd(prev => ({ ...prev, [slot]: false }));
    toast.success("Image uploaded");
  };

  const uploadHeroVideo = async (file) => {
    setUploadingHero(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setHeroForm(prev => ({ ...prev, video_url: file_url }));
    setUploadingHero(false);
    toast.success("Video uploaded");
  };

  const saveHeroVideo = async () => {
    if (!heroForm.video_url) { toast.error("আগে video আপলোড করুন"); return; }
    setSavingHero(true);
    if (heroVideo) {
      await db.entities.HeroVideo.update(heroVideo.id, { ...heroForm, is_active: true });
    } else {
      await db.entities.HeroVideo.create({ ...heroForm, is_active: true });
    }
    setSavingHero(false);
    toast.success("Hero video saved");
    loadData();
  };

  const removeHeroVideo = async () => {
    if (!heroVideo) return;
    await db.entities.HeroVideo.update(heroVideo.id, { is_active: false });
    setHeroVideo(null);
    setHeroForm({ video_url: "", title: "" });
    toast.success("Hero video deactivated");
    loadData();
  };

  const deactivateSub = async (sub) => {
    await db.entities.Subscription.update(sub.id, { status: "expired" });
    toast.success("Subscription deactivated");
    loadData();
  };

  if (user && !isAdmin(user)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto text-destructive mb-4" />
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">Admin access required</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingPayments = payments.filter(p => p.status === "pending");
  const totalRevenue = payments.filter(p => p.status === "approved").reduce((sum, p) => sum + (p.amount_bdt || 0), 0);
  const activeSubscriptions = subscriptions.filter(s => s.status === "active");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" /> Admin Panel
        </h1>
        <p className="text-muted-foreground mt-1">Manage users, payments, and subscriptions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: users.length, icon: Users, color: "text-blue-500" },
          { label: "Active Subs", value: activeSubscriptions.length, icon: CreditCard, color: "text-green-500" },
          { label: "Pending Payments", value: pendingPayments.length, icon: Clock, color: "text-yellow-500" },
          { label: "Revenue (BDT)", value: totalRevenue.toLocaleString(), icon: DollarSign, color: "text-primary" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="payments">
        <TabsList className="bg-secondary flex-wrap h-auto gap-1">
          <TabsTrigger value="payments">Payments ({pendingPayments.length} pending)</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="pricing" className="gap-1"><Globe className="w-3.5 h-3.5" />Country Pricing</TabsTrigger>
          <TabsTrigger value="ads" className="gap-1"><Megaphone className="w-3.5 h-3.5" />Ads</TabsTrigger>
          <TabsTrigger value="herovideo" className="gap-1"><Video className="w-3.5 h-3.5" />Hero Video</TabsTrigger>
        </TabsList>

        {/* Payments */}
        <TabsContent value="payments" className="space-y-3 mt-4">
          {payments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No payment requests</p>
          ) : (
            payments.map((payment) => (
              <Card key={payment.id} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{payment.user_email}</span>
                        <Badge className={
                          payment.status === "pending" ? "bg-yellow-500/10 text-yellow-600" :
                          payment.status === "approved" ? "bg-green-500/10 text-green-600" :
                          "bg-red-500/10 text-red-600"
                        }>{payment.status}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>{PLAN_CONFIG[payment.plan_name]?.name} Plan</span>
                        <span>{payment.amount_bdt} BDT</span>
                        <span>{payment.payment_method}</span>
                        <span>TxID: {payment.transaction_id}</span>
                        <span>{format(new Date(payment.created_date), "MMM dd, HH:mm")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {payment.screenshot_url && (
                        <a href={payment.screenshot_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="w-3 h-3" /> Screenshot
                          </Button>
                        </a>
                      )}
                      {payment.status === "pending" && (
                        <>
                          <Button size="sm" className="gradient-primary text-primary-foreground gap-1"
                            disabled={processing[payment.id]}
                            onClick={() => approvePayment(payment)}>
                            {processing[payment.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="gap-1"
                            disabled={processing[payment.id]}
                            onClick={() => rejectPayment(payment)}>
                            <XCircle className="w-3 h-3" /> Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Subscriptions */}
        <TabsContent value="subscriptions" className="space-y-3 mt-4">
          {subscriptions.map((sub) => (
            <Card key={sub.id} className="glass-card">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{sub.user_email}</span>
                      <Badge className={sub.status === "active" ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}>
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span>{PLAN_CONFIG[sub.plan_name]?.name}</span>
                      <span>{sub.price_bdt} BDT</span>
                      <span>Expires: {sub.end_date ? format(new Date(sub.end_date), "MMM dd, yyyy") : "N/A"}</span>
                    </div>
                  </div>
                  {sub.status === "active" && (
                    <Button size="sm" variant="destructive" onClick={() => deactivateSub(sub)}>
                      Deactivate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Country Pricing */}
        <TabsContent value="pricing" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Manage per-country pricing and payment methods</p>
            <Button size="sm" className="gradient-primary text-primary-foreground gap-1" onClick={() => openEditCountry(null)}>
              <Plus className="w-3.5 h-3.5" /> Add Country
            </Button>
          </div>

          {editingCountry && (
            <Card className="glass-card border-primary/30">
              <CardHeader><CardTitle className="text-base">{editingCountry === "new" ? "Add Country" : "Edit Country"}</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Country Name</Label>
                  <Input value={countryForm.country || ""} onChange={e => setCountryForm(p => ({ ...p, country: e.target.value }))} placeholder="e.g. Bangladesh" />
                </div>
                <div className="space-y-1">
                  <Label>Country Code (ISO 2)</Label>
                  <Input value={countryForm.country_code || ""} onChange={e => setCountryForm(p => ({ ...p, country_code: e.target.value.toUpperCase() }))} placeholder="e.g. BD" maxLength={2} />
                </div>
                <div className="space-y-1">
                  <Label>Currency Code</Label>
                  <Input value={countryForm.currency || ""} onChange={e => setCountryForm(p => ({ ...p, currency: e.target.value.toUpperCase() }))} placeholder="e.g. BDT" />
                </div>
                <div className="space-y-1">
                  <Label>Currency Symbol</Label>
                  <Input value={countryForm.symbol || ""} onChange={e => setCountryForm(p => ({ ...p, symbol: e.target.value }))} placeholder="e.g. ৳" />
                </div>
                <div className="space-y-1">
                  <Label>Price Multiplier (from BDT)</Label>
                  <Input type="number" step="0.0001" value={countryForm.price_multiplier || 1} onChange={e => setCountryForm(p => ({ ...p, price_multiplier: e.target.value }))} placeholder="e.g. 0.0091 for USD" />
                </div>
                <div className="space-y-1">
                  <Label>Payment Methods (comma-separated)</Label>
                  <Input value={countryForm.payment_methods || ""} onChange={e => setCountryForm(p => ({ ...p, payment_methods: e.target.value }))} placeholder='e.g. ["bkash","nagad"]' />
                  <p className="text-xs text-muted-foreground">JSON array: ["bkash","nagad","rocket"]</p>
                </div>
                <div className="sm:col-span-2 flex gap-2">
                  <Button onClick={saveCountry} disabled={savingCountry} className="gradient-primary text-primary-foreground gap-1">
                    {savingCountry ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setEditingCountry(null)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {countryPricings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No country pricing configs yet. Add one above.</p>
          ) : (
            countryPricings.map(cp => (
              <Card key={cp.id} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        <span className="font-medium">{cp.country}</span>
                        <Badge variant="secondary">{cp.country_code}</Badge>
                        <Badge variant="outline">{cp.symbol} {cp.currency}</Badge>
                        {cp.is_active === false && <Badge className="bg-red-500/10 text-red-600">Inactive</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span>Multiplier: ×{cp.price_multiplier}</span>
                        <span>Methods: {cp.payment_methods}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => openEditCountry(cp)}>
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </Button>
                      <Button size="sm" variant="destructive" className="gap-1" onClick={() => deleteCountry(cp.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Ads */}
        <TabsContent value="ads" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">এই ৩টি অ্যাড ইউজাররা ফ্রি ট্রায়াল আনলক করার সময় দেখবে। ইমেজ আপলোড করুন এবং ক্লিক করলে যে লিঙ্কে যাবে সেটা দিন।</p>
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map(slot => {
              const idx = slot - 1;
              const form = adForms[idx] || {};
              return (
                <Card key={slot} className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-primary" />
                      Ad {slot}
                      {adConfigs[idx] && <Badge className="bg-green-500/10 text-green-600 text-xs">Saved</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Image upload */}
                    <div className="space-y-2">
                      <Label>Ad Image</Label>
                      <div className="flex gap-3 items-start">
                        {form.image_url && (
                          <img src={form.image_url} alt="Ad preview" className="w-24 h-16 object-cover rounded-lg border border-border" />
                        )}
                        <div className="flex-1 space-y-2">
                          <Input
                            value={form.image_url || ""}
                            onChange={e => setAdForms(prev => { const u = [...prev]; u[idx] = { ...u[idx], image_url: e.target.value }; return u; })}
                            placeholder="Image URL (paste link)"
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">অথবা</span>
                            <label className="cursor-pointer">
                              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadAdImage(slot, e.target.files[0])} />
                              <Button size="sm" variant="outline" className="gap-1" asChild>
                                <span>
                                  {uploadingAd[slot] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                  Upload
                                </span>
                              </Button>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Link URL */}
                    <div className="space-y-1">
                      <Label>ক্লিক করলে যাবে (Link URL)</Label>
                      <div className="flex gap-2">
                        <Input
                          value={form.link_url || ""}
                          onChange={e => setAdForms(prev => { const u = [...prev]; u[idx] = { ...u[idx], link_url: e.target.value }; return u; })}
                          placeholder="https://example.com"
                        />
                        {form.link_url && (
                          <a href={form.link_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline"><ExternalLink className="w-3.5 h-3.5" /></Button>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Title & Description (fallback if no image) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Title (ইমেজ না থাকলে দেখাবে)</Label>
                        <Input
                          value={form.title || ""}
                          onChange={e => setAdForms(prev => { const u = [...prev]; u[idx] = { ...u[idx], title: e.target.value }; return u; })}
                          placeholder="Ad title"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Description</Label>
                        <Input
                          value={form.description || ""}
                          onChange={e => setAdForms(prev => { const u = [...prev]; u[idx] = { ...u[idx], description: e.target.value }; return u; })}
                          placeholder="Short description"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() => saveAd(slot)}
                      disabled={savingAd[slot]}
                      className="gradient-primary text-primary-foreground gap-1"
                    >
                      {savingAd[slot] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Save Ad {slot}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Hero Video */}
        <TabsContent value="herovideo" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">এই video টি Dashboard-এ premium showcase block হিসেবে auto-loop (muted) প্লে হবে। MP4/WebM আপলোড করুন।</p>
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" /> Hero Showcase Video
                {heroVideo && <Badge className="bg-green-500/10 text-green-600 text-xs">Active</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {heroForm.video_url ? (
                <video src={heroForm.video_url} autoPlay loop muted playsInline
                  className="w-full max-h-72 object-cover rounded-xl border border-border bg-black" />
              ) : (
                <div className="w-full h-44 rounded-xl border border-dashed border-border flex items-center justify-center text-muted-foreground text-sm">
                  Video preview এখানে দেখাবে
                </div>
              )}

              <div className="space-y-1">
                <Label>Title (optional)</Label>
                <Input
                  value={heroForm.title || ""}
                  onChange={e => setHeroForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Featured Showcase"
                />
              </div>

              <div className="space-y-2">
                <Label>Video URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={heroForm.video_url || ""}
                    onChange={e => setHeroForm(prev => ({ ...prev, video_url: e.target.value }))}
                    placeholder="Paste direct video URL"
                    className="flex-1"
                  />
                  <label className="cursor-pointer">
                    <input type="file" accept="video/*" className="hidden" onChange={e => e.target.files[0] && uploadHeroVideo(e.target.files[0])} />
                    <Button size="sm" variant="outline" className="gap-1" asChild>
                      <span>
                        {uploadingHero ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        Upload
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveHeroVideo} disabled={savingHero} className="gradient-primary text-primary-foreground gap-1">
                  {savingHero ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Save & Activate
                </Button>
                {heroVideo && (
                  <Button size="sm" variant="destructive" className="gap-1" onClick={removeHeroVideo}>
                    <XCircle className="w-3.5 h-3.5" /> Deactivate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="space-y-3 mt-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="pl-9" />
          </div>
          {users.filter(u => !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.full_name?.toLowerCase().includes(search.toLowerCase())).map((u) => (
            <Card key={u.id} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                      <span className="text-sm font-semibold text-accent-foreground">{u.full_name?.[0]?.toUpperCase() || "?"}</span>
                    </div>
                    <div>
                      <p className="font-medium">{u.full_name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{u.role || "user"}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}