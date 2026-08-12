const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollText, Loader2, Copy, Clock, BookOpen, Wand2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useSubscription } from "@/components/shared/useSubscription";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const PLATFORMS = ["YouTube", "Facebook", "TikTok / Reels", "Instagram", "Podcast", "Blog", "YouTube Shorts", "LinkedIn"];
const NICHES = ["Tech", "Education", "Finance", "Motivation", "Storytelling", "Health & Fitness", "Business", "Entertainment", "Travel", "Food", "Gaming", "Science", "Politics", "Fashion", "Sports"];
const CATEGORIES = {
  Tech: ["AI & Machine Learning", "Programming", "Gadgets & Reviews", "Cybersecurity", "Software", "Web Development", "Mobile Apps", "Cloud Computing", "Blockchain", "Data Science", "Open Source", "Tech News", "Robotics", "Wearables", "VR & AR"],
  Education: ["Tutorials", "Explainers", "Study Tips", "Language Learning", "History", "Mathematics", "Science Education", "Test Prep", "Online Courses", "Career Advice", "School Life", "Book Summaries", "Philosophy", "Psychology", "Geography"],
  Finance: ["Investing", "Budgeting", "Crypto", "Stock Market", "Personal Finance", "Real Estate", "Passive Income", "Tax Tips", "Retirement Planning", "Side Hustles", "Forex Trading", "Financial Literacy", "Debt Management", "Banking", "Insurance"],
  Motivation: ["Self Improvement", "Success Stories", "Productivity", "Mindset", "Goals", "Morning Routines", "Discipline", "Overcoming Failure", "Leadership Skills", "Confidence Building", "Time Management", "Journaling", "Gratitude", "Visualization", "Mental Toughness"],
  Storytelling: ["True Crime", "Fiction", "Personal Stories", "Documentary Style", "Narrative", "Horror Stories", "Mystery", "Historical Drama", "Short Films", "Fairy Tales", "Urban Legends", "Sci-Fi", "Romance", "Adventure", "Comedy Skits"],
  "Health & Fitness": ["Workout", "Nutrition", "Mental Health", "Yoga", "Weight Loss", "Cardio", "Strength Training", "Meditation", "Sleep Health", "Sports Medicine", "Gut Health", "Intermittent Fasting", "Running", "Stretching", "Wellness Routines"],
  Business: ["Entrepreneurship", "Marketing", "Startups", "Leadership", "E-commerce", "Product Development", "Branding", "Sales", "Remote Work", "Freelancing", "Business Strategy", "Customer Service", "Social Media Marketing", "SEO", "Content Marketing"],
  Entertainment: ["Comedy", "Drama", "Reaction", "Reviews", "Top Lists", "Movie Analysis", "Celebrity News", "Music Reviews", "TV Show Recaps", "Unboxing", "Challenges", "Prank Videos", "Award Shows", "Fan Theories", "Behind the Scenes"],
  Travel: ["Vlogs", "Travel Tips", "Destination Guides", "Budget Travel", "Adventure", "Solo Travel", "Luxury Travel", "Road Trips", "Backpacking", "City Guides", "Food Tourism", "Cultural Experiences", "Travel Hacks", "Visa Guides", "Hidden Gems"],
  Food: ["Recipes", "Restaurant Reviews", "Cooking Tips", "Food Culture", "Nutrition", "Baking", "Street Food", "Vegan & Vegetarian", "World Cuisine", "Meal Prep", "Desserts", "Drinks & Cocktails", "BBQ & Grilling", "Food History", "Kitchen Gadgets"],
  Gaming: ["Game Reviews", "Walkthroughs", "Esports", "Game Dev", "Retro Gaming", "FPS Games", "RPG", "Strategy Games", "Mobile Gaming", "Indie Games", "Gaming News", "Controller Reviews", "Game Lore", "Speedruns", "Multiplayer Tips"],
  Science: ["Space", "Biology", "Physics", "Environment", "Experiments", "Chemistry", "Geology", "Neuroscience", "Climate Change", "Genetics", "Astronomy", "Oceanography", "Zoology", "Mathematics", "Quantum Physics"],
  Politics: ["Analysis", "News Commentary", "History", "Policy", "Elections", "International Relations", "Human Rights", "Economics", "Government Systems", "Social Issues", "Geopolitics", "Law & Justice", "Environment Policy", "Media Bias", "Political Philosophy"],
  Fashion: ["Style Tips", "Brand Reviews", "Trends", "DIY Fashion", "Sustainability", "Streetwear", "Luxury Fashion", "Vintage & Thrift", "Seasonal Looks", "Accessories", "Makeup", "Skincare", "Hair", "Men's Fashion", "Fashion History"],
  Sports: ["Analysis", "Training Tips", "Match Reviews", "Athlete Stories", "Fantasy Sports", "Football", "Basketball", "Cricket", "Tennis", "Swimming", "Martial Arts", "Cycling", "Athletics", "Rugby", "Baseball"],
};
const LANGUAGES = ["English", "Bengali", "Hindi", "Arabic", "Spanish", "French", "Portuguese", "Urdu", "Indonesian", "Turkish", "German", "Japanese", "Korean", "Chinese", "Russian"];

const DURATION_PRESETS = [
  { label: "1 min", chars: 800 },
  { label: "3 min", chars: 2400 },
  { label: "5 min", chars: 4000 },
  { label: "10 min", chars: 8000 },
  { label: "20+ min", chars: 16000 },
];

const WPM = 130;
const CHARS_PER_WORD = 5;

function calcStats(chars) {
  const words = Math.round(chars / CHARS_PER_WORD);
  const minutes = Math.round(words / WPM);
  return { words, minutes };
}

export default function LongScriptGenerator() {
  const { subscription, user } = useSubscription();

  const [title, setTitle] = useState("");
  const [niche, setNiche] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [description, setDescription] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [platform, setPlatform] = useState("");
  const [language, setLanguage] = useState("English");
  const [lengthMode, setLengthMode] = useState("chars"); // 'chars' | 'duration'
  const [charCount, setCharCount] = useState(3000);
  const [durationPreset, setDurationPreset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const targetChars = lengthMode === "duration" && durationPreset ? durationPreset.chars : charCount;
  const stats = useMemo(() => calcStats(targetChars), [targetChars]);

  const handleGenerate = async () => {
    if (!title.trim()) { toast.error("Please enter a script title"); return; }
    if (!platform) { toast.error("Please select a target platform"); return; }
    if (!niche) { toast.error("Please select a niche"); return; }
    if (!subscription) {
      toast.error("You need an active subscription to use this tool");
      return;
    }

    setLoading(true);
    setScript("");

    const prompt = `You are a professional script writer. Write a high-quality, engaging long-form script with the following specifications:

Title: ${title}
Platform: ${platform}
Niche: ${niche}
${selectedCategories.length > 0 ? `Sub-Niches: ${selectedCategories.join(", ")}` : ""}
Language: ${language}
Target Length: approximately ${targetChars} characters (~${stats.words} words, ~${stats.minutes} minutes when spoken)
${description ? `Context/Description: ${description}` : ""}
${customPrompt ? `Additional Instructions: ${customPrompt}` : ""}

Guidelines:
- Write in ${language}
- Tailor the tone, pacing, and structure for ${platform}
- Include a strong hook at the start
- Use natural, conversational language suitable for speaking aloud
- Add clear section breaks or timestamps where appropriate
- End with a strong call-to-action
- Make it approximately ${targetChars} characters long
- Do NOT include meta-commentary, just the script itself

Write the full script now:`;

    const result = await db.integrations.Core.InvokeLLM({ prompt });
    setScript(result);
    setLoading(false);

    // Log usage
    if (user) {
      db.entities.UsageLog.create({ user_email: user.email, tool_name: "Long Script Generator", platform }).catch(() => {});
    }
  };

  const copyScript = () => {
    navigator.clipboard.writeText(script);
    toast.success("Script copied to clipboard!");
  };

  const actualStats = useMemo(() => {
    if (!script) return null;
    const words = script.trim().split(/\s+/).length;
    const minutes = Math.round(words / WPM);
    return { chars: script.length, words, minutes };
  }, [script]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <ScrollText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Long Script Generator</h1>
            <p className="text-sm text-muted-foreground">Generate high-quality long-form scripts for any platform</p>
          </div>
        </div>
      </motion.div>

      {!subscription && (
        <Card className="glass-card border-dashed border-2">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">You need an active subscription to generate scripts.</p>
            <Link to={createPageUrl("Pricing")}>
              <Button size="sm" className="gradient-primary text-primary-foreground">Get a Plan</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Config Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Script Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Script Title *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. How AI Will Change Everything" />
              </div>

              <div className="space-y-1.5">
                <Label>Target Platform *</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                 <Label>Niche *</Label>
                 <Select value={niche} onValueChange={v => { setNiche(v); setSelectedCategories([]); }}>
                   <SelectTrigger><SelectValue placeholder="Select niche" /></SelectTrigger>
                   <SelectContent>
                     {NICHES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                   </SelectContent>
                 </Select>
               </div>

              {niche && (
                 <div className="space-y-1.5">
                   <Label>Sub-Niches <span className="text-muted-foreground font-normal">(pick multiple)</span></Label>
                   <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-input bg-background max-h-40 overflow-y-auto">
                     {(CATEGORIES[niche] || []).map(c => {
                       const active = selectedCategories.includes(c);
                       return (
                         <button
                           key={c}
                           type="button"
                           onClick={() => setSelectedCategories(prev => active ? prev.filter(x => x !== c) : [...prev, c])}
                           className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                             active ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/60 text-muted-foreground hover:text-foreground"
                           }`}
                         >
                           {c}
                         </button>
                       );
                     })}
                   </div>
                   {selectedCategories.length > 0 && (
                     <button type="button" onClick={() => setSelectedCategories([])} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                       Clear selection
                     </button>
                   )}
                 </div>
               )}

              <div className="space-y-1.5">
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Description / Context</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this script about? Key points to cover..." rows={3} />
              </div>

              {/* Advanced */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                Advanced Options
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvanced && (
                <div className="space-y-3 pt-1">
                  <div className="space-y-1.5">
                    <Label>Custom Instructions</Label>
                    <Textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} placeholder="e.g. Use storytelling style, include humor, start with a shocking statistic..." rows={3} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Length Control */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Script Length</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={lengthMode} onValueChange={setLengthMode}>
                <TabsList className="w-full">
                  <TabsTrigger value="chars" className="flex-1">Characters</TabsTrigger>
                  <TabsTrigger value="duration" className="flex-1">Duration</TabsTrigger>
                </TabsList>
              </Tabs>

              {lengthMode === "chars" ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Characters</span>
                    <span className="font-semibold">{charCount.toLocaleString()}</span>
                  </div>
                  <Slider
                    min={1000} max={20000} step={500}
                    value={[charCount]}
                    onValueChange={([v]) => setCharCount(v)}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1,000</span><span>20,000+</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {DURATION_PRESETS.map(p => (
                    <button
                      key={p.label}
                      onClick={() => setDurationPreset(p)}
                      className={`rounded-lg border py-2 text-sm font-medium transition-all ${durationPreset?.label === p.label ? "border-primary bg-accent text-primary" : "border-border hover:border-primary/50"}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-accent/50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-primary mb-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Est. Words</span>
                  </div>
                  <p className="text-lg font-bold">{stats.words.toLocaleString()}</p>
                </div>
                <div className="bg-accent/50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-primary mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Est. Duration</span>
                  </div>
                  <p className="text-lg font-bold">{stats.minutes} min</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">Based on {WPM} words/min speaking speed</p>
            </CardContent>
          </Card>

          <Button
            onClick={handleGenerate}
            disabled={loading || !subscription}
            className="w-full gradient-primary text-primary-foreground gap-2 h-11"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {loading ? "Generating Script..." : "Generate Script"}
          </Button>
          {loading && <p className="text-xs text-muted-foreground text-center">This may take 15–30 seconds for longer scripts…</p>}
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-3">
          <Card className="glass-card h-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Generated Script</CardTitle>
              {script && (
                <div className="flex items-center gap-2">
                  {actualStats && (
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{actualStats.chars.toLocaleString()} chars</span>
                      <span>{actualStats.words.toLocaleString()} words</span>
                      <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />{actualStats.minutes} min</Badge>
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={copyScript} className="gap-1">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center animate-pulse">
                    <ScrollText className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">Crafting your script with AI…</p>
                </div>
              ) : script ? (
                <div className="relative">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-foreground max-h-[70vh] overflow-y-auto p-1">
                    {script}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                  <ScrollText className="w-10 h-10 text-muted-foreground/40" />
                  <p className="text-muted-foreground">Your generated script will appear here</p>
                  <p className="text-xs text-muted-foreground/60">Fill in the details and click Generate Script</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}