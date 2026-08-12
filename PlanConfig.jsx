export const PLAN_CONFIG = {
  days_15: {
    name: "15 Days",
    price: 99,
    period: "15 days",
    keyword_limit: -1,
    hashtag_limit: -1,
    features: [
      "All Features Access",
      "Unlimited AI Generations",
      "All SEO & Content Tools",
      "Valid for 15 Days"
    ],
    tools: ["all"]
  },
  days_30: {
    name: "30 Days",
    price: 149,
    period: "30 days",
    keyword_limit: -1,
    hashtag_limit: -1,
    features: [
      "All Features Access",
      "Unlimited AI Generations",
      "All SEO & Content Tools",
      "Valid for 30 Days"
    ],
    tools: ["all"]
  },
  days_90: {
    name: "90 Days",
    price: 399,
    period: "90 days",
    keyword_limit: -1,
    hashtag_limit: -1,
    features: [
      "All Features Access",
      "Unlimited AI Generations",
      "All SEO & Content Tools",
      "Valid for 90 Days"
    ],
    tools: ["all"]
  },
  days_180: {
    name: "180 Days",
    price: 599,
    period: "180 days",
    keyword_limit: -1,
    hashtag_limit: -1,
    features: [
      "All Features Access",
      "Unlimited AI Generations",
      "All SEO & Content Tools",
      "Valid for 180 Days"
    ],
    tools: ["all"]
  },
  days_365: {
    name: "365 Days",
    price: 999,
    period: "365 days",
    keyword_limit: -1,
    hashtag_limit: -1,
    features: [
      "All Features Access",
      "Unlimited AI Generations",
      "All SEO & Content Tools",
      "Valid for 365 Days",
      "Best Value!"
    ],
    tools: ["all"]
  }
};

export const ALL_TOOLS = [
  "keyword_research", "hashtag_generator", "post_analyzer", "caption_generator",
  "content_ideas", "hook_generator", "content_generator", "trending_topics",
  "competitor_analyzer", "engagement_tips", "viral_finder", "profile_analyzer",
  "youtube_seo", "hashtag_scraper"
];

export function canAccessTool(planName, toolName) {
  if (!planName) return false;
  const plan = PLAN_CONFIG[planName];
  if (!plan) return false;
  if (plan.tools.includes("all")) return true;
  return plan.tools.includes(toolName);
}

export function getUsageLimit(planName, type) {
  if (!planName) return 0;
  const plan = PLAN_CONFIG[planName];
  if (!plan) return 0;
  if (type === "keyword") return plan.keyword_limit;
  if (type === "hashtag") return plan.hashtag_limit;
  return 0;
}