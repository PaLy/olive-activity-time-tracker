import { describe, expect, it, beforeEach } from "vitest";
import { useCreateActivityStore } from "../Store";
import { act } from "@testing-library/react";
import dayjs from "../../../utils/dayjs";
import {
  AddActivityData,
  AddActivityDataActivity,
} from "../../../db/queries/getAddActivityData";

describe("useCreateActivityStore", () => {
  beforeEach(() => {
    act(() => {
      useCreateActivityStore.getState().reset();
    });
  });

  describe("checkValid", () => {
    it("returns false and sets nameError when nameToggle is 'new' and name is empty", () => {
      const store = useCreateActivityStore.getState();
      store.setNameToggle("new");
      store.setName("");
      const result = store.checkValid();
      expect(result).toBe(false);
      expect(useCreateActivityStore.getState().nameError).toBe(
        "Cannot be empty",
      );
    });

    it("returns false and sets existingActivityError when nameToggle is 'existing' and no activity selected", () => {
      const store = useCreateActivityStore.getState();
      store.setNameToggle("existing");
      store.setExistingActivity(null);
      const result = store.checkValid();
      expect(result).toBe(false);
      expect(useCreateActivityStore.getState().existingActivityError).toBe(
        "Cannot be empty",
      );
    });

    it("returns true when nameToggle is 'new' and name is set", () => {
      const store = useCreateActivityStore.getState();
      store.setNameToggle("new");
      store.setName("Test Activity");
      const result = store.checkValid();
      expect(result).toBe(true);
    });

    it("returns true when nameToggle is 'existing' and activity is selected", () => {
      const store = useCreateActivityStore.getState();
      store.setNameToggle("existing");
      store.setExistingActivity({
        id: 1,
        name: "Test",
      } as AddActivityDataActivity);
      const result = store.checkValid();
      expect(result).toBe(true);
    });

    it("returns false when there is a startTimeError", () => {
      const store = useCreateActivityStore.getState();
      store.setNameToggle("new");
      store.setName("Test");
      store.setStartTimeError("Some error");
      const result = store.checkValid();
      expect(result).toBe(false);
    });

    it("returns false when there is an endTimeError", () => {
      const store = useCreateActivityStore.getState();
      store.setNameToggle("new");
      store.setName("Test");
      store.setEndTimeError("Some error");
      const result = store.checkValid();
      expect(result).toBe(false);
    });
  });

  describe("getStartTime", () => {
    it("returns dialogOpenedTime when intervalToggle is 'now'", () => {
      const store = useCreateActivityStore.getState();
      store.init();
      store.setIntervalToggle("now");
      const startTime = useCreateActivityStore.getState().getStartTime();
      // dialogOpenedTime is set during init(), should be close to now
      expect(startTime.diff(dayjs(), "second")).toBeLessThan(2);
    });

    it("returns startTimeInput when intervalToggle is 'earlier'", () => {
      const store = useCreateActivityStore.getState();
      store.init();
      const customTime = dayjs().subtract(2, "hours");
      store.setStartTimeInput(customTime);
      store.setIntervalToggle("earlier");
      const startTime = useCreateActivityStore.getState().getStartTime();
      expect(startTime.isSame(customTime)).toBe(true);
    });

    it("returns startTimeInput when intervalToggle is 'finished'", () => {
      const store = useCreateActivityStore.getState();
      store.init();
      const customTime = dayjs().subtract(3, "hours");
      store.setStartTimeInput(customTime);
      store.setIntervalToggle("finished");
      const startTime = useCreateActivityStore.getState().getStartTime();
      expect(startTime.isSame(customTime)).toBe(true);
    });
  });

  describe("getEndTime", () => {
    it("returns undefined when intervalToggle is 'now'", () => {
      const store = useCreateActivityStore.getState();
      store.setIntervalToggle("now");
      const endTime = store.getEndTime();
      expect(endTime).toBeUndefined();
    });

    it("returns undefined when intervalToggle is 'earlier'", () => {
      const store = useCreateActivityStore.getState();
      store.setIntervalToggle("earlier");
      const endTime = store.getEndTime();
      expect(endTime).toBeUndefined();
    });

    it("returns endTimeInput when intervalToggle is 'finished'", () => {
      const store = useCreateActivityStore.getState();
      const customEnd = dayjs().subtract(30, "minutes");
      store.setEndTimeInput(customEnd);
      store.setIntervalToggle("finished");
      const endTime = useCreateActivityStore.getState().getEndTime();
      expect(endTime?.isSame(customEnd)).toBe(true);
    });
  });

  describe("getParentId", () => {
    it("returns -1 when no parent activity is set", () => {
      const store = useCreateActivityStore.getState();
      expect(store.getParentId()).toBe(-1);
    });

    it("returns parent activity id when set", () => {
      const store = useCreateActivityStore.getState();
      store.setParentActivity({
        id: 42,
        name: "Parent",
      } as AddActivityDataActivity);
      expect(useCreateActivityStore.getState().getParentId()).toBe(42);
    });
  });

  describe("isFinished", () => {
    it("returns false when intervalToggle is 'now'", () => {
      const store = useCreateActivityStore.getState();
      store.setIntervalToggle("now");
      expect(store.isFinished()).toBe(false);
    });

    it("returns true when intervalToggle is 'finished'", () => {
      const store = useCreateActivityStore.getState();
      store.setIntervalToggle("finished");
      expect(useCreateActivityStore.getState().isFinished()).toBe(true);
    });
  });

  describe("getAnyActivityLogged", () => {
    it("returns false when addActivityData is undefined", () => {
      const store = useCreateActivityStore.getState();
      expect(store.getAnyActivityLogged()).toBe(false);
    });

    it("returns false when activities map has only root", () => {
      const store = useCreateActivityStore.getState();
      const activities = new Map();
      activities.set(-1, { id: -1, name: "root" });
      store.setAddActivityData({ activities } as AddActivityData);
      expect(useCreateActivityStore.getState().getAnyActivityLogged()).toBe(
        false,
      );
    });

    it("returns true when activities map has more than root", () => {
      const store = useCreateActivityStore.getState();
      const activities = new Map();
      activities.set(-1, { id: -1, name: "root" });
      activities.set(1, { id: 1, name: "Test" });
      store.setAddActivityData({ activities } as AddActivityData);
      expect(useCreateActivityStore.getState().getAnyActivityLogged()).toBe(
        true,
      );
    });
  });

  describe("init", () => {
    it("sets nameToggle to 'existing' when activities exist", () => {
      const store = useCreateActivityStore.getState();
      const activities = new Map();
      activities.set(-1, { id: -1, name: "root" });
      activities.set(1, { id: 1, name: "Test" });
      store.setAddActivityData({ activities } as AddActivityData);

      act(() => {
        useCreateActivityStore.getState().init();
      });

      expect(useCreateActivityStore.getState().nameToggle).toBe("existing");
    });

    it("sets nameToggle to 'new' when no activities exist", () => {
      // Ensure no addActivityData from prior tests
      act(() => {
        useCreateActivityStore.getState().reset();
        useCreateActivityStore.setState({ addActivityData: undefined });
      });
      act(() => {
        useCreateActivityStore.getState().init();
      });
      expect(useCreateActivityStore.getState().nameToggle).toBe("new");
    });

    it("marks as initialized", () => {
      act(() => {
        useCreateActivityStore.getState().init();
      });
      expect(useCreateActivityStore.getState().isInitialized()).toBe(true);
    });
  });

  describe("reset", () => {
    it("resets all state", () => {
      const store = useCreateActivityStore.getState();
      store.setName("test");
      store.setIntervalToggle("finished");
      store.init();

      act(() => {
        useCreateActivityStore.getState().reset();
      });

      const state = useCreateActivityStore.getState();
      expect(state.name).toBe("");
      expect(state.intervalToggle).toBe("now");
      expect(state.isInitialized()).toBe(false);
    });
  });

  describe("setters", () => {
    it("setValidationsOff", () => {
      const store = useCreateActivityStore.getState();
      store.setValidationsOff(true);
      expect(useCreateActivityStore.getState().validationsOff).toBe(true);
    });

    it("setStartTimeError", () => {
      const store = useCreateActivityStore.getState();
      store.setStartTimeError("error");
      expect(useCreateActivityStore.getState().startTimeError).toBe("error");
    });

    it("setEndTimeError", () => {
      const store = useCreateActivityStore.getState();
      store.setEndTimeError("error");
      expect(useCreateActivityStore.getState().endTimeError).toBe("error");
    });
  });
});
