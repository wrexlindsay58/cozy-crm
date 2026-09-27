import type { Lead, Tone } from "@/lib/crm-data";

type Person = {
  name: string;
  second?: string;
  phone: string;
  email: string;
  city: string;
  office: string;
  source: string;
  closer: string;
  setter: string;
  product: string;
  value: number;
};

const C = ["Marco Velez", "Dana Ortiz", "Luis Haddad", "Cole Brennan", "Nate Solis", "Wrex Lindsay"];

const S = ["Priya Shah", "Amber Quinn"];

const SRC = ["Canvass", "Google", "Referral", "Facebook", "Radio", "Self-gen"];

const PROD = ["Attic R-49 + air seal", "HVAC 4-ton + ducts", "Whole-home envelope", "Duct replacement", "Smart thermostat"];

const OFFICE = ["Phoenix", "Scottsdale", "Dallas", "Fort Worth", "North Phoenix"];

const CITY = ["Phoenix, AZ", "Scottsdale, AZ", "Dallas, TX", "Fort Worth, TX", "Surprise, AZ", "Gilbert, AZ", "Mesa, AZ", "Chandler, AZ", "Peoria, AZ", "Plano, TX"];

export const STREETS = ["W Bell Rd", "E Cactus Rd", "N 19th Ave", "S Rural Rd", "E Shea Blvd", "W Camelback Rd", "N Scottsdale Rd", "E Baseline Rd", "W Union Hills", "S Mill Ave"];

const FIRST = ["Miles", "Sofia", "Greg", "Hannah", "Chris", "Priya", "Owen", "Nora", "Ivan", "June", "Samir", "Claire", "Diego", "Bethany", "Andre", "Fiona", "Leo", "Ruth", "Yara", "Colin", "Ines", "Theo", "Aisha", "Blake", "Wendy", "Harold", "Gina", "Omar", "Paula", "Frank", "Keisha", "Robin", "Elliot", "Camila", "Ned", "Sasha", "Vera", "Hugh", "Lana", "Quincy", "Tessa", "Ibrahim", "Greta", "Yusuf", "Marta", "Dean", "Nia", "Oscar", "Pilar", "Ross", "Uma", "Vince", "Willa", "Xander", "Yolanda", "Zane", "Adele", "Bruno", "Celia", "Darius", "Esther", "Felix", "Gloria", "Hector", "Iris", "Joel", "Kara", "Lars", "Mona", "Nolan", "Opal", "Paolo", "Quinn", "Renee", "Stefan", "Talia", "Uri", "Valentina", "Walter", "Ximena", "Yves", "Zara", "Arthur", "Bryn", "Cora", "Dina", "Eddie", "Faith", "Gavin", "Hana", "Ian", "Joan", "Karl", "Lila", "Mason", "Nadia", "Otto", "Penny", "Rafael", "Sylvia", "Travis", "Una", "Victor", "Winnie", "Abel", "Bella", "Caleb", "Daisy", "Evan", "Farah", "Gabe", "Hope", "Isaac", "Jade", "Kyle", "Leah", "Micah", "Noor", "Olive", "Pavel", "Rosa", "Seth", "Thea", "Umar", "Violet", "Will", "Anya", "Brett", "Carmen", "Drew", "Elise", "Finn", "Gia", "Hugo", "Ivy", "Jonah", "Kira", "Mina", "Nico", "Ophelia", "Pierce", "Remy", "Soren", "Tova", "Vera", "Wes", "Xena", "Yara", "Zach", "Amina", "Bo", "Cecile", "Dante", "Eden", "Forrest", "Greta", "Ingrid", "Jasper"];

const LAST = ["Okonkwo", "Nguyen", "Alvarez", "Brooks", "Dalton", "Mehta", "Price", "Feldman", "Petrov", "Harlow", "Qureshi", "Boone", "Morales", "Cho", "Wallace", "Grant", "Park", "Abel", "Haddad", "Fraser", "Navarro", "Marsh", "Rahman", "Sutton", "Cho", "Estes", "Russo", "Farouk", "Ng", "Doyle", "Ward", "Hale", "Shaw", "Ortiz", "Harper", "Kim", "Santos", "Brennan", "Voss", "Adler", "Bloom", "Noor", "Holm", "Demir", "Silva", "Corbett", "Lind", "Gomez", "Tanner", "Desai", "Moretti", "Kane", "Holt", "Cruz", "Porter", "Frost", "Costa", "Tran", "Ellis", "Gold", "Rowan", "Chen", "Ruiz", "Kato", "Abrams", "Singh", "Berg", "Blake", "Pierce", "Reed", "Ricci", "Fox", "Novak", "Green", "Bennet", "Rossi", "Pike", "Vargas", "Martin", "Iqbal", "Lane", "Callahan", "Farah", "Omar", "Moore", "Sato", "Crowe", "Peck", "Weiss", "Clark", "Brandt", "Walsh", "Diaz", "Lang", "Keller", "Costa", "Shah", "Malik", "Torres", "Cohen", "Anders", "Stone", "Horvat", "Shore", "Petrova", "Patel", "Moreau", "Okafor", "Romano", "Ellis", "Santos", "Qureshi", "Dalton", "Lind", "Adler", "Solis", "Ortiz", "Nguyen", "Diallo", "Keller", "Martin", "Ruiz", "Cho", "Hale", "Santos", "Solis", "Reed"];

const SECOND = ["Ada", "Daniel", "Nina", "Eli", "Maya", "Arun", "Lila", "Seth", "Katya", "Mark", "Amina", "Jack", "Lucia", "Ryan", "Tasha", "Hugh", "Mina", "Henry", "Sami", "Eve", "Pablo", "Gwen", "Farid", "Cora", "Peter", "Maude", "Tony", "Leila", "Victor", "Susan", "Darius", "Scott", "Nora", "Jose", "Jill", "Jonah", "Miguel", "Pam", "Erik", "Ruth", "Carl", "Hana", "Nils", "Elif", "Rafael", "Amy", "Calvin", "Freya", "Andres", "Beth", "Nikhil", "Carla", "Grant", "Ivy", "Mateo", "Holly", "Simon", "Lia", "Minh", "Monique", "Aaron", "Jade", "Wei", "Rosa", "Ken", "Tina", "Dev", "Sigrid", "Chris", "Eden", "Hank", "Giulia", "Sage", "Alan", "Klara", "Owen", "Leah", "Luca", "Dorothy", "Luis", "Chloe", "Imran", "Bea", "Drew", "Finn", "Samir", "Grace", "Hassan", "Hazel", "Kenji", "Lucy", "Robert", "Ingrid", "Bao", "Ruby", "Oleg", "Mara", "Sean", "Sofia", "Thomas", "Kelly", "Paul", "Emma", "Alan", "Nuria", "Cruz", "Mai", "Erik", "Rina", "Adeel", "Luz", "Neil", "Miriam", "Sun", "Brooke", "David", "Ava", "Rami", "Peter", "Ivana", "Tuan", "Marisol", "Colin", "Ayesha", "Adam", "Jenny", "Maxim", "Sara", "Jorge", "Anika", "Henri", "Ada", "Enzo", "Astrid", "Leo", "Maya", "Diego", "Bilal", "Elena", "James", "Nora", "Reese", "Eli", "Freja", "Hank", "Cleo", "Marco", "Mateo", "Linh", "Ibra", "June", "Andre", "Isabel", "Miles", "Willa", "Felix", "Pablo", "Olive"];

const TAKEN = new Set([
  "Elena Vargas", "Todd Hale", "Marcus Bell", "Sharon Nguyen", "Jamal Ortiz", "Rita Colson", "Ben Cho", "Harold Price", "Nina Patel", "Chris Duran", "Ann Whitaker", "Owen Briggs", "Lila Moreno", "Greg Fontaine", "Aisha Rahman", "Paul Kerr", "Miguel Santos", "Carol Jensen", "James Cole", "Renee Alvarez", "Helen Patterson", "Rita Lang", "Diane Kerr",
]);

const seen = new Map<number, Person>();

export function person(i: number): Person {
  const cached = seen.get(i);
  if (cached) return cached;
  let n = i;
  let row = makePerson(n);
  while (TAKEN.has(row.name)) {
    n += 17;
    row = makePerson(n);
  }
  TAKEN.add(row.name);
  seen.set(i, row);
  return row;
}

function makePerson(i: number): Person {
  const name = `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`;
  const second = `${SECOND[i % SECOND.length]} ${LAST[i % LAST.length]}`;
  const n = 1100 + i;
  return {
    name,
    second: i % 5 === 4 ? undefined : second,
    phone: `(${480 + (i % 4) * 10}) 555-${String(n).slice(-4)}`,
    email: `${FIRST[i % FIRST.length].toLowerCase()}.${LAST[i % LAST.length].toLowerCase()}${i}@gmail.com`,
    city: CITY[i % CITY.length],
    office: OFFICE[i % OFFICE.length],
    source: SRC[i % SRC.length],
    closer: C[i % C.length],
    setter: S[i % S.length],
    product: PROD[i % PROD.length],
    value: 6400 + (i % 17) * 1250,
  };
}

export function leadOf(p: Person, id: string, status: string, tone: Tone, next: string): Lead {
  const n = Number(id.replace(/\D/g, "")) || 1;
  return {
    id,
    name: p.name,
    phone: p.phone,
    email: p.email,
    address: `${1200 + (n % 800)} ${STREETS[n % STREETS.length]}`,
    city: p.city,
    source: p.source,
    status,
    tone,
    setter: p.setter,
    closer: p.closer,
    office: p.office,
    created: "Sep 8",
    next,
    product: p.product,
    value: p.value,
    notes: "",
    secondaryName: p.second,
    secondaryEmail: p.second ? p.email.replace("@", ".2@") : undefined,
    secondaryPhone: p.second ? p.phone.replace(/(\d)(\d{3})$/, "8$2") : undefined,
    yearBuilt: String(1970 + (n % 45)),
    stories: "1",
    sqft: String(1400 + (n % 12) * 80),
    utility: p.city.endsWith("TX") ? "Oncor" : "APS",
    hoa: n % 3 === 0 ? "Yes" : "No",
    access: "Hatch in the garage.",
    bothHome: Boolean(p.second),
    finance: "Either",
    rebate: n % 2 === 0,
  };
}

const LEAD_STATUS = [
  { status: "New", tone: "muted" as Tone, next: "Call today" },
  { status: "No answer", tone: "alert" as Tone, next: "Call back 5p" },
  { status: "Contacted", tone: "navy" as Tone, next: "Text sent" },
  { status: "Confirmed", tone: "navy" as Tone, next: "Sep 28 6:00p" },
  { status: "Pending", tone: "muted" as Tone, next: "Sep 29 10:00a" },
  { status: "Unmarked", tone: "alert" as Tone, next: "Needs disposition" },
  { status: "Ran", tone: "up" as Tone, next: "Follow-up" },
  { status: "One legger", tone: "alert" as Tone, next: "Spouse callback" },
];

/** Extra people who stay on the lead list. Combined with the original leads this clears 50. */
export const rosterLeads: Lead[] = Array.from({ length: 40 }, (_, i) => {
  const row = LEAD_STATUS[i % LEAD_STATUS.length];
  return leadOf(person(i), `L-60${String(i + 1).padStart(2, "0")}`, row.status, row.tone, row.next);
});

export type RosterAssessment = { id: string; leadId: string; name: string; address: string; closer: string; status: "Complete" | "Open" };

/** Extra assessed houses. None of these are already on another list. */
const assessmentBuilt = Array.from({ length: 30 }, (_, i) => {
  const p = person(40 + i);
  const lead = leadOf(p, `L-61${String(i + 1).padStart(2, "0")}`, "Ran", "up", "Assessment");
  const row: RosterAssessment = { id: `AS-${30 + i}`, leadId: lead.id, name: p.name, address: `${lead.address}, ${p.city}`, closer: p.closer, status: i % 4 === 0 ? "Open" : "Complete" };
  return { row, lead };
});

export const rosterAssessments: RosterAssessment[] = assessmentBuilt.map((a) => a.row);

export const rosterAssessmentLeads: Lead[] = assessmentBuilt.map((a) => a.lead);

export const STAGES = [
  { stage: "Proposal out", tone: "navy" as Tone },
  { stage: "Decision", tone: "navy" as Tone },
  { stage: "One legger", tone: "alert" as Tone },
  { stage: "Waiting HOA", tone: "alert" as Tone },
];

export const JOBS = ["Sold", "Permit", "Materials", "Scheduled", "In progress", "Test-out", "Punch", "Invoiced", "On hold"];
