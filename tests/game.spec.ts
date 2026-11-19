import { expect, test } from '@playwright/test';
import { PerspectiveCamera, Vector3 } from 'three';

test('opens the room door after collecting the key and talking to the caretaker', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  const controls = page.getByRole('region', { name: 'Game controls' });
  const status = controls.getByRole('status');

  await controls.getByRole('button', { name: 'Try door' }).click();
  await expect(status).toHaveText('The door is locked. Find the key first.');
  await expect(controls.getByText('Locked', { exact: true })).toBeVisible();

  const key = controls.getByRole('button', { name: 'Collect key' });
  await key.click();
  await expect(controls.getByText('Brass key', { exact: true })).toBeVisible();
  await expect(key).toBeDisabled();

  await controls.getByRole('button', { name: 'Talk to caretaker' }).click();
  const dialogue = page.getByRole('region', { name: 'Caretaker dialogue' });
  await expect(dialogue).toContainText('That brass key fits the door.');
  await dialogue.getByRole('button', { name: 'Close dialogue' }).click();
  await expect(dialogue).toHaveCount(0);

  await controls.getByRole('button', { name: 'Try door' }).click();
  await expect(controls.getByText('Open', { exact: true })).toBeVisible();
  await expect(status).toHaveText('The door is open. You solved the puzzle!');
  expect(errors).toEqual([]);
});

test('keeps the game playable without WebGL', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, options?: unknown) {
      if (type === 'webgl' || type === 'webgl2') return null;
      return Reflect.apply(getContext, this, [type, options]);
    } as typeof getContext;
  });
  await page.goto('/');
  await expect(page.getByText('3D rendering is unavailable.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Collect key' }).click();
  await page.getByRole('button', { name: 'Try door' }).click();
  await expect(page.getByRole('status')).toContainText('You solved the puzzle!');
});


test('scene objects dispatch interactions and the room can orbit', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  if (!box) throw new Error('The room canvas has no bounds');

  const camera = new PerspectiveCamera(46, box.width / box.height, .1, 1000);
  camera.position.set(8, 7, 10);
  camera.lookAt(0, .65, 0);
  camera.updateMatrixWorld();

  // Project the centers of the visible meshes into the actual canvas size.
  const clickObject = async (point: Vector3) => {
    point.project(camera);
    await page.mouse.click(box.x + (point.x + 1) * box.width / 2, box.y + (1 - point.y) * box.height / 2);
  };

  await clickObject(new Vector3(1.89, 1.51, -2.54));
  await expect(page.getByRole('status')).toContainText('The door is locked.');
  await clickObject(new Vector3(.715, .75, .85));
  await expect(page.getByRole('status')).toContainText('You picked up the brass key.');
  await clickObject(new Vector3(-2.4, 1.45, -.65));
  const dialogue = page.getByRole('region', { name: 'Caretaker dialogue' });
  await expect(dialogue).toBeVisible();
  await dialogue.getByRole('button', { name: 'Close dialogue' }).click();
  await clickObject(new Vector3(1.89, 1.51, -2.54));
  await expect(page.getByRole('status')).toContainText('You solved the puzzle!');

  const before = await canvas.screenshot();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 80, box.y + box.height / 2, { steps: 10 });
  await page.mouse.up();
  await expect.poll(async () => (await canvas.screenshot()).equals(before)).toBe(false);
});
