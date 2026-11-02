import { beforeEach, describe, expect, it } from "vitest";
import { Message } from "console-feed/lib/definitions/Component";
import { useDebugStore } from "../DebugStore";

const message = (id: number) =>
  ({
    id,
    method: "log",
    data: [`message ${id}`],
  }) as unknown as Message;

describe("DebugStore", () => {
  beforeEach(() => {
    useDebugStore.getState().clearLogs();
  });

  it("starts empty", () => {
    expect(useDebugStore.getState().logs).toEqual([]);
    expect(useDebugStore.getState().totalLogs).toBe(0);
  });

  it("appends logs and counts the total", () => {
    useDebugStore.getState().addLog(message(1));
    useDebugStore.getState().addLog(message(2));

    expect(useDebugStore.getState().logs).toHaveLength(2);
    expect(useDebugStore.getState().totalLogs).toBe(2);
    expect(useDebugStore.getState().logs[0]).toEqual(message(1));
  });

  it("keeps only the last 1000 logs", () => {
    for (let id = 0; id < 1005; id++) {
      useDebugStore.getState().addLog(message(id));
    }

    const { logs, totalLogs } = useDebugStore.getState();
    expect(logs).toHaveLength(1000);
    expect(logs[0]).toEqual(message(5));
    expect(logs[999]).toEqual(message(1004));
    expect(totalLogs).toBe(1005);
  });

  it("clears the logs and the total", () => {
    useDebugStore.getState().addLog(message(1));
    useDebugStore.getState().clearLogs();

    expect(useDebugStore.getState().logs).toEqual([]);
    expect(useDebugStore.getState().totalLogs).toBe(0);
  });
});
