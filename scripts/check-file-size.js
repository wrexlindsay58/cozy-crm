import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const CAP = 150;
const CODE = /\.(?:ts|tsx|js|jsx|mjs|cjs|css)$/;

function stagedFiles() {
  const out = execSync("git diff --cached --name-only --diff-filter=ACM", {
    encoding: "utf8",
  });
  return out
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function lineCount(text) {
  if (!text) return 0;
  const newlines = text.match(/\n/g);
  return newlines ? newlines.length : 0;
}

const tooLong = [];

for (const file of stagedFiles()) {
  if (file.endsWith(".gen.ts")) continue;
  if (!CODE.test(file)) continue;
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const lines = lineCount(text);
  if (lines > CAP) tooLong.push(`${file} (${lines} lines)`);
}

if (tooLong.length) {
  console.error(`Staged files must be ${CAP} lines or fewer (*.gen.ts is exempt):`);
  for (const line of tooLong) console.error(`  ${line}`);
  process.exit(1);
}
