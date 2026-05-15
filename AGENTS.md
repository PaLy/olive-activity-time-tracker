# AGENTS.md

## Big Picture
- `src/index.tsx` boots a hash-router app (`createHashRouter`) and enables Immer Map/Set support; routes come from `src/router/router.tsx`.
- The app is a local-first time tracker: UI reads/writes IndexedDB via Dexie (`src/db/db.ts`), not HTTP APIs.
- Primary flow is `UI (features/*)` -> `db/queries/*` -> Dexie tables (`activities`, `intervals`, `settings`).
- Activity hierarchy is modeled with `parentId` and synthetic root `id = -1` (see `getActivitiesTree` in `src/db/queries/activitiesTree.ts`).

## Data + Domain Conventions
- In-progress intervals use sentinel `MAX_DATE_MS` (`src/utils/date.ts`) instead of `null` end times.
- Query modules encapsulate business rules inside Dexie transactions (example: `addActivity` in `src/db/queries/addActivity.ts` also expands ancestors and stops ancestor timers).
- `notificationsEnabled` is stored as `1 | 0` in DB entities (`src/db/entities.ts`), not boolean.
- Duration calculations must account for overlapping intervals and in-progress intervals (see `getDuration` in `src/db/queries/activitiesTree.ts`).

## Routing + UI Patterns
- Always import navigation hooks from `src/router/hooks.ts` (ESLint blocks direct `useNavigate`/`useLocation` imports from `react-router`).
- Many screens are route-driven modals: open state is derived from path suffix checks like `pathname.endsWith("/storage")` (`StorageModal`, `SettingsModal`, `AddActivityModal`).
- Navigation often uses history semantics (`navigate(-1)`) for closing modals/drawer; `useNavigate` wrapper provides safe fallback to `/`.
- Large lists use `react-window` via `src/components/ResizableList.tsx` and preserve scroll by pathname using `ScrollMemoryContext`.

## State Management
- Zustand stores are feature-local (examples: `AddActivity/Store.ts`, `ActivityListFilterStore.ts`, `AppSnackbarStore.ts`).
- Reactive DB reads use `useLiveQuery` from `dexie-react-hooks`; errors are usually caught inline and reported via snackbar.
- Time-sensitive UI relies on global clock store (`src/utils/clock.ts`) ticking every second; FLIP animations freeze/unfreeze clock in `ActivityList.tsx`.

## Android Integration Boundary
- Android bridge is optional and accessed through `window.Android` (typed in `src/features/android/interface.ts`).
- Storage export and notifications branch on `window.Android` availability (`ExportButton.tsx`, `AndroidNotificationService.ts`).
- Notification updates are fed by DB query `getInProgressActivitiesNotificationData` and auto-refresh every 30s (`useInProgressActivitiesNotifications.ts`).

## Dev Workflows (from package.json)
- Dev server: `npm start`
- Test watch: `npm test`; coverage run: `npm run test-coverage`
- Production build: `npm run build`
- GitHub Pages flow: `npm run predeploy-to-gh` then `npm run deploy-to-gh`
- Android web assets sync: `npm run predeploy-to-android` then `npm run deploy-to-android`
- No dedicated lint script; lint/type checks run through `vite-plugin-checker` during non-test Vite runs (`vite.config.ts`).

## Testing Gotchas
- Test setup (`src/setupTests.ts`) resets Dexie before each test and stubs browser APIs (`ResizeObserver`, `matchMedia`, `window.Android`).
- Any `console.error`, `console.warn`, or `console.log` in tests fails the test by design (overridden in `setupTests.ts`).
- Integration-style UI tests use `renderApp` helper (`src/utils/__testutils__/app.tsx`) with memory router + test theme.

## Existing AI Guidance Sources
- Only `README.md` exists from the requested AI-guidance glob; it contains project link/badges but no coding conventions.

