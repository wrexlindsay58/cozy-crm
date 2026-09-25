import { profileById } from "./profiles";
import type { JobFile } from "./types";

function cat(jobLine: { categoryId: string }) {
  return profileById(jobLine.categoryId)?.id ?? jobLine.categoryId;
}

export function qualityKeys(job: JobFile) {
  const products = job.scope.filter((s) => s.kind === "product");
  const keys: string[] = [];
  if (products.some((s) => cat(s) === "attic" || cat(s) === "air-seal")) keys.push("blower");
  if (products.some((s) => cat(s) === "ducts")) keys.push("duct");
  products.forEach((s) => {
    const id = cat(s);
    if (id === "attic" || id === "hvac" || id === "ducts" || id === "windows") keys.push(s.id);
  });
  return keys;
}

export function qualityDone(job: JobFile) {
  const keys = qualityKeys(job);
  if (!keys.length) return true;
  return keys.every((key) => {
    const result = job.testOut.results?.[key];
    if (result === "pass") return true;
    if (result !== "fail") return false;
    const fix = job.testOut.fixes?.[key];
    return Boolean(fix?.ticketId) || Boolean(fix?.correctedByQc);
  });
}
