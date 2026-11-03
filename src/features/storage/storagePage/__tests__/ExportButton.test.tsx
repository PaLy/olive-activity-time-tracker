import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { saveAs } from "file-saver";
import { ExportButton } from "../ExportButton";
import { exportDB } from "../../../../db/exportImport";
import { useAppSnackbarStore } from "../../../../components/AppSnackbarStore";

vi.mock("file-saver", () => ({ saveAs: vi.fn() }));
vi.mock("../../../../db/exportImport", () => ({ exportDB: vi.fn() }));

describe("ExportButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete window.Android;
    useAppSnackbarStore.setState({ open: false, message: "" });
    vi.mocked(exportDB).mockResolvedValue(
      new Blob(["{}"], { type: "application/json" }),
    );
  });

  it("downloads the exported data in the browser", async () => {
    render(<ExportButton />);

    await userEvent.click(screen.getByRole("button", { name: /export/i }));

    await waitFor(() => expect(saveAs).toHaveBeenCalledTimes(1));
    expect(vi.mocked(saveAs).mock.calls[0][1]).toMatch(
      /^activities_\d{12}\.json$/,
    );
  });

  it("shows an error when the export fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    vi.mocked(exportDB).mockRejectedValueOnce(new Error("export failed"));

    render(<ExportButton />);

    await userEvent.click(screen.getByRole("button", { name: /export/i }));

    await waitFor(() =>
      expect(useAppSnackbarStore.getState().message).toBe(
        "Failed to export data.",
      ),
    );
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
