import { screen, waitFor } from "@testing-library/react";

export const activityItem = {
  find: {
    durationText: async () =>
      (await screen.findByTestId("activity-duration")).textContent,

    startButton: () => screen.findByRole("button", { name: "start activity" }),
    stopButton: () => screen.findByRole("button", { name: "stop activity" }),

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
    start: async () => (await activityItem.find.startButton()).click(),
    stop: async () => (await activityItem.find.stopButton()).click(),
  },
};
