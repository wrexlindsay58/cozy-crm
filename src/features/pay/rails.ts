export const PAY_RAILS = ["stripe", "goodleap"] as const;
export type PayRail = (typeof PAY_RAILS)[number];

export const RAIL_LABEL: Record<PayRail, string> = {
  stripe: "Stripe",
  goodleap: "GoodLeap",
};
