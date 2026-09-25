export type ProductStory = { benefits: string[]; solves: string; sow: string };

export const PRODUCT_STORY: Record<string, ProductStory> = {
  hvac: {
    benefits: ["Right-sized air in every room", "Lower bill once the old unit is gone", "Quiet nights"],
    solves: "A condenser at the end of its life, short-cycling and costing you comfort.",
    sow: "Pull the old system. Set the new condenser and air handler to the type, tonnage, and brand on the option. Charge, commission, and walk the thermostat with you.",
  },
  ducts: {
    benefits: ["Air to the rooms that starve", "Less dump in the attic", "Even temps"],
    solves: "Leaky trunks and boots dumping conditioned air in the attic.",
    sow: "Replace the trunks and runs called on the assessment. Seal boots. Test.",
  },
  pad: {
    benefits: ["Level pad, longer equipment life"],
    solves: "A cracked or undersized pad under the new condenser.",
    sow: "Set a new pad to spec under the condenser.",
  },
  disconnect: {
    benefits: ["Code-clean power to the unit"],
    solves: "Tired whip and disconnect on an old condenser.",
    sow: "New disconnect and whip. Tie in clean.",
  },
  "attic-r49": {
    benefits: ["The house holds heat and cold", "Quieter rooms", "Lower bill"],
    solves: "Thin, tired attic insulation that is not doing its job.",
    sow: "Air seal the hatch and penetrations. Blow cellulose to the depth on the option. Baffles where the assessment called them.",
  },
  removal: {
    benefits: ["Clean cavity, no buried problems"],
    solves: "Old, dirty, or wet insulation that should not stay.",
    sow: "Bag and haul the existing insulation. Leave the cavity ready for the new blow.",
  },
  "air-seal": {
    benefits: ["Stops the stack effect", "Holds the insulation you pay for"],
    solves: "Gaps at the hatch, cans, and plumbing that leak the house.",
    sow: "Seal the hatch, penetrations, and cans called on the assessment.",
  },
  aeroseal: {
    benefits: ["Ducts that deliver", "Comfort without a new system"],
    solves: "Leaky ductwork you can feel in the attic.",
    sow: "Prep, seal by the method on the option, and test leakage after.",
  },
  baffles: {
    benefits: ["Ventilation stays open after the blow"],
    solves: "Soffits that would get buried.",
    sow: "Install baffles at the eaves before we blow.",
  },
  windows: {
    benefits: ["Quiet street", "Holds the envelope"],
    solves: "Single-pane or tired vinyl dumping comfort.",
    sow: "Replace the openings on the count. Cap, foam, and trim.",
  },
};

export function storyFor(sku: string): ProductStory {
  return (
    PRODUCT_STORY[sku] ?? {
      benefits: ["Part of the scope on this house"],
      solves: "A gap the assessment called out.",
      sow: "Install as specified on the option.",
    }
  );
}
