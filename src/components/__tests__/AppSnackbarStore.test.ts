import { beforeEach, describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useAppSnackbarStore,
  useOpenErrorSnackbar,
  openErrorSnackbar,
  openSuccessSnackbar,
} from "../AppSnackbarStore";

describe("AppSnackbarStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppSnackbarStore.setState({
      open: false,
      message: "",
      severity: undefined,
    });
  });

  describe("useAppSnackbarStore", () => {
    it("initializes with correct default state", () => {
      const { result } = renderHook(() => useAppSnackbarStore());

      expect(result.current.open).toBe(false);
      expect(result.current.message).toBe("");
      expect(result.current.severity).toBeUndefined();
    });

    it("reset() clears state", () => {
      const { result } = renderHook(() => useAppSnackbarStore());

      // Set some state
      act(() => {
        result.current.openSuccess("Test message");
      });

      expect(result.current.open).toBe(true);
      expect(result.current.message).toBe("Test message");
      expect(result.current.severity).toBe("success");

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.open).toBe(false);
      expect(result.current.message).toBe("");
    });

    it("close() closes snackbar", () => {
      const { result } = renderHook(() => useAppSnackbarStore());

      act(() => {
        result.current.openSuccess("Test message");
      });
      expect(result.current.open).toBe(true);

      act(() => {
        result.current.close();
      });
      expect(result.current.open).toBe(false);
    });

    it("openError() with string", () => {
      const { result } = renderHook(() => useAppSnackbarStore());

      act(() => {
        result.current.openError("Test error");
      });

      expect(result.current.open).toBe(true);
      expect(result.current.message).toBe("Test error");
      expect(result.current.severity).toBe("error");
    });

    it("openError() with Error object", () => {
      const { result } = renderHook(() => useAppSnackbarStore());

      const error = new Error("Test error message");
      act(() => {
        result.current.openError(error);
      });

      expect(result.current.open).toBe(true);
      expect(result.current.message).toBe("Test error message");
      expect(result.current.severity).toBe("error");
    });

    it("openSuccess() sets success message", () => {
      const { result } = renderHook(() => useAppSnackbarStore());

      act(() => {
        result.current.openSuccess("Success message");
      });

      expect(result.current.open).toBe(true);
      expect(result.current.message).toBe("Success message");
      expect(result.current.severity).toBe("success");
    });
  });

  describe("useOpenErrorSnackbar", () => {
    it("opens error snackbar when error is provided", () => {
      renderHook(() => useOpenErrorSnackbar("Test error"));

      expect(useAppSnackbarStore.getState().open).toBe(true);
      expect(useAppSnackbarStore.getState().message).toBe("Test error");
      expect(useAppSnackbarStore.getState().severity).toBe("error");
    });

    it("opens error snackbar when Error object is provided", () => {
      const error = new Error("Error message");
      renderHook(() => useOpenErrorSnackbar(error));

      expect(useAppSnackbarStore.getState().open).toBe(true);
      expect(useAppSnackbarStore.getState().message).toBe("Error message");
      expect(useAppSnackbarStore.getState().severity).toBe("error");
    });

    it("does not open snackbar when error is null", () => {
      renderHook(() => useOpenErrorSnackbar(null));

      expect(useAppSnackbarStore.getState().open).toBe(false);
    });
  });

  describe("openErrorSnackbar", () => {
    it("opens error snackbar with string", () => {
      openErrorSnackbar("Direct error");

      expect(useAppSnackbarStore.getState().open).toBe(true);
      expect(useAppSnackbarStore.getState().message).toBe("Direct error");
      expect(useAppSnackbarStore.getState().severity).toBe("error");
    });

    it("opens error snackbar with Error object", () => {
      const error = new Error("Direct error message");
      openErrorSnackbar(error);

      expect(useAppSnackbarStore.getState().open).toBe(true);
      expect(useAppSnackbarStore.getState().message).toBe(
        "Direct error message",
      );
      expect(useAppSnackbarStore.getState().severity).toBe("error");
    });
  });

  describe("openSuccessSnackbar", () => {
    it("opens success snackbar", () => {
      openSuccessSnackbar("Direct success");

      expect(useAppSnackbarStore.getState().open).toBe(true);
      expect(useAppSnackbarStore.getState().message).toBe("Direct success");
      expect(useAppSnackbarStore.getState().severity).toBe("success");
    });
  });
});
