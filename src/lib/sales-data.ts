export type RangeId = "ltd" | "ytd" | "qtd" | "mtd" | "wtd" | "day";
export type Mark = "go" | "watch" | "stop";
export type Split = { label: string; n: number; pct: number; tone: string; mark?: Mark };
export type Trend = { now: number; yest: number; goal: number; money?: boolean };
export type Bar = { label: string; now: number; prior: number; hot?: boolean };
export type MixRow = { name: string; amount: number };
export type Person = { name: string; why: string; amount: number; count: number };

const STEEL = "var(--color-idle)";
const WASH = "var(--color-line-strong)";
const MID = "var(--color-muted)";
const LIVE = "var(--color-navy)";

function pack(rows: { label: string; n: number; tone: string; mark?: Mark }[]): Split[] {
  const total = rows.reduce((s, r) => s + r.n, 0);
  return rows.map((r) => ({ ...r, pct: total ? Math.round((r.n / total) * 100) : 0 }));
}

export const ranges: { id: RangeId; label: string }[] = [
  { id: "ltd", label: "LTD" },
  { id: "ytd", label: "YTD" },
  { id: "qtd", label: "QTD" },
  { id: "mtd", label: "MTD" },
  { id: "wtd", label: "WTD" },
  { id: "day", label: "Day" },
];

export type SalesBoard = {
  id: RangeId;
  vs: string;
  sold: number;
  priorSold: number;
  goalSold: number;
  deals: number;
  priorDeals: number;
  goalDeals: number;
  close: number;
  priorClose: number;
  goalClose: number;
  avg: number;
  priorAvg: number;
  cancel: number;
  priorCancel: number;
  cashIn: number;
  priorCash: number;
  finance: number;
  card: number;
  leads: number;
  priorLeads: number;
  appts: number;
  priorAppts: number;
  runs: number;
  priorRuns: number;
  cancelledN: number;
  jobs: number;
  priorJobs: number;
  opps: number;
  sitsLeft?: number;
  mix: Split[];
  leadSplit: Split[];
  apptSplit: Split[];
  jobSplit: Split[];
  products: MixRow[];
  offices: MixRow[];
  funnel: { label: string; n: number; rate: string }[];
  bars: Bar[];
  barTitle: string;
  barHint: string;
  closers: Person[];
  setters: Person[];
  unmarked: number;
  nosit: number;
  missed: number;
  oneleg: number;
};

function board(partial: SalesBoard): SalesBoard {
  return partial;
}

export const boards: Record<RangeId, SalesBoard> = {
  ltd: board({
    id: "ltd",
    vs: "last year this time",
    sold: 14208400,
    priorSold: 9862100,
    goalSold: 15000000,
    deals: 986,
    priorDeals: 712,
    goalDeals: 1000,
    close: 36,
    priorClose: 34,
    goalClose: 38,
    avg: 14409,
    priorAvg: 13851,
    cancel: 412800,
    priorCancel: 388000,
    cashIn: 12840200,
    priorCash: 8914400,
    finance: 9841200,
    card: 2999200,
    leads: 6240,
    priorLeads: 4980,
    appts: 3122,
    priorAppts: 2488,
    runs: 2410,
    priorRuns: 1860,
    cancelledN: 94,
    jobs: 718,
    priorJobs: 502,
    opps: 268,
    mix: pack([
      { label: "Set", n: 618, tone: WASH },
      { label: "Ran", n: 1424, tone: STEEL },
      { label: "Sold", n: 986, tone: LIVE },
      { label: "Cancelled", n: 94, tone: WASH, mark: "stop" },
    ]),
    leadSplit: pack([
      { label: "Called", n: 5618, tone: STEEL },
      { label: "Not called", n: 622, tone: MID, mark: "watch" },
    ]),
    apptSplit: pack([
      { label: "Ran", n: 2410, tone: STEEL },
      { label: "Still set", n: 712, tone: MID },
    ]),
    jobSplit: pack([
      { label: "Closed", n: 640, tone: MID },
      { label: "Active", n: 62, tone: STEEL },
      { label: "Hold", n: 16, tone: WASH, mark: "watch" },
    ]),
    products: [
      { name: "Attic insulation", amount: 4280000 },
      { name: "HVAC replacement", amount: 3612000 },
      { name: "Air sealing", amount: 2144000 },
      { name: "Duct sealing", amount: 1688000 },
      { name: "Insulation removal", amount: 1246000 },
      { name: "Windows", amount: 1238400 },
    ],
    offices: [
      { name: "Phoenix", amount: 5124000 },
      { name: "Scottsdale", amount: 3988000 },
      { name: "Dallas", amount: 2842000 },
      { name: "Fort Worth", amount: 1544000 },
      { name: "North Phoenix", amount: 710400 },
    ],
    funnel: [
      { label: "Leads", n: 6240, rate: "100%" },
      { label: "Appts", n: 3122, rate: "50%" },
      { label: "Runs", n: 2410, rate: "77%" },
      { label: "Sold", n: 986, rate: "41%" },
      { label: "Jobs", n: 718, rate: "73%" },
    ],
    bars: [
      { label: "22", now: 1420000, prior: 0 },
      { label: "23", now: 2680000, prior: 1420000 },
      { label: "24", now: 3120000, prior: 2680000 },
      { label: "25", now: 3140000, prior: 3120000 },
      { label: "26", now: 3848400, prior: 2642100, hot: true },
    ],
    barTitle: "Sold by year",
    barHint: "Steel is this company year. Gray is the year before.",
    closers: [
      { name: "Dana Ortiz", why: "78 sold", amount: 3124000, count: 78 },
      { name: "Marco Velez", why: "64 sold", amount: 2688000, count: 64 },
      { name: "Luis Haddad", why: "51 sold", amount: 2142000, count: 51 },
      { name: "Cole Brennan", why: "48 sold", amount: 1984000, count: 48 },
      { name: "Nate Solis", why: "22 sold", amount: 892400, count: 22 },
    ],
    setters: [
      { name: "Priya Shah", why: "1,240 set · 942 ran", amount: 1240, count: 942 },
      { name: "Amber Quinn", why: "980 set · 710 ran", amount: 980, count: 710 },
      { name: "Office inbound", why: "902 set · 758 ran", amount: 902, count: 758 },
    ],
    unmarked: 12,
    nosit: 86,
    missed: 64,
    oneleg: 41,
  }),
  ytd: board({
    id: "ytd",
    vs: "last year this time",
    sold: 3847220,
    priorSold: 3258000,
    goalSold: 4200000,
    deals: 270,
    priorDeals: 238,
    goalDeals: 300,
    close: 38,
    priorClose: 36,
    goalClose: 40,
    avg: 14249,
    priorAvg: 13689,
    cancel: 94400,
    priorCancel: 112200,
    cashIn: 3124800,
    priorCash: 2684400,
    finance: 2412000,
    card: 712800,
    leads: 1842,
    priorLeads: 1610,
    appts: 926,
    priorAppts: 812,
    runs: 710,
    priorRuns: 620,
    cancelledN: 22,
    jobs: 186,
    priorJobs: 154,
    opps: 284,
    mix: pack([
      { label: "Set", n: 196, tone: WASH },
      { label: "Ran", n: 438, tone: STEEL },
      { label: "Sold", n: 270, tone: LIVE },
      { label: "Cancelled", n: 22, tone: WASH, mark: "stop" },
    ]),
    leadSplit: pack([
      { label: "Called", n: 1648, tone: STEEL },
      { label: "Not called", n: 194, tone: MID, mark: "watch" },
    ]),
    apptSplit: pack([
      { label: "Ran", n: 710, tone: STEEL },
      { label: "Still set", n: 216, tone: MID },
    ]),
    jobSplit: pack([
      { label: "Closed", n: 138, tone: MID },
      { label: "Active", n: 42, tone: STEEL },
      { label: "Hold", n: 6, tone: WASH, mark: "watch" },
    ]),
    products: [
      { name: "Attic insulation", amount: 1180000 },
      { name: "HVAC replacement", amount: 874000 },
      { name: "Air sealing", amount: 612000 },
      { name: "Duct sealing", amount: 448000 },
      { name: "Insulation removal", amount: 306000 },
      { name: "Windows", amount: 427220 },
    ],
    offices: [
      { name: "Phoenix", amount: 1420000 },
      { name: "Scottsdale", amount: 1110000 },
      { name: "Dallas", amount: 742000 },
      { name: "Fort Worth", amount: 398000 },
      { name: "North Phoenix", amount: 177220 },
    ],
    funnel: [
      { label: "Leads", n: 1842, rate: "100%" },
      { label: "Appts", n: 926, rate: "50%" },
      { label: "Runs", n: 710, rate: "77%" },
      { label: "Sold", n: 270, rate: "38%" },
      { label: "Jobs", n: 186, rate: "69%" },
    ],
    bars: [
      { label: "Jan", now: 312000, prior: 268000 },
      { label: "Feb", now: 348000, prior: 294000 },
      { label: "Mar", now: 412000, prior: 338000 },
      { label: "Apr", now: 468000, prior: 382000 },
      { label: "May", now: 524000, prior: 448000 },
      { label: "Jun", now: 586000, prior: 502000 },
      { label: "Jul", now: 498000, prior: 412000 },
      { label: "Aug", now: 442000, prior: 388000 },
      { label: "Sep", now: 257220, prior: 226000, hot: true },
    ],
    barTitle: "Sold by month",
    barHint: "Steel is this year. Gray is last year this month.",
    closers: [
      { name: "Dana Ortiz", why: "4 sold this week · 78 YTD", amount: 1124800, count: 78 },
      { name: "Marco Velez", why: "3 sold this week · 64 YTD", amount: 892400, count: 64 },
      { name: "Luis Haddad", why: "2 sold this week · 51 YTD", amount: 641200, count: 51 },
      { name: "Cole Brennan", why: "2 sold this week · 48 YTD", amount: 598600, count: 48 },
      { name: "Nate Solis", why: "0 this week · 22 YTD", amount: 312000, count: 22 },
    ],
    setters: [
      { name: "Priya Shah", why: "412 set · 318 ran", amount: 412, count: 318 },
      { name: "Amber Quinn", why: "298 set · 221 ran", amount: 298, count: 221 },
      { name: "Office inbound", why: "216 set · 171 ran", amount: 216, count: 171 },
    ],
    unmarked: 41,
    nosit: 18,
    missed: 14,
    oneleg: 9,
  }),
  qtd: board({
    id: "qtd",
    vs: "last quarter this time",
    sold: 1197220,
    priorSold: 1284000,
    goalSold: 1350000,
    deals: 84,
    priorDeals: 91,
    goalDeals: 95,
    close: 37,
    priorClose: 39,
    goalClose: 40,
    avg: 14253,
    priorAvg: 14110,
    cancel: 41200,
    priorCancel: 28600,
    cashIn: 984200,
    priorCash: 1048800,
    finance: 742000,
    card: 242200,
    leads: 612,
    priorLeads: 588,
    appts: 308,
    priorAppts: 296,
    runs: 228,
    priorRuns: 220,
    cancelledN: 8,
    jobs: 58,
    priorJobs: 64,
    opps: 96,
    mix: pack([
      { label: "Set", n: 72, tone: WASH },
      { label: "Ran", n: 144, tone: STEEL },
      { label: "Sold", n: 84, tone: MID },
      { label: "Cancelled", n: 8, tone: WASH, mark: "stop" },
    ]),
    leadSplit: pack([
      { label: "Called", n: 548, tone: STEEL },
      { label: "Not called", n: 64, tone: MID, mark: "watch" },
    ]),
    apptSplit: pack([
      { label: "Ran", n: 228, tone: STEEL },
      { label: "Still set", n: 80, tone: MID },
    ]),
    jobSplit: pack([
      { label: "Closed", n: 41, tone: MID },
      { label: "Active", n: 14, tone: STEEL },
      { label: "Hold", n: 3, tone: WASH, mark: "watch" },
    ]),
    products: [
      { name: "Attic insulation", amount: 368000 },
      { name: "HVAC replacement", amount: 274000 },
      { name: "Air sealing", amount: 186000 },
      { name: "Duct sealing", amount: 142000 },
      { name: "Insulation removal", amount: 98000 },
      { name: "Windows", amount: 129220 },
    ],
    offices: [
      { name: "Phoenix", amount: 442000 },
      { name: "Scottsdale", amount: 338000 },
      { name: "Dallas", amount: 228000 },
      { name: "Fort Worth", amount: 128000 },
      { name: "North Phoenix", amount: 61220 },
    ],
    funnel: [
      { label: "Leads", n: 612, rate: "100%" },
      { label: "Appts", n: 308, rate: "50%" },
      { label: "Runs", n: 228, rate: "74%" },
      { label: "Sold", n: 84, rate: "37%" },
      { label: "Jobs", n: 58, rate: "69%" },
    ],
    bars: [
      { label: "Jul", now: 498000, prior: 512000 },
      { label: "Aug", now: 442000, prior: 468000 },
      { label: "Sep", now: 257220, prior: 304000, hot: true },
    ],
    barTitle: "Sold this quarter",
    barHint: "Steel is this quarter. Gray is last quarter this month.",
    closers: [
      { name: "Dana Ortiz", why: "24 sold", amount: 362400, count: 24 },
      { name: "Marco Velez", why: "19 sold", amount: 274800, count: 19 },
      { name: "Cole Brennan", why: "16 sold", amount: 218600, count: 16 },
      { name: "Luis Haddad", why: "15 sold", amount: 198200, count: 15 },
      { name: "Nate Solis", why: "10 sold", amount: 143220, count: 10 },
    ],
    setters: [
      { name: "Priya Shah", why: "142 set · 108 ran", amount: 142, count: 108 },
      { name: "Amber Quinn", why: "98 set · 72 ran", amount: 98, count: 72 },
      { name: "Office inbound", why: "68 set · 48 ran", amount: 68, count: 48 },
    ],
    unmarked: 11,
    nosit: 7,
    missed: 5,
    oneleg: 3,
  }),
  mtd: board({
    id: "mtd",
    vs: "last month this time",
    sold: 257220,
    priorSold: 442000,
    goalSold: 480000,
    deals: 18,
    priorDeals: 31,
    goalDeals: 32,
    close: 39,
    priorClose: 37,
    goalClose: 40,
    avg: 14290,
    priorAvg: 14258,
    cancel: 18600,
    priorCancel: 12400,
    cashIn: 186400,
    priorCash: 312800,
    finance: 142000,
    card: 44400,
    leads: 128,
    priorLeads: 186,
    appts: 64,
    priorAppts: 92,
    runs: 46,
    priorRuns: 68,
    cancelledN: 4,
    jobs: 14,
    priorJobs: 22,
    opps: 38,
    mix: pack([
      { label: "Set", n: 14, tone: WASH },
      { label: "Ran", n: 28, tone: STEEL },
      { label: "Sold", n: 18, tone: MID },
      { label: "Cancelled", n: 4, tone: WASH, mark: "stop" },
    ]),
    leadSplit: pack([
      { label: "Called", n: 104, tone: STEEL },
      { label: "Not called", n: 24, tone: MID, mark: "watch" },
    ]),
    apptSplit: pack([
      { label: "Ran", n: 46, tone: STEEL },
      { label: "Still set", n: 18, tone: MID },
    ]),
    jobSplit: pack([
      { label: "Closed", n: 8, tone: MID },
      { label: "Active", n: 5, tone: STEEL },
      { label: "Hold", n: 1, tone: WASH, mark: "watch" },
    ]),
    products: [
      { name: "Attic insulation", amount: 84200 },
      { name: "HVAC replacement", amount: 61200 },
      { name: "Air sealing", amount: 42800 },
      { name: "Duct sealing", amount: 28600 },
      { name: "Insulation removal", amount: 18400 },
      { name: "Windows", amount: 22020 },
    ],
    offices: [
      { name: "Phoenix", amount: 98400 },
      { name: "Scottsdale", amount: 74200 },
      { name: "Dallas", amount: 48600 },
      { name: "Fort Worth", amount: 24800 },
      { name: "North Phoenix", amount: 11220 },
    ],
    funnel: [
      { label: "Leads", n: 128, rate: "100%" },
      { label: "Appts", n: 64, rate: "50%" },
      { label: "Runs", n: 46, rate: "72%" },
      { label: "Sold", n: 18, rate: "39%" },
      { label: "Jobs", n: 14, rate: "78%" },
    ],
    bars: [
      { label: "W1", now: 86400, prior: 112000 },
      { label: "W2", now: 98200, prior: 128400 },
      { label: "W3", now: 72620, prior: 201600, hot: true },
    ],
    barTitle: "Sold this month",
    barHint: "Steel is this month. Gray is last month this week.",
    closers: [
      { name: "Dana Ortiz", why: "6 sold", amount: 86420, count: 6 },
      { name: "Marco Velez", why: "4 sold", amount: 61200, count: 4 },
      { name: "Luis Haddad", why: "3 sold", amount: 42800, count: 3 },
      { name: "Cole Brennan", why: "3 sold", amount: 38600, count: 3 },
      { name: "Nate Solis", why: "2 sold", amount: 28200, count: 2 },
    ],
    setters: [
      { name: "Priya Shah", why: "28 set · 18 ran", amount: 28, count: 18 },
      { name: "Amber Quinn", why: "22 set · 16 ran", amount: 22, count: 16 },
      { name: "Office inbound", why: "14 set · 12 ran", amount: 14, count: 12 },
    ],
    unmarked: 6,
    nosit: 3,
    missed: 2,
    oneleg: 1,
  }),
  wtd: board({
    id: "wtd",
    vs: "last week this time",
    sold: 186420,
    priorSold: 164800,
    goalSold: 260000,
    deals: 11,
    priorDeals: 10,
    goalDeals: 16,
    close: 42,
    priorClose: 38,
    goalClose: 40,
    avg: 16947,
    priorAvg: 16480,
    cancel: 9800,
    priorCancel: 12400,
    cashIn: 84200,
    priorCash: 76800,
    finance: 61200,
    card: 23000,
    leads: 47,
    priorLeads: 41,
    appts: 24,
    priorAppts: 21,
    runs: 18,
    priorRuns: 16,
    cancelledN: 1,
    jobs: 6,
    priorJobs: 5,
    opps: 14,
    mix: pack([
      { label: "Set", n: 5, tone: WASH },
      { label: "Ran", n: 7, tone: STEEL },
      { label: "Sold", n: 11, tone: LIVE },
      { label: "Cancelled", n: 1, tone: WASH, mark: "stop" },
    ]),
    leadSplit: pack([
      { label: "Called", n: 36, tone: STEEL },
      { label: "Not called", n: 11, tone: MID, mark: "watch" },
    ]),
    apptSplit: pack([
      { label: "Ran", n: 18, tone: STEEL },
      { label: "Still set", n: 6, tone: MID },
    ]),
    jobSplit: pack([
      { label: "Closed", n: 3, tone: MID },
      { label: "Active", n: 2, tone: STEEL },
      { label: "Hold", n: 1, tone: WASH, mark: "watch" },
    ]),
    products: [
      { name: "Attic insulation", amount: 62400 },
      { name: "HVAC replacement", amount: 48600 },
      { name: "Air sealing", amount: 28600 },
      { name: "Duct sealing", amount: 21400 },
      { name: "Insulation removal", amount: 14200 },
      { name: "Windows", amount: 11220 },
    ],
    offices: [
      { name: "Phoenix", amount: 68400 },
      { name: "Scottsdale", amount: 54200 },
      { name: "Dallas", amount: 36200 },
      { name: "Fort Worth", amount: 18600 },
      { name: "North Phoenix", amount: 9020 },
    ],
    funnel: [
      { label: "Leads", n: 47, rate: "100%" },
      { label: "Appts", n: 24, rate: "51%" },
      { label: "Runs", n: 18, rate: "75%" },
      { label: "Sold", n: 11, rate: "61%" },
      { label: "Jobs", n: 6, rate: "55%" },
    ],
    bars: [
      { label: "Sun", now: 18400, prior: 12200 },
      { label: "Mon", now: 40150, prior: 50920 },
      { label: "Tue", now: 48600, prior: 36200 },
      { label: "Wed", now: 42800, prior: 28600 },
      { label: "Thu", now: 36470, prior: 36880, hot: true },
      { label: "Fri", now: 0, prior: 0 },
      { label: "Sat", now: 0, prior: 0 },
    ],
    barTitle: "Sold this week",
    barHint: "Steel is this week. Gray is last week this day.",
    closers: [
      { name: "Dana Ortiz", why: "4 sold", amount: 86420, count: 4 },
      { name: "Marco Velez", why: "3 sold", amount: 61200, count: 3 },
      { name: "Luis Haddad", why: "2 sold", amount: 33180, count: 2 },
      { name: "Cole Brennan", why: "2 sold", amount: 5620, count: 2 },
      { name: "Nate Solis", why: "0 sold", amount: 0, count: 0 },
    ],
    setters: [
      { name: "Priya Shah", why: "18 set · 11 ran", amount: 18, count: 11 },
      { name: "Amber Quinn", why: "14 set · 9 ran", amount: 14, count: 9 },
    ],
    unmarked: 2,
    nosit: 1,
    missed: 1,
    oneleg: 0,
  }),
  day: board({
    id: "day",
    vs: "yesterday this hour",
    sold: 40150,
    priorSold: 50920,
    goalSold: 52000,
    deals: 2,
    priorDeals: 3,
    goalDeals: 3,
    close: 40,
    priorClose: 50,
    goalClose: 40,
    avg: 20075,
    priorAvg: 16973,
    cancel: 0,
    priorCancel: 9800,
    cashIn: 18640,
    priorCash: 16220,
    finance: 28640,
    card: 0,
    leads: 6,
    priorLeads: 5,
    appts: 9,
    priorAppts: 8,
    runs: 5,
    priorRuns: 6,
    cancelledN: 0,
    jobs: 2,
    priorJobs: 3,
    opps: 4,
    sitsLeft: 4,
    mix: pack([
      { label: "Set", n: 4, tone: WASH },
      { label: "Ran", n: 3, tone: STEEL },
      { label: "Sold", n: 2, tone: MID },
      { label: "Cancelled", n: 0, tone: WASH },
    ]),
    leadSplit: pack([
      { label: "Called", n: 4, tone: STEEL },
      { label: "Not called", n: 2, tone: MID, mark: "watch" },
    ]),
    apptSplit: pack([
      { label: "Ran", n: 5, tone: STEEL },
      { label: "Left", n: 4, tone: MID },
    ]),
    jobSplit: pack([
      { label: "Closed", n: 0, tone: MID },
      { label: "Out", n: 2, tone: STEEL },
      { label: "Pending", n: 0, tone: WASH },
    ]),
    products: [
      { name: "HVAC 4-ton + ducts", amount: 28640 },
      { name: "Attic R-49", amount: 11510 },
    ],
    offices: [
      { name: "Scottsdale", amount: 28640 },
      { name: "Phoenix", amount: 11510 },
    ],
    funnel: [
      { label: "Leads", n: 6, rate: "100%" },
      { label: "Appts", n: 9, rate: "—" },
      { label: "Runs", n: 5, rate: "56%" },
      { label: "Sold", n: 2, rate: "40%" },
      { label: "Jobs", n: 2, rate: "100%" },
    ],
    bars: [
      { label: "6a", now: 0, prior: 0 },
      { label: "7a", now: 0, prior: 1 },
      { label: "8a", now: 1, prior: 2 },
      { label: "9a", now: 0, prior: 1 },
      { label: "10a", now: 1, prior: 0 },
      { label: "11a", now: 1, prior: 1 },
      { label: "12p", now: 1, prior: 1 },
      { label: "1p", now: 1, prior: 1 },
      { label: "2p", now: 0, prior: 0 },
      { label: "3p", now: 0, prior: 0 },
      { label: "4p", now: 2, prior: 1 },
      { label: "5p", now: 2, prior: 2 },
      { label: "6p", now: 3, prior: 1, hot: true },
      { label: "7p", now: 1, prior: 1 },
      { label: "8p", now: 0, prior: 0 },
      { label: "9p", now: 0, prior: 0 },
    ],
    barTitle: "Sits by hour",
    barHint: "Steel is today. Gray is yesterday. Navy is now (6p).",
    closers: [
      { name: "Dana Ortiz", why: "Hale HVAC. Out at 5p", amount: 28640, count: 1 },
      { name: "Marco Velez", why: "Cho attic. Out at 7p", amount: 11510, count: 1 },
      { name: "Luis Haddad", why: "Patel no sit 4p", amount: 0, count: 0 },
      { name: "Cole Brennan", why: "Briggs 6:30p still out", amount: 0, count: 0 },
      { name: "Nate Solis", why: "Not on the book", amount: 0, count: 0 },
    ],
    setters: [
      { name: "Priya Shah", why: "3 set today", amount: 3, count: 2 },
      { name: "Amber Quinn", why: "2 set today", amount: 2, count: 1 },
    ],
    unmarked: 2,
    nosit: 1,
    missed: 0,
    oneleg: 0,
  }),
};

export const officeFill: Record<string, string> = {
  Phoenix: "var(--color-navy)",
  Scottsdale: "var(--color-navy-2)",
  Dallas: "var(--color-muted)",
  "Fort Worth": "var(--color-idle)",
  "North Phoenix": "var(--color-faint)",
};

export const markets = [
  { id: "all", label: "All markets" },
  { id: "PHX", label: "Phoenix" },
  { id: "SDL", label: "Scottsdale" },
  { id: "DAL", label: "Dallas" },
  { id: "FTW", label: "Fort Worth" },
] as const;

export type MarketId = (typeof markets)[number]["id"];

export const discounts: Record<RangeId, { pct: number; prior: number }> = {
  ltd: { pct: 8.1, prior: 8.9 },
  ytd: { pct: 8.4, prior: 9.2 },
  qtd: { pct: 8.8, prior: 8.1 },
  mtd: { pct: 9.1, prior: 8.6 },
  wtd: { pct: 7.6, prior: 8.4 },
  day: { pct: 6.2, prior: 11.0 },
};

const MARKET_OFFICE: Record<MarketId, string[]> = {
  all: ["Phoenix", "Scottsdale", "Dallas", "Fort Worth", "North Phoenix"],
  PHX: ["Phoenix", "North Phoenix"],
  SDL: ["Scottsdale"],
  DAL: ["Dallas"],
  FTW: ["Fort Worth"],
};

const MARKET_K: Record<MarketId, number> = {
  all: 1,
  PHX: 0.415,
  SDL: 0.289,
  DAL: 0.193,
  FTW: 0.103,
};

function n(x: number, k: number) {
  return Math.max(0, Math.round(x * k));
}

function scale(t: SalesBoard, k: number): SalesBoard {
  if (Math.abs(k - 1) < 0.001) return t;
  const mix = (rows: Split[]) => {
    const next = rows.map((r) => ({ ...r, n: n(r.n, k) }));
    const total = next.reduce((s, r) => s + r.n, 0) || 1;
    return next.map((r) => ({ ...r, pct: Math.round((r.n / total) * 100) }));
  };
  return {
    ...t,
    sold: n(t.sold, k),
    priorSold: n(t.priorSold, k),
    goalSold: n(t.goalSold, k),
    deals: n(t.deals, k),
    priorDeals: n(t.priorDeals, k),
    goalDeals: n(t.goalDeals, k),
    cancel: n(t.cancel, k),
    priorCancel: n(t.priorCancel, k),
    cashIn: n(t.cashIn, k),
    priorCash: n(t.priorCash, k),
    finance: n(t.finance, k),
    card: n(t.card, k),
    leads: n(t.leads, k),
    priorLeads: n(t.priorLeads, k),
    appts: n(t.appts, k),
    priorAppts: n(t.priorAppts, k),
    runs: n(t.runs, k),
    priorRuns: n(t.priorRuns, k),
    cancelledN: n(t.cancelledN, k),
    jobs: n(t.jobs, k),
    priorJobs: n(t.priorJobs, k),
    opps: n(t.opps, k),
    sitsLeft: t.sitsLeft == null ? undefined : n(t.sitsLeft, k),
    mix: mix(t.mix),
    leadSplit: mix(t.leadSplit),
    apptSplit: mix(t.apptSplit),
    jobSplit: mix(t.jobSplit),
    products: t.products.map((p) => ({ ...p, amount: n(p.amount, k) })),
    offices: t.offices.map((p) => ({ ...p, amount: n(p.amount, k) })),
    funnel: t.funnel.map((f) => ({ ...f, n: n(f.n, k) })),
    bars: t.bars.map((b) => ({ ...b, now: n(b.now, k), prior: n(b.prior, k) })),
    closers: t.closers.map((p) => ({ ...p, amount: n(p.amount, k), count: n(p.count, k) })),
    setters: t.setters.map((p) => ({ ...p, amount: n(p.amount, k), count: n(p.count, k) })),
    unmarked: n(t.unmarked, k),
    nosit: n(t.nosit, k),
    missed: n(t.missed, k),
    oneleg: n(t.oneleg, k),
  };
}

export function viewBoard(t: SalesBoard, market: MarketId, person: string): SalesBoard {
  let pk = 1;
  if (person !== "all") {
    const closer = t.closers.find((p) => p.name === person);
    const setter = t.setters.find((p) => p.name === person);
    if (closer && t.sold) pk = closer.amount / t.sold;
    else if (setter) {
      const total = t.setters.reduce((s, x) => s + x.amount, 0) || 1;
      pk = setter.amount / total;
    }
  }
  const mk = MARKET_K[market];
  const out = scale(t, pk * mk);
  const keep = MARKET_OFFICE[market];
  const offices = t.offices
    .filter((o) => keep.includes(o.name))
    .map((o) => ({ ...o, amount: n(o.amount, pk) }));
  let closers = out.closers;
  let setters = out.setters;
  if (person !== "all") {
    closers = out.closers.filter((p) => p.name === person);
    setters = out.setters.filter((p) => p.name === person);
    if (!closers.length) closers = out.closers.slice(0, 3);
    if (!setters.length) setters = out.setters.slice(0, 2);
  }
  return { ...out, offices, closers, setters };
}

export function payMix(t: SalesBoard) {
  const rows = [
    { name: "Financing", w: 18, fill: "var(--color-navy)" },
    { name: "Cash/check", w: 10, fill: "var(--color-navy-2)" },
    { name: "Cash/check + financing", w: 22, fill: "var(--color-ink)" },
    { name: "CC", w: 7, fill: "var(--color-muted)" },
    { name: "CC + financing", w: 16, fill: "var(--color-idle)" },
    { name: "ACH", w: 5, fill: "var(--color-faint)" },
    { name: "ACH + financing", w: 22, fill: "var(--color-line-strong)" },
  ];
  const w = rows.reduce((s, r) => s + r.w, 0);
  return rows.map((r) => ({
    name: r.name,
    amount: Math.round((t.sold * r.w) / w),
    qty: Math.max(1, Math.round((t.deals * r.w) / w)),
    fill: r.fill,
  }));
}

export function sourceMix(t: SalesBoard) {
  const rows = [
    { name: "Canvass", lw: 34, sw: 26, fill: "var(--color-navy)" },
    { name: "Google", lw: 24, sw: 22, fill: "var(--color-navy-2)" },
    { name: "Website", lw: 18, sw: 16, fill: "var(--color-muted)" },
    { name: "Referral", lw: 14, sw: 24, fill: "var(--color-idle)" },
    { name: "Partner", lw: 10, sw: 12, fill: "var(--color-faint)" },
  ];
  const lw = rows.reduce((s, r) => s + r.lw, 0);
  const sw = rows.reduce((s, r) => s + r.sw, 0);
  return rows.map((r) => ({
    name: r.name,
    leads: Math.round((t.leads * r.lw) / lw),
    sold: Math.round((t.sold * r.sw) / sw),
    fill: r.fill,
  }));
}
