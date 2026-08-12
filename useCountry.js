const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";

const COUNTRY_KEY = "sg_country_data";
const LOCATION_KEY = "sg_location_data";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const DEFAULT_COUNTRY = {
  country: "Bangladesh",
  country_code: "BD",
  currency: "BDT",
  symbol: "৳",
  payment_methods: ["bkash", "nagad", "rocket", "upay"],
  price_multiplier: 1
};

const FALLBACK_COUNTRIES = [
  { country: "Bangladesh", country_code: "BD", currency: "BDT", symbol: "৳", payment_methods: ["bkash", "nagad", "rocket", "upay"], price_multiplier: 1 },
  { country: "India", country_code: "IN", currency: "INR", symbol: "₹", payment_methods: ["upi", "razorpay", "paytm"], price_multiplier: 1.0 },
  { country: "Pakistan", country_code: "PK", currency: "PKR", symbol: "Rs", payment_methods: ["easypaisa", "jazzcash"], price_multiplier: 2.0 },
  { country: "United States", country_code: "US", currency: "USD", symbol: "$", payment_methods: ["stripe", "paypal"], price_multiplier: 0.0091 },
  { country: "United Kingdom", country_code: "GB", currency: "GBP", symbol: "£", payment_methods: ["stripe", "paypal"], price_multiplier: 0.0072 },
  { country: "Canada", country_code: "CA", currency: "CAD", symbol: "CA$", payment_methods: ["stripe", "paypal"], price_multiplier: 0.012 },
  { country: "Australia", country_code: "AU", currency: "AUD", symbol: "A$", payment_methods: ["stripe", "paypal"], price_multiplier: 0.014 },
  { country: "Germany", country_code: "DE", currency: "EUR", symbol: "€", payment_methods: ["stripe", "paypal"], price_multiplier: 0.0084 },
  { country: "Other", country_code: "XX", currency: "USD", symbol: "$", payment_methods: ["stripe", "paypal"], price_multiplier: 0.0091 },
];

function getCachedLocation() {
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null; // expired
    return parsed;
  } catch {
    return null;
  }
}

function saveLocationCache(locationData) {
  try {
    localStorage.setItem(LOCATION_KEY, JSON.stringify({ ...locationData, timestamp: Date.now() }));
  } catch {}
}

async function detectCountryFromIP() {
  // Try multiple APIs in sequence for reliability
  const apis = [
    async () => {
      const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4000) });
      const d = await res.json();
      if (!d.country_code) throw new Error("no data");
      return { country: d.country_name, country_code: d.country_code, city: d.city, region: d.region, timezone: d.timezone };
    },
    async () => {
      const res = await fetch("https://get.geojs.io/v1/ip/geo.json", { signal: AbortSignal.timeout(4000) });
      const d = await res.json();
      if (!d.country_code) throw new Error("no data");
      return { country: d.country, country_code: d.country_code, city: d.city, region: d.region, timezone: d.timezone };
    },
    async () => {
      const res = await fetch("https://ipwho.is/", { signal: AbortSignal.timeout(4000) });
      const d = await res.json();
      if (!d.country_code) throw new Error("no data");
      return { country: d.country, country_code: d.country_code, city: d.city, region: d.region, timezone: d.timezone?.id };
    },
  ];

  for (const apiFn of apis) {
    try {
      const result = await apiFn();
      if (result?.country_code) return result;
    } catch {}
  }
  return null;
}

export function useCountry() {
  const [countryData, setCountryData] = useState(() => {
    const stored = localStorage.getItem(COUNTRY_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [locationInfo, setLocationInfo] = useState(() => getCachedLocation());
  const [allCountries, setAllCountries] = useState(FALLBACK_COUNTRIES);
  const [detecting, setDetecting] = useState(false);

  // Load DB pricing configs
  useEffect(() => {
    db.entities.CountryPricing.filter({ is_active: true })
      .then(rows => {
        if (rows && rows.length > 0) {
          const mapped = rows.map(r => ({
            ...r,
            payment_methods: r.payment_methods ? JSON.parse(r.payment_methods) : []
          }));
          setAllCountries(mapped);
          // Re-resolve stored country against DB data
          if (countryData) {
            const match = mapped.find(c => c.country_code === countryData.country_code);
            if (match) setCountryData(match);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Auto-detect if no stored country OR location cache expired
  useEffect(() => {
    const needsDetection = !countryData || !locationInfo;
    if (needsDetection) {
      setDetecting(true);
      detectCountryFromIP().then(detected => {
        if (detected?.country_code) {
          // Save rich location info
          const loc = { city: detected.city, region: detected.region, timezone: detected.timezone, country: detected.country, country_code: detected.country_code };
          saveLocationCache(loc);
          setLocationInfo(loc);
        }
        const match = allCountries.find(c => c.country_code === detected?.country_code);
        const resolved = match || DEFAULT_COUNTRY;
        if (!countryData) {
          setCountryData(resolved);
          localStorage.setItem(COUNTRY_KEY, JSON.stringify(resolved));
        }
        setDetecting(false);
      }).catch(() => setDetecting(false));
    }
  }, [allCountries]);

  const setCountry = (countryCode) => {
    const match = allCountries.find(c => c.country_code === countryCode);
    if (match) {
      setCountryData(match);
      localStorage.setItem(COUNTRY_KEY, JSON.stringify(match));
      // Save to user profile
      db.auth.updateMe({ country: match.country, currency: match.currency }).catch(() => {});
    }
  };

  const convertPrice = (bdtPrice) => {
    if (!bdtPrice || bdtPrice < 0) return null;
    const multiplier = countryData?.price_multiplier ?? 1;
    const converted = bdtPrice * multiplier;
    // Show reasonable decimal places
    if (converted < 1) return converted.toFixed(2);
    if (converted < 10) return converted.toFixed(1);
    return Math.round(converted).toString();
  };

  const formatPrice = (bdtPrice) => {
    const converted = convertPrice(bdtPrice);
    if (!converted) return "Custom";
    return `${countryData?.symbol || "৳"}${converted}`;
  };

  return {
    countryData: countryData || DEFAULT_COUNTRY,
    locationInfo, // { city, region, timezone, country, country_code }
    allCountries,
    detecting,
    setCountry,
    convertPrice,
    formatPrice,
  };
}