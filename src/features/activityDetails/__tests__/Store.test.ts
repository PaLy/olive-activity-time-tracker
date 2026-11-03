import { beforeEach, describe, expect, it } from "vitest";
import { useActivityStore } from "../Store";

describe("useActivityStore", () => {
  beforeEach(() => {
    useActivityStore.setState({ deleteIntervalConfirmationData: undefined });
  });

  it("opens and closes the delete interval confirmation", () => {
    expect(useActivityStore.getState().isDeleteIntervalConfirmationOpen()).toBe(
      false,
    );

    useActivityStore.getState().openDeleteIntervalConfirmation(42);
    expect(useActivityStore.getState().isDeleteIntervalConfirmationOpen()).toBe(
      true,
    );
    expect(useActivityStore.getState().deleteIntervalConfirmationData).toEqual({
      intervalId: 42,
    });

    useActivityStore.getState().closeDeleteIntervalConfirmation();
    expect(useActivityStore.getState().isDeleteIntervalConfirmationOpen()).toBe(
      false,
    );
  });
});
