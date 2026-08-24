import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  parseCoingeckoPrices,
  parseHistory,
  parseLightningStats,
  parseMempoolPrices,
  parseRankings,
} from "../lib/lightning/mempool";

const fixture = (name: string): unknown =>
  JSON.parse(
    readFileSync(path.join(__dirname, "fixtures", name), "utf8"),
  );

describe("parseLightningStats", () => {
  it("parses the real mempool.space fixture", () => {
    const stats = parseLightningStats(fixture("statistics.json"));
    expect(stats.nodeCount).toBeGreaterThan(10_000);
    expect(stats.channelCount).toBeGreaterThan(20_000);
    expect(stats.totalCapacity).toBeGreaterThan(1e11);
    expect(stats.avgFeeRate).toBeGreaterThan(0);
  });

  it("rejects garbage", () => {
    expect(() => parseLightningStats({})).toThrow();
    expect(() => parseLightningStats(null)).toThrow();
  });
});

describe("parseRankings", () => {
  it("parses the real connectivity fixture", () => {
    const nodes = parseRankings(fixture("rankings_connectivity.json"));
    expect(nodes.length).toBe(100);
    const acinq = nodes[0];
    expect(acinq.alias).toBe("ACINQ");
    expect(acinq.channels).toBeGreaterThan(1000);
    expect(acinq.isoCode).toBe("US");
    expect(acinq.countryEn).toBe("United States");
  });

  it("handles string capacities and missing geo", () => {
    const nodes = parseRankings([
      { publicKey: "abc", alias: "x", channels: 1, capacity: "12345", iso_code: null, country: null },
    ]);
    expect(nodes[0].capacity).toBe(12345);
    expect(nodes[0].isoCode).toBeNull();
  });

  it("rejects entries without publicKey", () => {
    expect(() => parseRankings([{ alias: "x", channels: 1, capacity: 1 }])).toThrow();
  });
});

describe("parseHistory", () => {
  it("parses a weekly series", () => {
    const points = parseHistory([
      { added: 1787184000, channel_count: 33101, total_capacity: 375019291916 },
      { added: 1787097600, channel_count: 33128, total_capacity: 377262723018 },
    ]);
    expect(points).toHaveLength(2);
    expect(points[0].channelCount).toBe(33101);
  });

  it("rejects an empty array", () => {
    expect(() => parseHistory([])).toThrow();
  });
});

describe("price parsers", () => {
  it("parses the mempool fixture", () => {
    const prices = parseMempoolPrices(fixture("prices.json"));
    expect(prices.USD).toBeGreaterThan(1000);
    expect(prices.EUR).toBeGreaterThan(1000);
  });

  it("parses the coingecko shape", () => {
    const prices = parseCoingeckoPrices({ bitcoin: { usd: 79000, eur: 67000 } });
    expect(prices.USD).toBe(79000);
  });

  it("rejects a broken coingecko payload", () => {
    expect(() => parseCoingeckoPrices({})).toThrow();
  });
});
