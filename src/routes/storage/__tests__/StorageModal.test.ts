import { importActivities } from "../../../data/__testutils__/storageUtils";
import moment from "moment/moment";
import { renderApp } from "../../../__testutils__/app";
import { userEvent } from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { storageModal } from "../__testutils__/storageModalTestUtils";
import path from "path";

describe("StorageModal", () => {
  describe("import", () => {
    it("clears the old data", async () => {
      await importActivities([
        {
          id: "1",
          name: "Test",
          intervals: [{ id: "1", start: moment() }],
        },
      ]);

      renderApp();
      await waitFor(async () =>
        expect(await screen.findByText("Test")).toBeVisible(),
      );

      await userEvent.click(
        await screen.findByRole("button", { name: "menu" }),
      );
      await userEvent.click(
        await screen.findByRole("button", { name: "Storage" }),
      );
      await storageModal.userEvent.importFile(
        path.join(__dirname, "exported-activities.json"),
      );
      await userEvent.click(
        await screen.findByRole("button", { name: "back" }),
      );
      expect(screen.queryByText("Test")).not.toBeInTheDocument();
    });
  });
});
