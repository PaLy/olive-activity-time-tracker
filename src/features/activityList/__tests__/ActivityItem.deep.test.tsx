import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import dayjs from "../../../utils/dayjs";
import { db } from "../../../db/db";
import { renderApp } from "../../../utils/__testutils__/app";

vi.mock("../../../components/ResizableList", async () => {
  const React = await import("react");
  return {
    ResizableList: ({
      rowData,
    }: {
      rowData: Array<{
        RowComponent: React.ElementType;
        rowProps: Record<string, unknown>;
      }>;
    }) => (
      <div>
        {rowData.map(({ RowComponent, rowProps }, index) =>
          React.createElement(RowComponent, { key: index, ...rowProps }),
        )}
      </div>
    ),
  };
});

describe("ActivityItem deep nesting", () => {
  it("shows the path below the maximum indentation depth", async () => {
    await db.activities.bulkAdd([
      { name: "A", parentId: -1, expanded: 1, notificationsEnabled: 1 },
      { name: "B", parentId: 1, expanded: 1, notificationsEnabled: 1 },
      { name: "C", parentId: 2, expanded: 1, notificationsEnabled: 1 },
      { name: "D", parentId: 3, expanded: 1, notificationsEnabled: 1 },
      { name: "E", parentId: 4, expanded: 1, notificationsEnabled: 1 },
      { name: "F", parentId: 5, expanded: 1, notificationsEnabled: 1 },
      { name: "G", parentId: 6, expanded: 1, notificationsEnabled: 1 },
    ]);
    await db.intervals.bulkAdd(
      [1, 2, 3, 4, 5, 6, 7].map((activityId) => ({
        activityId,
        start: +dayjs().subtract(1, "hour"),
        end: Date.now(),
      })),
    );

    renderApp();

    expect(await screen.findByText("E / F")).toBeInTheDocument();
    expect(await screen.findByText("E / F / G")).toBeInTheDocument();
  });
});
