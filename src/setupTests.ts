// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { enableMapSet } from "immer";
import failOnConsole from "jest-fail-on-console";
import { activityStore } from "./data/activity/Storage";
import { intervalStore } from "./data/interval/Storage";
import { activityInListExpandedStore } from "./data/activity/ActivityInListExpanded";
import { settingsStore } from "./data/settings/Settings";
import { configure } from "@testing-library/react";

enableMapSet();
failOnConsole();

jest.setTimeout(10000);
jest.retryTimes(2);
configure({ asyncUtilTimeout: 3000 });

const noop = () => {};
Object.defineProperty(window, "scrollTo", { value: noop, writable: true });

const originalOffsetHeight = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "offsetHeight",
)!;
const originalOffsetWidth = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "offsetWidth",
)!;

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    value: 50,
  });
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    value: 50,
  });
});

afterAll(() => {
  Object.defineProperty(
    HTMLElement.prototype,
    "offsetHeight",
    originalOffsetHeight,
  );
  Object.defineProperty(
    HTMLElement.prototype,
    "offsetWidth",
    originalOffsetWidth,
  );
});

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

beforeEach(async () => {
  await Promise.allSettled(
    [
      activityStore,
      intervalStore,
      activityInListExpandedStore,
      settingsStore,
    ].map((it) => it.clear()),
  );
});
