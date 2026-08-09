/**
 * Automatic currency detection from the device's public IP plus live USD
 * exchange rates. All card-market prices come in USD; the app converts them
 * to the collector's local currency for display.
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  rate: number;
  countryName: string | null;
  detectedAt: string;
}

export const DEFAULT_CURRENCY: CurrencyConfig = {
  code: "USD",
  symbol: "$",
  rate: 1,
  countryName: null,
  detectedAt: new Date(0).toISOString(),
};

interface IpWhoResponse {
  success?: boolean;
  country?: string;
  currency?: {
    code?: string;
    symbol?: string;
  };
}

interface RatesResponse {
  result?: string;
  rates?: Record<string, number>;
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Detects the local currency from the device IP (ipwho.is, no key needed) and
 * resolves the USD → local rate (open.er-api.com, no key needed).
 * Falls back to USD on any failure — never throws.
 */
export async function detectCurrency(): Promise<CurrencyConfig> {
  try {
    const geoRes = await fetchWithTimeout("https://ipwho.is/?fields=success,country,currency", 8000);
    const geo = (await geoRes.json()) as IpWhoResponse;
    const code = geo?.currency?.code?.toUpperCase();
    if (!geo?.success || !code || code.length !== 3) {
      console.log("[currency] geo lookup inconclusive — staying on USD");
      return { ...DEFAULT_CURRENCY, detectedAt: new Date().toISOString() };
    }
    if (code === "USD") {
      return {
        code: "USD",
        symbol: "$",
        rate: 1,
        countryName: geo.country ?? null,
        detectedAt: new Date().toISOString(),
      };
    }
    let rate = 1;
    try {
      const ratesRes = await fetchWithTimeout("https://open.er-api.com/v6/latest/USD", 8000);
      const rates = (await ratesRes.json()) as RatesResponse;
      const found = rates?.rates?.[code];
      if (typeof found === "number" && found > 0) {
        rate = found;
      } else {
        console.log("[currency] no rate for", code, "— staying on USD");
        return {
          code: "USD",
          symbol: "$",
          rate: 1,
          countryName: geo.country ?? null,
          detectedAt: new Date().toISOString(),
        };
      }
    } catch (rateError) {
      console.log("[currency] rate lookup failed", rateError);
      return {
        code: "USD",
        symbol: "$",
        rate: 1,
        countryName: geo.country ?? null,
        detectedAt: new Date().toISOString(),
      };
    }
    const symbol = geo.currency?.symbol && geo.currency.symbol.length <= 4 ? geo.currency.symbol : code;
    const config: CurrencyConfig = {
      code,
      symbol,
      rate,
      countryName: geo.country ?? null,
      detectedAt: new Date().toISOString(),
    };
    console.log("[currency] detected", config.code, "rate", config.rate, "country", config.countryName);
    return config;
  } catch (e) {
    console.log("[currency] detection failed — staying on USD", e);
    return { ...DEFAULT_CURRENCY, detectedAt: new Date().toISOString() };
  }
}
