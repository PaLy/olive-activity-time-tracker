import { screen, waitFor, within } from "@testing-library/react";
import { expect } from "vitest";
import { userEvent } from "@testing-library/user-event";

export const activityItem = {
  find: {
    durationText: async () =>
      (await screen.findByTestId("activity-duration")).textContent,

    startButton: async (activityID: number) =>
      within(
        await screen.findByTestId(`activity-item-${activityID}`),
      ).getByRole("button", { name: "start activity" }),
    stopButton: async (activityID: number) =>
      within(
        await screen.findByTestId(`activity-item-${activityID}`),
      ).getByRole("button", { name: "stop activity" }),

    tickingDurationText: async () => {
      const initialText = await activityItem.find.durationText();

      return waitFor(async () => {
        const durationText = await activityItem.find.durationText();
        expect(durationText).not.toBe(initialText);
        return durationText;
      });
    },
  },
  userEvent: {
    start: async (activityID: number) =>
      userEvent.click(await activityItem.find.startButton(activityID)),
    stop: async (activityID: number) =>
      userEvent.click(await activityItem.find.stopButton(activityID)),
  },
};
