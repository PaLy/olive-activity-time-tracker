import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDialog } from "../dialog";

describe("useDialog", () => {
  beforeEach(() => {
    // Mock window.history methods
    vi.spyOn(window.history, "pushState").mockImplementation(() => {});
    vi.spyOn(window.history, "back").mockImplementation(() => {});
    vi.spyOn(window, "addEventListener").mockImplementation(() => {});
    vi.spyOn(window, "removeEventListener").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with open = false", () => {
    const { result } = renderHook(() => useDialog());

    expect(result.current.open).toBe(false);
  });

  it("onOpen sets open to true and pushes history state", () => {
    const { result } = renderHook(() => useDialog());

    act(() => {
      result.current.onOpen();
    });

    expect(result.current.open).toBe(true);
    expect(window.history.pushState).toHaveBeenCalledWith(
      { dialogOpen: true },
      "",
      null,
    );
  });

  it("onClose sets open to false", () => {
    const { result } = renderHook(() => useDialog());

    act(() => {
      result.current.onOpen();
    });
    expect(result.current.open).toBe(true);

    act(() => {
      result.current.onClose();
    });

    expect(result.current.open).toBe(false);
  });

  it("onClose calls history.back when dialogOpen state exists", () => {
    // Mock history.state
    Object.defineProperty(window.history, "state", {
      value: { dialogOpen: true },
      writable: true,
    });

    const { result } = renderHook(() => useDialog());

    act(() => {
      result.current.onClose();
    });

    expect(window.history.back).toHaveBeenCalled();
  });

  it("onClose does not call history.back when dialogOpen state does not exist", () => {
    // Mock history.state without dialogOpen
    Object.defineProperty(window.history, "state", {
      value: {},
      writable: true,
    });

    const { result } = renderHook(() => useDialog());

    act(() => {
      result.current.onClose();
    });

    expect(window.history.back).not.toHaveBeenCalled();
  });

  it("onClose does not call history.back when history.state is null", () => {
    // Mock history.state as null
    Object.defineProperty(window.history, "state", {
      value: null,
      writable: true,
    });

    const { result } = renderHook(() => useDialog());

    act(() => {
      result.current.onClose();
    });

    expect(window.history.back).not.toHaveBeenCalled();
  });

  it("registers and cleans up popstate event listener", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useDialog());

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "popstate",
      expect.any(Function),
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "popstate",
      expect.any(Function),
    );
  });

  it("handles popstate event when dialog is open", () => {
    // Don't mock addEventListener/removeEventListener for this test
    vi.restoreAllMocks();
    vi.spyOn(window.history, "pushState").mockImplementation(() => {});
    vi.spyOn(window.history, "back").mockImplementation(() => {});

    const { result } = renderHook(() => useDialog());

    act(() => {
      result.current.onOpen();
    });
    expect(result.current.open).toBe(true);

    // Simulate popstate event
    act(() => {
      window.dispatchEvent(new Event("popstate"));
    });

    expect(result.current.open).toBe(false);
  });

  it("does not close dialog on popstate when dialog is already closed", () => {
    const { result } = renderHook(() => useDialog());

    expect(result.current.open).toBe(false);

    // Simulate popstate event
    act(() => {
      const popstateEvent = new Event("popstate");
      window.dispatchEvent(popstateEvent);
    });

    expect(result.current.open).toBe(false);
  });
});
