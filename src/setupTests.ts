// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/vitest";
import { enableMapSet } from "immer";
import { activityStore } from "./data/activity/Storage";
import { intervalStore } from "./data/interval/Storage";
import { activityInListExpandedStore } from "./data/activity/ActivityInListExpanded";
import { settingsStore } from "./data/settings/Settings";
import { configure } from "@testing-library/react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  expect,
  MockInstance,
  vi,
} from "vitest";
import mediaQuery from "css-mediaquery";
import { db } from "./db/db";

dayjs.extend(duration);

enableMapSet();

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

vi.mock("react-virtualized-auto-sizer");

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

function createMatchMedia(width: unknown) {
  return (query: string) => ({
    matches: mediaQuery.match(query, {
      width,
    }),
    addEventListener: () => {},
    removeEventListener: () => {},
  });
}

beforeAll(() => {
  // @ts-expect-error just a mock
  window.matchMedia = createMatchMedia(window.innerWidth);
});

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

let consoleErrorSpy: MockInstance;
let consoleWarnSpy: MockInstance;
let consoleLogSpy: MockInstance;

beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
});

beforeEach(async () => {
  await db.delete();
  await db.open();
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  expect(consoleWarnSpy).not.toHaveBeenCalled();
  expect(consoleLogSpy).not.toHaveBeenCalled();
});
