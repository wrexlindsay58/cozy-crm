import { expect, test } from "playwright/test";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/tickets", { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Actions" }).waitFor();
});

test("j and k move the action card, and a status move is 44px", async ({ page }) => {
  const pause = page.getByRole("button", { name: "Pause", exact: true }).first();
  await pause.waitFor();
  const box = await pause.boundingBox();
  expect(box?.height).toBe(44);
  expect(box?.width).toBe(44);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  const active = page.locator("[data-row-active]");
  await expect(active).toHaveCount(1);
  const first = await active.getAttribute("data-action-id");
  await page.keyboard.press("j");
  await expect(page).toHaveURL(/\/tickets\/.+/);
  const second = await page.locator("[data-row-active]").getAttribute("data-action-id");
  expect(second).toBeTruthy();
  expect(second).not.toBe(first);
  await page.keyboard.press("k");
  await expect(page.locator("[data-row-active]")).toHaveAttribute("data-action-id", first ?? "");
});

test("an empty action filter can show all or start a ticket", async ({ page }) => {
  await page.getByRole("textbox", { name: "Search actions" }).fill("zzzz-no-such-action");
  await expect(page.getByText("Nothing in this filter.")).toBeVisible();
  const create = page.getByRole("button", { name: "New ticket" });
  await expect(create).toBeVisible();
  const createBox = await create.boundingBox();
  expect(createBox?.height).toBe(44);
  await page.getByRole("button", { name: "Show all" }).click();
  await expect(page.locator("[data-row-active]")).toHaveCount(1);
});