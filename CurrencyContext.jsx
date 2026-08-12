import React, { createContext, useContext } from "react";
import { useCountry, DEFAULT_COUNTRY } from "@/hooks/useCountry";

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const value = useCountry();
  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    // Fallback if used outside provider
    return {
      countryData: DEFAULT_COUNTRY,
      locationInfo: null,
      allCountries: [],
      detecting: false,
      setCountry: () => {},
      convertPrice: (p) => p,
      formatPrice: (p) => `৳${p}`,
    };
  }
  return ctx;
}