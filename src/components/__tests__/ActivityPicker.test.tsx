import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ActivityPicker } from "../ActivityPicker";

const options = [
  { id: -1, fullName: "Root" },
  { id: 1, fullName: "Work" },
  { id: 2, fullName: "Work / Code Review" },
];

describe("ActivityPicker", () => {
  it("shows the selected activity", () => {
    render(
      <ActivityPicker
        options={options}
        selected={options[1]}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("combobox", { name: "Activity" })).toHaveValue(
      "Work",
    );
  });

  it("calls onChange with the selected activity id", async () => {
    const onChange = vi.fn();
    render(
      <ActivityPicker
        options={options}
        selected={options[1]}
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole("combobox", { name: "Activity" }));
    await userEvent.click(
      await screen.findByRole("option", { name: "Work / Code Review" }),
    );

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("supports a custom label", () => {
    render(
      <ActivityPicker
        options={options}
        selected={options[0]}
        onChange={vi.fn()}
        label="Parent"
      />,
    );

    expect(screen.getByRole("combobox", { name: "Parent" })).toBeVisible();
  });
});
