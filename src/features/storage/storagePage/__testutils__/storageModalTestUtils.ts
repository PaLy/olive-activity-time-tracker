import { readFileSync } from "fs";
import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, vi } from "vitest";

export const storageModal = {
  userEvent: {
    importFile: async (filepath: string) => {
      const fileText = readFile(filepath);
      const file = new File([new Blob([fileText])], "activities.json", {
        type: "text/json",
      });
      File.prototype.text = vi.fn().mockResolvedValueOnce(fileText);

      const input = await screen
        .findByRole("button", { name: "Import" })
        .then(
          (button) =>
            button.querySelector('input[type="file"]')! as HTMLInputElement,
        );

      await userEvent.upload(input, file);
      expect(
        await screen.findByText("Data successfully imported."),
      ).toBeVisible();
    },
  },
};

const readFile = (path: string) => readFileSync(path).toString();
