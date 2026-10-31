import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBackButtonClose } from "../backButton";

describe("useBackButtonClose", () => {
  let pushSpy: ReturnType<typeof vi.spyOn>;
  let backSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    pushSpy = vi.spyOn(window.history, "pushState");
    backSpy = vi.spyOn(window.history, "back").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState(null, "");
  });

  it("does nothing while closed", () => {
    const onClose = vi.fn();
    renderHook(() => useBackButtonClose(false, onClose));

    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("pushes a history entry when opened", () => {
    const onClose = vi.fn();
    renderHook(() => useBackButtonClose(true, onClose));

    expect(pushSpy).toHaveBeenCalledTimes(1);
  });

  it("calls onClose on popstate while open", () => {
    const onClose = vi.fn();
    renderHook(() => useBackButtonClose(true, onClose));

    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("removes its history entry when closed without back navigation", () => {
    const onClose = vi.fn();
    const { rerender } = renderHook(
      ({ open }) => useBackButtonClose(open, onClose),
      { initialProps: { open: true } },
    );
    window.history.replaceState({ backButtonOverlay: true }, "");

    rerender({ open: false });

    expect(backSpy).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not call history.back when the entry is already gone (popstate)", () => {
    const onClose = vi.fn();
    const { rerender } = renderHook(
      ({ open }) => useBackButtonClose(open, onClose),
      { initialProps: { open: true } },
    );
    window.history.replaceState(null, "");

    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    rerender({ open: false });

    expect(backSpy).not.toHaveBeenCalled();
  });

  it("removes the popstate listener on unmount", () => {
    const onClose = vi.fn();
    const { unmount } = renderHook(() => useBackButtonClose(true, onClose));

    unmount();
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});
