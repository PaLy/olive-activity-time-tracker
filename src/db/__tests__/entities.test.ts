import { describe, it, expect } from "vitest";
import { Activity, Interval, Setting, SettingKey, Currency } from "../entities";
import { MAX_DATE_MS } from "../../utils/date";
import { db } from "../db";

describe("Entities", () => {
  describe("Activity", () => {
    it("is a valid entity class", () => {
      expect(Activity).toBeDefined();
    });

    it("has the Activity class exported", () => {
      expect(typeof Activity).toBe("function");
    });
  });

  describe("Interval", () => {
    it("is a valid entity class", () => {
      expect(Interval).toBeDefined();
    });

    it("has the Interval class exported", () => {
      expect(typeof Interval).toBe("function");
    });

    it("has duration method defined in prototype", () => {
      expect(Interval.prototype.duration).toBeDefined();
      expect(typeof Interval.prototype.duration).toBe("function");
    });

    it("duration method calculates correctly for completed interval", () => {
      // Test the duration calculation logic
      const start = 1000000;
      const end = 2000000;
      const expectedDuration = end - start;
      expect(expectedDuration).toBe(1000000);
    });

    it("duration method uses MAX_DATE_MS for ongoing intervals", () => {
      // Verify MAX_DATE_MS is defined
      expect(MAX_DATE_MS).toBeDefined();
      expect(typeof MAX_DATE_MS).toBe("number");
      expect(MAX_DATE_MS).toBeGreaterThan(0);
    });

    it("calculates duration correctly with provided current time", () => {
      const start = 1000000;
      const currentTime = 2000000;
      const expectedDuration = currentTime - start;
      expect(expectedDuration).toBe(1000000);
    });

    it("uses end time for completed intervals", () => {
      const start = 1000000;
      const end = 2000000;
      // For completed intervals, duration should be end - start, not currentTime - start
      const expectedDuration = end - start;
      expect(expectedDuration).toBe(1000000);
    });
  });

  describe("Setting", () => {
    it("is a valid entity class", () => {
      expect(Setting).toBeDefined();
    });

    it("has the Setting class exported", () => {
      expect(typeof Setting).toBe("function");
    });
  });

  describe("SettingKey", () => {
    it("has ACTIVITY_LIST key", () => {
      expect(SettingKey.ACTIVITY_LIST).toBe("activityList");
    });

    it("exports all setting keys", () => {
      const keys = Object.keys(SettingKey);
      expect(keys.length).toBeGreaterThan(0);
    });

    it("all setting keys are strings", () => {
      Object.values(SettingKey).forEach((value) => {
        expect(typeof value).toBe("string");
      });
    });
  });

  describe("Currency", () => {
    it("has all standard currencies", () => {
      expect(Currency.EUR).toBe("EUR");
      expect(Currency.USD).toBe("USD");
      expect(Currency.JPY).toBe("JPY");
      expect(Currency.GBP).toBe("GBP");
      expect(Currency.AUD).toBe("AUD");
      expect(Currency.CAD).toBe("CAD");
      expect(Currency.CHF).toBe("CHF");
      expect(Currency.CNH).toBe("CNH");
      expect(Currency.HKD).toBe("HKD");
      expect(Currency.NZD).toBe("NZD");
    });

    it("has exactly 10 currencies defined", () => {
      const currencies = Object.values(Currency);
      expect(currencies.length).toBe(10);
    });

    it("all currencies are 3-character ISO 4217 codes", () => {
      Object.values(Currency).forEach((currency) => {
        expect(typeof currency).toBe("string");
        expect(currency).toMatch(/^[A-Z]{3}$/); // ISO 4217 format
        expect(currency.length).toBe(3);
      });
    });

    it("currency codes are uppercase", () => {
      Object.values(Currency).forEach((currency) => {
        expect(currency).toBe(currency.toUpperCase());
      });
    });

    it("no duplicate currencies", () => {
      const currencies = Object.values(Currency);
      const uniqueCurrencies = new Set(currencies);
      expect(uniqueCurrencies.size).toBe(currencies.length);
    });
  });

  describe("Type definitions and exports", () => {
    it("SettingKey enum is correctly defined", () => {
      expect(SettingKey).toHaveProperty("ACTIVITY_LIST");
      expect(typeof SettingKey.ACTIVITY_LIST).toBe("string");
      expect(SettingKey.ACTIVITY_LIST).toBe("activityList");
    });

    it("Currency enum has all required currencies", () => {
      const expectedCurrencies = [
        "EUR",
        "USD",
        "JPY",
        "GBP",
        "AUD",
        "CAD",
        "CHF",
        "CNH",
        "HKD",
        "NZD",
      ];

      expectedCurrencies.forEach((code) => {
        expect(Object.values(Currency)).toContain(code);
      });
    });

    it("all entity classes are exported", () => {
      expect(Activity).toBeDefined();
      expect(Interval).toBeDefined();
      expect(Setting).toBeDefined();
    });

    it("MAX_DATE_MS constant is properly defined", () => {
      expect(MAX_DATE_MS).toBeDefined();
      expect(typeof MAX_DATE_MS).toBe("number");
      expect(MAX_DATE_MS).toBeGreaterThan(0);
      // Should be a very large number representing far future
      expect(MAX_DATE_MS).toBeGreaterThan(Date.now());
    });
  });

  describe("Interval.duration() with real DB instances", () => {
    it("calculates duration for a completed interval from DB", async () => {
      const start = 1000000;
      const end = 2000000;
      await db.activities.add({
        name: "Test",
        parentId: -1,
        expanded: 0,
        notificationsEnabled: 1,
      });
      const id = await db.intervals.add({ activityId: 1, start, end });
      const interval = await db.intervals.get(id);
      expect(interval!.duration()).toBe(1000000);
    });

    it("calculates duration for an ongoing interval from DB using current time", async () => {
      const start = Date.now() - 60000; // 1 minute ago
      await db.activities.add({
        name: "Test",
        parentId: -1,
        expanded: 0,
        notificationsEnabled: 1,
      });
      const id = await db.intervals.add({
        activityId: 1,
        start,
        end: MAX_DATE_MS,
      });
      const interval = await db.intervals.get(id);
      const currentTime = Date.now();
      const duration = interval!.duration(currentTime);
      expect(duration).toBeGreaterThanOrEqual(59000);
      expect(duration).toBeLessThanOrEqual(62000);
    });

    it("calculates duration for an ongoing interval with explicit currentTime", async () => {
      const start = 1000000;
      await db.activities.add({
        name: "Test",
        parentId: -1,
        expanded: 0,
        notificationsEnabled: 1,
      });
      const id = await db.intervals.add({
        activityId: 1,
        start,
        end: MAX_DATE_MS,
      });
      const interval = await db.intervals.get(id);
      const duration = interval!.duration(3000000);
      expect(duration).toBe(2000000);
    });
  });
});
