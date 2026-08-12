import React, { useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { Globe, ChevronDown } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function CountrySelector() {
  const { countryData, allCountries, setCountry } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-medium">
          <Globe className="w-3.5 h-3.5" />
          <span>{countryData.symbol} {countryData.currency}</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto w-52">
        {allCountries.map(c => (
          <DropdownMenuItem
            key={c.country_code}
            onClick={() => setCountry(c.country_code)}
            className={countryData.country_code === c.country_code ? "bg-accent text-accent-foreground" : ""}
          >
            <span className="flex-1">{c.country}</span>
            <span className="text-muted-foreground text-xs ml-2">{c.symbol} {c.currency}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}