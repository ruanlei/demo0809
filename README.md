# The Lantern Room

A local-first browser puzzle built with Next.js, React Three Fiber and Zustand. Find the brass key, speak to the caretaker and open the door.

## Run locally

Use Node.js 22.12+ (Node.js 24 recommended) and npm.

```sh
npm install
npm run dev
```

Open http://localhost:3000. Drag to orbit and scroll or pinch to zoom. Click the key, caretaker or door in the room, or use the corresponding keyboard-accessible buttons. The buttons remain available without WebGL. Reload to reset the room.

## Verify

```sh
npm run typecheck
npm run test
npx playwright install chromium
npm run test:e2e
npm run build
```

On Linux, use `npx playwright install --with-deps chromium` if browser system dependencies are missing. In an environment with a compatible system Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable to use it instead of the bundled browser.

Day 1 uses one room, in-memory progress and fixed dialogue. It requires no credentials or external services at runtime.
