import { describe, expect, it, beforeEach } from "vitest";
import { cached, clearCache } from "../lib/lightning/cache";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("cached()", () => {
  beforeEach(() => clearCache());

  it("returns fresh data on first call", async () => {
    const res = await cached("k1", 1000, async () => 42);
    expect(res.data).toBe(42);
    expect(res.stale).toBe(false);
    expect(res.fetchedAt).toBeGreaterThan(0);
  });

  it("serves cache within TTL without calling fetcher again", async () => {
    let calls = 0;
    const fetcher = async () => ++calls;
    await cached("k2", 1000, fetcher);
    const second = await cached("k2", 1000, fetcher);
    expect(calls).toBe(1);
    expect(second.data).toBe(1);
    expect(second.stale).toBe(false);
  });

  it("refetches after TTL expiry", async () => {
    let calls = 0;
    const fetcher = async () => ++calls;
    await cached("k3", 50, fetcher);
    await sleep(70);
    const res = await cached("k3", 50, fetcher);
    expect(calls).toBe(2);
    expect(res.data).toBe(2);
  });

  it("returns stale cached value when upstream fails after expiry", async () => {
    await cached("k4", 50, async () => "good");
    await sleep(70);
    const res = await cached("k4", 50, async () => {
      throw new Error("upstream down");
    });
    expect(res.data).toBe("good");
    expect(res.stale).toBe(true);
  });

  it("throws when upstream fails and nothing is cached", async () => {
    await expect(
      cached("k5", 1000, async () => {
        throw new Error("down");
      }),
    ).rejects.toThrow("down");
  });

  it("keeps fetchedAt of the original fetch when stale", async () => {
    const first = await cached("k6", 50, async () => "v1");
    await sleep(70);
    const second = await cached("k6", 50, async () => {
      throw new Error("down");
    });
    expect(second.fetchedAt).toBe(first.fetchedAt);
    expect(second.stale).toBe(true);
  });
});
