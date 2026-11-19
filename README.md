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

## Day 2 caretaker

The caretaker uses a local VRM model, a subtle idle motion and a greeting that plays when dialogue opens. The original geometry appears while the model loads or if it fails. A missing greeting clip leaves the model and dialogue usable.

Both assets come from pixiv's [three-vrm examples at 3caf7a2](https://github.com/pixiv/three-vrm/tree/3caf7a21ee68f0d5dfa363ab3d577450bbf60136/packages). The model is pixiv Inc.'s `VRM1_Constraint_Twist_Sample.vrm` v1.0.1, distributed under its [embedded VRM 1.0 terms](https://vrm.dev/licenses/1.0/). The greeting is the example `test.vrma`, distributed with the [upstream MIT notice](public/models/three-vrm-LICENSE.txt). Both files are bundled locally, so play uses no third-party asset requests.
