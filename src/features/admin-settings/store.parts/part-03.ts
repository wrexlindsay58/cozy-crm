import { flags, dealers, discounts, rebates, extraCosts, productTypes, makers, utilities, taskCats, stages, workflows, forms, crews, positions, points, buckets, plans, salesforce, departments, myTeam, calFilters, goals, installers, sections, qualify, notifyTemplates, reduction, pins } from "./part-01";
import { dealership } from "./part-02";

export function pack() {
  return {
    flags, dealers, discounts, rebates, extraCosts, productTypes, makers, utilities,
    taskCats, stages, workflows, forms, crews, positions, points, buckets, plans, salesforce,
    departments, myTeam, calFilters, goals, installers, sections, qualify, notifyTemplates, reduction, pins, dealership,
  };
}
