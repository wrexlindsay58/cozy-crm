
const GROUPS = [
  {
    title: "Shop",
    links: [
      { to: "/settings/company", title: "Company", note: "Name, fiscal year, dealer fee" },
      { to: "/settings/general", title: "General", note: "Shop flags from Odin GeneralSettings" },
      { to: "/settings/dealers", title: "Dealers", note: "Cozy AZ / Cozy TX" },
      { to: "/settings/dealership", title: "Dealership profile", note: "License, hours" },
      { to: "/settings/offices", title: "Offices", note: "Phoenix, Scottsdale, Dallas, Fort Worth" },
      { to: "/settings/pins", title: "Canvass pins", note: "Home / not home / NI" },
      { to: "/settings/territories", title: "Territories", note: "ZIP lists for geo reports" },
      { to: "/settings/sources", title: "Sources", note: "Canvass, Google, partner" },
    ],
  },
  {
    title: "People",
    links: [
      { to: "/settings/people", title: "People", note: "Role, office, on/off book" },
      { to: "/settings/roles", title: "Roles", note: "Owner, closer, setter, PM, crew" },
      { to: "/settings/positions", title: "Positions", note: "Odin EmployeePositions" },
      { to: "/settings/permissions", title: "Permissions", note: "See cost, take card, edit catalog" },
      { to: "/settings/crew-roster", title: "Crew roster", note: "Trucks. Dispatch still assigns." },
      { to: "/settings/leaderboard-points", title: "Leaderboard points", note: "Sold / set scoring" },
      { to: "/settings/departments", title: "Departments", note: "Sales, production" },
      { to: "/settings/my-team", title: "My team", note: "Who a manager sees" },
      { to: "/settings/calendar-filters", title: "Calendar filters", note: "Book tabs" },
      { to: "/settings/goals", title: "Goals", note: "Sold / set targets" },
      { to: "/settings/installers", title: "Installers", note: "In-house + subs" },
    ],
  },
  {
    title: "Money",
    links: [
      { to: "/settings/pricebook", title: "Products and pricing", note: "Catalog, HVAC, roof, adders. No separate roof/HVAC admin." },
      { to: "/settings/financers", title: "Financers", note: "GoodLeap dealer fee + cash / 12-mo" },
      { to: "/settings/terms", title: "Payment terms", note: "Deposit / progress / final" },
      { to: "/settings/commission", title: "Commission", note: "Writes the job cost line" },
      { to: "/settings/visits", title: "Visits and memberships", note: "Service fee vs cost" },
      { to: "/settings/rate-plans", title: "Membership plans", note: "Comfort / Comfort Plus" },
      { to: "/settings/discounts", title: "Discounts and rebates", note: "Veteran, APS, Oncor" },
      { to: "/settings/extra-costs", title: "Additional costs", note: "Permit, dump run" },
      { to: "/settings/catalog-extras", title: "Catalog extras", note: "Types, manufacturers, utilities" },
    ],
  },
  {
    title: "Pipeline",
    links: [
      { to: "/settings/dispositions", title: "Dispositions", note: "Unmarked, no sit, sold" },
      { to: "/settings/ticket-types", title: "Ticket categories", note: "Permit, HOA, callback" },
      { to: "/settings/templates", title: "Document templates", note: "Proposal, agreement names" },
      { to: "/settings/workflows", title: "Workflows and forms", note: "Assessment + install forms" },
      { to: "/settings/buckets", title: "Pipeline buckets", note: "Needs disposition, proposal out" },
      { to: "/settings/task-categories", title: "Task categories", note: "Not the same as tickets" },
      { to: "/settings/sections", title: "File sections", note: "Property, qualifying" },
      { to: "/settings/reduction-installs", title: "Reduction installs", note: "Attic / air-seal job steps" },
    ],
  },
  {
    title: "Comms",
    links: [
      { to: "/settings/notifications", title: "Notifications", note: "Booked, ran, sold, install" },
      { to: "/settings/reminders", title: "Reminders", note: "Minutes-out text. No live Twilio." },
      { to: "/settings/numbers", title: "From-numbers", note: "Office caller ID skins" },
      { to: "/settings/notification-stages", title: "Notification stages", note: "Who gets booked / sold" },
      { to: "/settings/notification-templates", title: "Notification templates", note: "The actual text" },
    ],
  },
];

export function SettingsHub() {
  return (
    <div className="space-y-4">
      {GROUPS.map((g) => (
        <section key={g.title}>
          <h2 className="mb-2 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">{g.title}</h2>
          <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-card">
            {g.links.map((l) => (
              <li key={l.to}>
                <a href={l.to} className="block px-4 py-3 hover:bg-page">
                  <p className="font-semibold">{l.title}</p>
                  <p className="text-sm text-muted">{l.note}</p>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
