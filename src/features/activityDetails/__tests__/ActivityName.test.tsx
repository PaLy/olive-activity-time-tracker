import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ActivityName } from "../ActivityName";
import { Activity } from "../../../db/entities";

const activities = new Map<number, Activity>([
  [
    1,
    {
      id: 1,
      name: "Parent",
      parentId: -1,
      expanded: 1,
      notificationsEnabled: 1,
    } as unknown as Activity,
  ],
  [
    2,
    {
      id: 2,
      name: "Child",
      parentId: 1,
      expanded: 0,
      notificationsEnabled: 1,
    } as unknown as Activity,
  ],
]);

const parentOptions = [
  { id: -1, fullName: "Root" },
  { id: 1, fullName: "Parent" },
];

const defaultProps = () => ({
  activityId: 2,
  activities,
  editMode: false,
  name: "Child",
  parentId: 1,
  parentOptions,
  validationError: "",
  onEditStart: vi.fn(),
  onNameChange: vi.fn(),
  onParentChange: vi.fn(),
  onSave: vi.fn(),
  onCancel: vi.fn(),
});

describe("ActivityName", () => {
  it("shows the full activity name and starts editing", async () => {
    const props = defaultProps();
    render(<ActivityName {...props} />);

    expect(screen.getByText("Parent / Child")).toBeVisible();
    await userEvent.click(
      screen.getByRole("button", { name: "edit activity" }),
    );

    expect(props.onEditStart).toHaveBeenCalledTimes(1);
  });

  it("shows the editor in edit mode", () => {
    const props = defaultProps();
    render(<ActivityName {...props} editMode={true} />);

    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Child");
    expect(screen.getByRole("combobox", { name: "Parent" })).toBeVisible();
  });

  it("propagates the typed name after a debounce", async () => {
    const props = defaultProps();
    render(<ActivityName {...props} editMode={true} />);

    await userEvent.clear(screen.getByRole("textbox", { name: "Name" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Name" }), "New");

    await waitFor(() => expect(props.onNameChange).toHaveBeenCalledWith("New"));
    // the debounce only reports the last value
    expect(props.onNameChange).toHaveBeenLastCalledWith("New");
  });

  it("saves the latest local name when clicking save", async () => {
    const props = defaultProps();
    render(<ActivityName {...props} editMode={true} />);

    const input = screen.getByRole("textbox", { name: "Name" });
    await userEvent.clear(input);
    await userEvent.type(input, "Renamed");
    await userEvent.click(
      screen.getByRole("button", { name: "save activity" }),
    );

    expect(props.onSave).toHaveBeenCalledWith("Renamed");
  });

  it("saves on Enter", async () => {
    const props = defaultProps();
    render(<ActivityName {...props} editMode={true} />);

    const input = screen.getByRole("textbox", { name: "Name" });
    await userEvent.clear(input);
    await userEvent.type(input, "Entered{Enter}");

    expect(props.onSave).toHaveBeenCalledWith("Entered");
  });

  it("cancels on Escape", async () => {
    const props = defaultProps();
    render(<ActivityName {...props} editMode={true} />);

    await userEvent.type(
      screen.getByRole("textbox", { name: "Name" }),
      "{Escape}",
    );

    expect(props.onCancel).toHaveBeenCalledTimes(1);
    expect(props.onSave).not.toHaveBeenCalled();
  });

  it("cancels when clicking cancel", async () => {
    const props = defaultProps();
    render(<ActivityName {...props} editMode={true} />);

    await userEvent.click(screen.getByRole("button", { name: "cancel edit" }));

    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  it("shows the validation error", () => {
    const props = defaultProps();
    render(
      <ActivityName
        {...props}
        editMode={true}
        validationError="Activity name cannot be empty"
      />,
    );

    expect(screen.getByText("Activity name cannot be empty")).toBeVisible();
  });

  it("changes the parent", async () => {
    const props = defaultProps();
    render(<ActivityName {...props} editMode={true} />);

    await userEvent.click(screen.getByRole("combobox", { name: "Parent" }));
    await userEvent.click(await screen.findByRole("option", { name: "Root" }));

    expect(props.onParentChange).toHaveBeenCalledWith(-1);
  });

  it("hides the parent picker when the parent is unknown", () => {
    const props = defaultProps();
    render(<ActivityName {...props} editMode={true} parentId={99} />);

    expect(
      screen.queryByRole("combobox", { name: "Parent" }),
    ).not.toBeInTheDocument();
  });

  it("clears the pending debounce on unmount", async () => {
    const props = defaultProps();
    const { unmount } = render(<ActivityName {...props} editMode={true} />);

    await userEvent.type(screen.getByRole("textbox", { name: "Name" }), "abc");
    unmount();

    // The unmount cleanup clears the timeout, so nothing is reported later.
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(props.onNameChange).not.toHaveBeenCalled();
  });
});
