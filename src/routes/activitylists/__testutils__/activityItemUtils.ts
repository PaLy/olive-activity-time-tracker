import { screen, waitFor, within } from "@testing-library/react";

export const activityItem = {
  find: {
    durationText: async () =>
      (await screen.findByTestId("activity-duration")).textContent,

    startButton: async (activityID: string) =>
      within(
        await screen.findByTestId(`activity-item-${activityID}`),
      ).getByRole("button", { name: "start activity" }),
    stopButton: async (activityID: string) =>
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
    start: async (activityID: string) =>
      (await activityItem.find.startButton(activityID)).click(),
    stop: async (activityID: string) =>
      (await activityItem.find.stopButton(activityID)).click(),
  },
};
