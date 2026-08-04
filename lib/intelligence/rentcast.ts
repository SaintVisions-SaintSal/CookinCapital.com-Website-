/**
 * RentCast API client — typed, live-verified against production keys 2026-08-03.
 *
 * Source of truth: /home/user/workspace/research/VERIFIED_API_FINDINGS.md
 * All endpoints below return 200 in the live findings doc.
 *
 * Base: https://api.rentcast.io/v1
 * Auth header: X-Api-Key: <RENTCAST_API>
 *
 * Sample verified call: 5500 Grand Lake Dr, San Antonio TX 78244 -> AVM
 * $237,000 (range 194k-279k), rent $1,650 (1,570-1,740). Zip 92618 median
 * sale $1,610,000, updated 2026-08-03.
 */

import { getEnv } from "@/lib/env";

const BASE_URL = "https://api.rentcast.io/v1";

export interface RentCastClientOptions {
  apiKey?: string;
  baseUrl?: string;
  maxRetries?: number;
}

export interface RentCastPropertyRecord {
  id?: string;
  formattedAddress?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  county?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  lotSize?: number;
  yearBuilt?: number;
  propertyType?: string;
  owner?: unknown;
  taxAssessments?: Record<string, unknown>;
  propertyTaxes?: Record<string, unknown>;
  history?: unknown;
  [key: string]: unknown;
}

export interface RentCastAvmComparable {
  formattedAddress?: string;
  price?: number;
  distance?: number;
  correlation?: number;
  [key: string]: unknown;
}

export interface RentCastValueAvmResponse {
  price: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  subjectProperty?: Record<string, unknown>;
  comparables?: RentCastAvmComparable[];
  [key: string]: unknown;
}

export interface RentCastRentAvmResponse {
  rent: number;
  rentRangeLow: number;
  rentRangeHigh: number;
  subjectProperty?: Record<string, unknown>;
  comparables?: RentCastAvmComparable[];
  [key: string]: unknown;
}

export interface RentCastMarketResponse {
  zipCode?: string;
  saleData?: Record<string, unknown>;
  rentalData?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface RentCastListing {
  id?: string;
  formattedAddress?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  status?: string;
  listedDate?: string;
  daysOnMarket?: number;
  [key: string]: unknown;
}

export interface SaleListingsParams {
  city?: string;
  state?: string;
  zipCode?: string;
  limit?: number;
  status?: string;
}

export interface RentalListingsParams {
  city?: string;
  state?: string;
  zipCode?: string;
  limit?: number;
  status?: string;
}

export interface BulkPropertiesParams {
  city?: string;
  state?: string;
  zipCode?: string;
  propertyType?: string;
  limit?: number;
  offset?: number;
}

/**
 * Token-bucket limiter for RentCast's hard 20 requests/second per-key cap.
 * Deliberately conservative (18 rps) to leave headroom for retries.
 */
class RateLimiter {
  private readonly capacity: number;
  private readonly refillPerMs: number;
  private tokens: number;
  private last = Date.now();

  constructor(perSecond: number) {
    this.capacity = perSecond;
    this.tokens = perSecond;
    this.refillPerMs = perSecond / 1000;
  }

  async take(): Promise<void> {
    for (;;) {
      const now = Date.now();
      this.tokens = Math.min(this.capacity, this.tokens + (now - this.last) * this.refillPerMs);
      this.last = now;
      if (this.tokens >= 1) {
        this.tokens -= 1;
        return;
      }
      await sleep(Math.ceil((1 - this.tokens) / this.refillPerMs) + 5);
    }
  }
}

export const rateLimiter = new RateLimiter(18);

export class RentCastClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly maxRetries: number;

  constructor(opts: RentCastClientOptions = {}) {
    const apiKey = opts.apiKey ?? getEnv("RENTCAST_API");
    if (!apiKey) {
      throw new Error(
        "Missing RentCast API key. Set RENTCAST_API in your environment (see .env.example)."
      );
    }
    this.apiKey = apiKey;
    this.baseUrl = opts.baseUrl ?? BASE_URL;
    this.maxRetries = opts.maxRetries ?? 4;
  }

  private async request<T>(
    path: string,
    query: Record<string, string | number | undefined> = {}
  ): Promise<T> {
    const url = new URL(this.baseUrl + path);
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }

    let attempt = 0;
    for (;;) {
      // RentCast enforces a hard 20 req/s ceiling per key. The limiter is
      // shared across every client instance in the process.
      await rateLimiter.take();
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "X-Api-Key": this.apiKey,
          Accept: "application/json",
        },
      });

      if (res.status === 429 || res.status >= 500) {
        if (attempt >= this.maxRetries) {
          const text = await safeText(res);
          throw new Error(
            `RentCast request failed after ${attempt + 1} attempts: ${res.status} ${res.statusText} — ${text}`
          );
        }
        const backoffMs = Math.min(30_000, 500 * 2 ** attempt) + Math.floor(Math.random() * 250);
        await sleep(backoffMs);
        attempt += 1;
        continue;
      }

      if (!res.ok) {
        const text = await safeText(res);
        throw new Error(`RentCast API error ${res.status} ${res.statusText}: ${text}`);
      }

      return (await res.json()) as T;
    }
  }

  /** GET /properties?address= — property record, characteristics, owner, tax + sale history. */
  async property(address: string): Promise<RentCastPropertyRecord> {
    const res = await this.request<RentCastPropertyRecord[] | RentCastPropertyRecord>(
      "/properties",
      { address }
    );
    return Array.isArray(res) ? (res[0] as RentCastPropertyRecord) : res;
  }

  /** GET /avm/value?address= — automated valuation model estimate. */
  async valueAvm(address: string): Promise<RentCastValueAvmResponse> {
    return this.request<RentCastValueAvmResponse>("/avm/value", { address });
  }

  /** GET /avm/rent/long-term?address= — long-term rent estimate. */
  async rentAvm(address: string): Promise<RentCastRentAvmResponse> {
    return this.request<RentCastRentAvmResponse>("/avm/rent/long-term", { address });
  }

  /** GET /markets?zipCode=&dataType=All — sale + rental aggregates by zip. */
  async market(zip: string): Promise<RentCastMarketResponse> {
    return this.request<RentCastMarketResponse>("/markets", {
      zipCode: zip,
      dataType: "All",
    });
  }

  /** GET /listings/sale — active for-sale listings. */
  async saleListings(params: SaleListingsParams): Promise<RentCastListing[]> {
    const res = await this.request<RentCastListing[] | { listings: RentCastListing[] }>(
      "/listings/sale",
      { ...params }
    );
    return Array.isArray(res) ? res : res.listings ?? [];
  }

  /**
   * GET /properties?city=&state=&limit=&offset= — BULK area query.
   *
   * Returns up to 500 complete property records in a single request
   * (`limit` caps at 500; `offset` paginates). Each record carries
   * characteristics, assessor ID, legal description, last sale, multi-year
   * tax assessments and property taxes, transaction history, and owner
   * details including `owner.type`, `owner.mailingAddress` and
   * `ownerOccupied`.
   *
   * RentCast's licence permits sublicensure, display, resale and
   * distribution of this data to third parties, which is why the corpus
   * built from this endpoint is the ONLY property data the app renders in
   * investor-facing views.
   */
  async properties(params: BulkPropertiesParams): Promise<RentCastPropertyRecord[]> {
    const res = await this.request<RentCastPropertyRecord[] | { properties: RentCastPropertyRecord[] }>(
      "/properties",
      {
        city: params.city,
        state: params.state,
        zipCode: params.zipCode,
        propertyType: params.propertyType,
        limit: Math.min(params.limit ?? 500, 500),
        offset: params.offset ?? 0,
      }
    );
    return Array.isArray(res) ? res : (res.properties ?? []);
  }

  /** Paginate a bulk area query up to `max` records, 500 at a time. */
  async allProperties(
    params: Omit<BulkPropertiesParams, "limit" | "offset">,
    max = 500
  ): Promise<RentCastPropertyRecord[]> {
    const out: RentCastPropertyRecord[] = [];
    for (let offset = 0; out.length < max; offset += 500) {
      const page = await this.properties({ ...params, limit: 500, offset });
      out.push(...page);
      if (page.length < 500) break;
    }
    return out.slice(0, max);
  }

  /**
   * GET /markets?zipCode=&dataType=&historyRange= — market aggregates with a
   * historical trend series, used for the Deal Analyzer sparkline.
   */
  async marketHistory(
    zip: string,
    dataType: "Sale" | "Rental" | "All" = "Sale",
    historyRange = 12
  ): Promise<RentCastMarketResponse> {
    return this.request<RentCastMarketResponse>("/markets", {
      zipCode: zip,
      dataType,
      historyRange,
    });
  }

  /** GET /listings/sale?city=&state=&daysOld= — new listings in the last N days. */
  async newSaleListings(params: {
    city?: string;
    state?: string;
    zipCode?: string;
    daysOld?: number;
    limit?: number;
  }): Promise<RentCastListing[]> {
    const res = await this.request<RentCastListing[] | { listings: RentCastListing[] }>(
      "/listings/sale",
      { ...params, status: "Active" }
    );
    return Array.isArray(res) ? res : (res.listings ?? []);
  }

  /** GET /properties/random?limit= — random sample, useful for smoke tests. */
  async randomProperties(limit = 25): Promise<RentCastPropertyRecord[]> {
    const res = await this.request<RentCastPropertyRecord[]>("/properties/random", { limit });
    return Array.isArray(res) ? res : [];
  }

  /** GET /listings/rental/long-term — active long-term rental listings. */
  async rentalListings(params: RentalListingsParams): Promise<RentCastListing[]> {
    const res = await this.request<RentCastListing[] | { listings: RentCastListing[] }>(
      "/listings/rental/long-term",
      { ...params }
    );
    return Array.isArray(res) ? res : res.listings ?? [];
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "<no body>";
  }
}
