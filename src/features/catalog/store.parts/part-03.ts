export const __rows2 = [
{
      sku: "ducts",
      label: "New ducts",
      sell: 4200,
      cost: 1600,
      kind: "product",
      active: true,
      choices: [
        {
          id: "scope",
          label: "Scope",
          picks: [
            { id: "supply", label: "Supply runs", sell: 2800 },
            { id: "return", label: "Return", sell: 1800 },
            { id: "full", label: "Full system", sell: 4200 },
          ],
        },
        {
          id: "material",
          label: "Material",
          picks: [
            { id: "flex", label: "Flex", delta: 0 },
            { id: "board", label: "Duct board", delta: 600 },
            { id: "metal", label: "Metal trunk", delta: 1800 },
          ],
        },
        {
          id: "wrap",
          label: "New insulation",
          picks: [
            { id: "r6", label: "R-6", delta: 0 },
            { id: "r8", label: "R-8", delta: 400 },
          ],
        },
      ],
    },
{ sku: "pad", label: "New pad", sell: 450, cost: 120, kind: "adder", parent: "hvac", active: true },
{ sku: "disconnect", label: "Disconnect / whip", sell: 280, cost: 70, kind: "adder", parent: "hvac", active: true },
{ sku: "baffles", label: "Baffles", sell: 380, cost: 90, kind: "adder", parent: "attic-r49", active: true },
{
      sku: "windows",
      label: "Windows",
      sell: 14800,
      cost: 7200,
      kind: "product",
      active: true,
      choices: [
        {
          id: "type",
          label: "Type",
          picks: [
            { id: "dual", label: "Dual pane vinyl, single hung", sell: 14800 },
            { id: "dual-slider", label: "Dual pane vinyl, slider", sell: 14200 },
            { id: "triple", label: "Triple pane, single hung", sell: 18600 },
            { id: "retro", label: "Retrofit insert", sell: 12200 },
          ],
        },
      ],
    },
{ sku: "disc-vet", label: "Veteran", sell: -500, cost: 0, kind: "discount", active: true },
{ sku: "disc-aps", label: "APS rebate", sell: -300, cost: 0, kind: "discount", rebate: true, rebateWhen: "after", active: true },
{ sku: "disc-oncor", label: "Oncor rebate", sell: -400, cost: 0, kind: "discount", rebate: true, rebateWhen: "after", active: true },
{ sku: "disc-10", label: "10% off", sell: 0, cost: 0, kind: "discount", pct: 10, active: true },
];
