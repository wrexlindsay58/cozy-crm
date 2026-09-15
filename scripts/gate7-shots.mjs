#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:8080";
const OUT = "/workspace/.design/cozy-daily/shots";
const WIDTHS = [375, 768, 1280, 1440];
const PAGES = [
  { name: "today", path: "/" },
  { name: "book", path: "/calendar" },
  { name: "map", path: "/dispatch" },
  { name: "inbox", path: "/conversations" },
  { name: "sales", path: "/scoreboard" },
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const notes = [];

async function shot(page, name, width) {
  await page.setViewportSize({ width, height: width >= 1280 ? 900 : 812 });
  await page.waitForTimeout(width === 1440 && name === "map" ? 2500 : 800);
  const clip = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
    title: document.querySelector("h1")?.textContent ?? "",
  }));
  const clipFail = clip.sw > clip.cw + 2;
  notes.push({ name, width, title: clip.title.trim(), clip: clipFail ? "FAIL" : "pass", scrollWidth: clip.sw, clientWidth: clip.cw });
  await page.screenshot({ path: `${OUT}/${name}-${width}-fold.png`, fullPage: false });
  await page.screenshot({ path: `${OUT}/${name}-${width}.png`, fullPage: true });
}

const page = await browser.newPage();
for (const width of WIDTHS) {
  for (const p of PAGES) {
    await page.goto(`${BASE}${p.path}`, { waitUntil: "networkidle", timeout: 30000 });
    await shot(page, p.name, width);
  }
}

// Click path
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
const elena = page.getByRole("link", { name: "Elena Vargas" }).first();
await elena.click();
await page.waitForURL(/\/leads\/L-4821/);
const leadOk = page.url().includes("/leads/L-4821");
await page.locator("main").getByRole("link", { name: "Book" }).click();
await page.waitForURL(/\/calendar/);
const bookOk = page.url().includes("/calendar");
await page.locator('a[href="/dispatch"]').first().click();
await page.waitForURL(/\/dispatch/);
const mapOk = page.url().includes("/dispatch");
await page.locator('a[href="/conversations"]').first().click();
await page.waitForURL(/\/conversations/);
const inboxOk = page.url().includes("/conversations");
notes.push({ clickPath: { leadOk, bookOk, mapOk, inboxOk } });

writeFileSync(`${OUT}/notes.json`, JSON.stringify(notes, null, 2));
await browser.close();
console.log(JSON.stringify(notes, null, 2));
