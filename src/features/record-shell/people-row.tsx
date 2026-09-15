import type { PersonRef } from "@/lib/file-data";

function Initials({ name }: { name: string }) {
  const bits = name.split(" ").filter(Boolean);
  const letters = ((bits[0]?.[0] ?? "") + (bits[1]?.[0] ?? "")).toUpperCase();
  return (
    <span className="grid size-7 place-items-center rounded-full bg-navy text-[10px] font-bold text-card">
      {letters}
    </span>
  );
}

export function PeopleRow({ owner, followers }: { owner: PersonRef; followers: PersonRef[] }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-line bg-card px-4 py-2 md:px-5">
      <div className="flex items-center gap-2">
        <Initials name={owner.name} />
        <div>
          <p className="text-[10px] font-bold tracking-wide text-muted uppercase">Owner</p>
          <p className="text-sm font-semibold">{owner.name}</p>
        </div>
      </div>
      <span className="hidden h-6 w-px bg-line sm:block" />
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[10px] font-bold tracking-wide text-muted uppercase">Followers</p>
        {followers.length === 0 ? <p className="text-sm text-muted">None</p> : null}
        {followers.map((f) => (
          <span key={f.name} className="inline-flex items-center gap-1.5 text-sm">
            <Initials name={f.name} />
            <span className="font-medium">{f.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
