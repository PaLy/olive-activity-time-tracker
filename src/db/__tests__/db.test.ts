import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { OliveDB, useDbAutoclose } from "../db";

describe("OliveDB", () => {
  it("creates database with correct name", () => {
    const db = new OliveDB();
    expect(db.name).toBe("Olive");
  });

  it("has activities table", () => {
    const db = new OliveDB();
    expect(db.activities).toBeDefined();
  });

  it("has intervals table", () => {
    const db = new OliveDB();
    expect(db.intervals).toBeDefined();
  });

  it("has settings table", () => {
    const db = new OliveDB();
    expect(db.settings).toBeDefined();
  });

  it("has correct version", () => {
    const db = new OliveDB();
    expect(db.verno).toBeGreaterThanOrEqual(2);
  });

  it("database has all required tables", () => {
    const db = new OliveDB();
    expect(db.activities).toBeDefined();
    expect(db.intervals).toBeDefined();
    expect(db.settings).toBeDefined();
  });

  it("tables are mapped to classes", () => {
    const db = new OliveDB();
    expect(typeof db.activities).toBe("object");
    expect(typeof db.intervals).toBe("object");
    expect(typeof db.settings).toBe("object");
  });
});

describe("useDbAutoclose", () => {
  beforeEach(() => {
    vi.spyOn(document, "addEventListener");
    vi.spyOn(document, "removeEventListener");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registers visibilitychange event listener", () => {
    renderHook(() => useDbAutoclose());

    expect(document.addEventListener).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );
  });

  it("removes visibilitychange event listener on unmount", () => {
    const { unmount } = renderHook(() => useDbAutoclose());

    unmount();

    expect(document.removeEventListener).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );
  });

  it("useDbAutoclose is a function that returns undefined", () => {
    expect(useDbAutoclose).toBeDefined();
    expect(typeof useDbAutoclose).toBe("function");
  });

  it("hook sets up event listener on render", () => {
    const { result } = renderHook(() => useDbAutoclose());
    expect(result.current).toBeUndefined();
    expect(document.addEventListener).toHaveBeenCalled();
  });

  it("hook cleans up event listener on unmount", () => {
    const { unmount } = renderHook(() => useDbAutoclose());

    unmount();

    expect(document.removeEventListener).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );
  });

  it("closes database when visibility changes to hidden", () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Restore real event listeners for this test
    vi.restoreAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});

    const { unmount } = renderHook(() => useDbAutoclose());

    Object.defineProperty(document, "visibilityState", {
      value: "hidden",
      writable: true,
      configurable: true,
    });

    document.dispatchEvent(new Event("visibilitychange"));

    expect(consoleLogSpy).toHaveBeenCalledWith("Dexie database closed.");

    // Reset visibility state
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      writable: true,
      configurable: true,
    });

    consoleLogSpy.mockRestore();
    unmount();
  });

  it("does not close database when visibility is not hidden", () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    vi.restoreAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});

    const { unmount } = renderHook(() => useDbAutoclose());

    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      writable: true,
      configurable: true,
    });

    document.dispatchEvent(new Event("visibilitychange"));

    expect(consoleLogSpy).not.toHaveBeenCalled();

    consoleLogSpy.mockRestore();
    unmount();
  });
});
