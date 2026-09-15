export type NavItem = {
  label: string;
  to: string;
};

export type NavGroup = {
  label: "Daily" | "Pipeline" | "Money" | "Company";
  items: NavItem[];
};

export const NAV: NavGroup[] = [
  {
    label: "Daily",
    items: [
      { label: "Today", to: "/" },
      { label: "Inbox", to: "/conversations" },
      { label: "Book", to: "/calendar" },
      { label: "Map", to: "/dispatch" },
    ],
  },
  {
    label: "Pipeline",
    items: [
      { label: "Leads", to: "/leads" },
      { label: "Appointments", to: "/appointments" },
      { label: "Assessments", to: "/assessments" },
      { label: "Opportunities", to: "/opportunities" },
      { label: "Jobs", to: "/projects" },
      { label: "Accounts", to: "/accounts" },
    ],
  },
  {
    label: "Money",
    items: [
      { label: "Sales", to: "/scoreboard" },
      { label: "Invoices", to: "/invoices" },
      { label: "Purchasing", to: "/purchasing" },
    ],
  },
  {
    label: "Company",
    items: [
      { label: "Leaderboard", to: "/leaderboard" },
      { label: "Crews", to: "/crews" },
      { label: "Team", to: "/team" },
      { label: "Tickets", to: "/tickets" },
      { label: "Reports", to: "/reports" },
      { label: "Settings", to: "/settings" },
    ],
  },
];

export function activePath(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}
