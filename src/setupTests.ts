// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/vitest";
import { enableMapSet } from "immer";
import { configure } from "@testing-library/react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
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
  await db.delete();
  await db.open();
});

window.Android = {
  export: vi.fn(),
  hasNotificationPermission() {
    return true;
  },
  requestNotificationPermission() {
    return "requested";
  },
  updateNotification() {
    return "ok";
  },
  stopNotification() {
    return "ok";
  },
};

afterEach(() => {
  vi.clearAllMocks();
});

// Store original console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeEach(() => {
  // Mock console methods to fail tests when called
  console.error = vi.fn((message, ...args) => {
    originalConsoleError(message, ...args);
    throw new Error(`Test failed: console.error was called`);
  });

  console.warn = vi.fn((message, ...args) => {
    originalConsoleWarn(message, ...args);
    throw new Error(`Test failed: console.warn was called`);
  });

  console.log = vi.fn((message, ...args) => {
    originalConsoleLog(message, ...args);
    throw new Error(`Test failed: console.log was called`);
  });
});

afterEach(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});
