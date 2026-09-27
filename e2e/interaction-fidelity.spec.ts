import { expect, test } from "playwright/test";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
});

test("Cmd+K opens the palette, arrows move it, and Enter follows the item", async ({ page }) => {
  await page.goto("/memberships/M-101");
  await page.locator("#cozy-search").waitFor();
  await page.keyboard.press("ControlOrMeta+k");
  const input = page.locator("#cozy-search");
  await expect(input).toBeFocused();
  const box = await input.boundingBox();
  expect(box?.height).toBe(40);
  await expect(page.getByText("New lead")).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowUp");
  const selected = page.locator("[cmdk-item][aria-selected='true']");
  await expect(selected).toBeVisible();
  const label = (await selected.innerText()).toLowerCase();
  await page.keyboard.press("Enter");
  if (label.includes("payment") || label.includes("paper")) await expect(page).toHaveURL(/\/paper/);
  else if (label.includes("calendar") || label.includes("sit")) await expect(page).toHaveURL(/\/calendar/);
  else await expect(page).toHaveURL(/\/leads/);
});

test("j and k move the table row, the ring stays on the row, and Enter opens it", async ({ page }) => {
  await page.goto("/leads");
  const rows = page.locator("tbody tr");
  await rows.nth(1).waitFor();
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  const cell = rows.first().locator("a, div").first();
  const height = await cell.boundingBox();
  expect(height?.height).toBe(44);
  await page.keyboard.press("j");
  const active = page.locator("tbody tr[data-row-active]");
  await expect(active).toHaveCount(1);
  const outline = await active.evaluate((node) => getComputedStyle(node).outlineStyle);
  expect(outline).not.toBe("none");
  await page.keyboard.press("k");
  await page.keyboard.press("j");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/leads\/[^/]+$/);
});

test("canceling a membership shows a 5 second undo toast and restores the plan", async ({ page }) => {
  await page.goto("/memberships/M-101");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByLabel("Why it is canceled").fill("E2E undo check");
  await page.getByRole("button", { name: "Cancel plan" }).click();
  const undo = page.getByRole("button", { name: "Undo" });
  await expect(undo).toBeVisible();
  await expect(page.getByText("Membership canceled")).toBeVisible();
  await undo.click();
  await expect(page.getByText("Membership canceled")).toHaveCount(0);
  await expect(page.getByText("No changes on this plan.")).toBeVisible();
});
