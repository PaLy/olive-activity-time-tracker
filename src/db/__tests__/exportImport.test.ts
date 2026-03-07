import { describe, it, expect, vi } from "vitest";
import { exportDB, importDB, clearDB } from "../exportImport";
import * as dbModule from "../db";

// Mock the db module
vi.mock("../db", () => ({
  db: {
    export: vi.fn(),
    delete: vi.fn(),
    open: vi.fn(),
    intervals: {
      name: "intervals",
    },
  },
}));

// Mock dexie-export-import
vi.mock("dexie-export-import", () => ({
  importDB: vi.fn(),
}));

describe("exportImport", () => {
  describe("exportDB", () => {
    it("calls db.export with correct options", async () => {
      const mockExport = vi.fn().mockResolvedValue("exported-data");
      (dbModule.db.export as ReturnType<typeof vi.fn>) = mockExport;

      await exportDB();

      expect(mockExport).toHaveBeenCalledWith({
        prettyJson: true,
        transform: expect.any(Function),
      });
    });

    it("exports database successfully", async () => {
      const mockExport = vi.fn().mockResolvedValue("exported-data");
      (dbModule.db.export as ReturnType<typeof vi.fn>) = mockExport;

      const result = await exportDB();

      expect(result).toBe("exported-data");
      expect(mockExport).toHaveBeenCalled();
    });
  });

  describe("clearDB", () => {
    it("deletes and reopens database", async () => {
      const mockDelete = vi.fn().mockResolvedValue(undefined);
      const mockOpen = vi.fn().mockResolvedValue(undefined);
      (dbModule.db.delete as ReturnType<typeof vi.fn>) = mockDelete;
      (dbModule.db.open as ReturnType<typeof vi.fn>) = mockOpen;

      await clearDB();

      expect(mockDelete).toHaveBeenCalled();
      expect(mockOpen).toHaveBeenCalled();
    });

    it("calls delete before open", async () => {
      const callOrder: string[] = [];
      const mockDelete = vi.fn().mockImplementation(() => {
        callOrder.push("delete");
        return Promise.resolve();
      });
      const mockOpen = vi.fn().mockImplementation(() => {
        callOrder.push("open");
        return Promise.resolve();
      });
      (dbModule.db.delete as ReturnType<typeof vi.fn>) = mockDelete;
      (dbModule.db.open as ReturnType<typeof vi.fn>) = mockOpen;

      await clearDB();

      expect(callOrder).toEqual(["delete", "open"]);
    });
  });

  describe("importDB", () => {
    it("is a function", () => {
      expect(typeof importDB).toBe("function");
    });

    it("accepts a File parameter", () => {
      expect(importDB.length).toBe(1);
    });
  });
});
