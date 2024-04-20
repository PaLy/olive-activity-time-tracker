import { screen, waitFor } from "@testing-library/react";

export const activityItemUtils = {
  find: {
    durationText: async () =>
      (await screen.findByTestId("activity-duration")).textContent,

    tickingDurationText: async () => {
      const initialText = await activityItemUtils.find.durationText();

      return waitFor(async () => {
        const durationText = await activityItemUtils.find.durationText();
        expect(durationText).not.toBe(initialText);
        return durationText;
      });
    },
  },
};
