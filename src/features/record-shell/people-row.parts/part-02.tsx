import { Tip } from "@/components/tip";
import { addDepartment } from "@/features/staff/store";
import { Initials } from "./part-01";

export function PeopleRowView(props: { bag: { pick: any; setPick: any; people: any; departments: any; addFollowPerson: any; setMode: any; newFollow: any; setNewFollow: any } }) {
  const { pick, setPick, people, departments, addFollowPerson, setMode, newFollow, setNewFollow } = props.bag;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
          <select value={pick} onChange={(e) => setPick(e.target.value)} className="h-11 min-w-40 rounded-md border border-line bg-card px-3 text-sm">
            <optgroup label="People">
              {people.map((p: any) => (
                <option key={p.name} value={`p:${p.name}`}>
                  {p.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Departments">
              {departments.map((d: any) => (
                <option key={d} value={`d:${d}`}>
                  {d}
                </option>
              ))}
            </optgroup>
          </select>
          <button
            type="button"
            className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card"
            onClick={() => {
              if (pick.startsWith("d:")) {
                addFollowPerson(pick.slice(2), "Dept");
              } else {
                const name = pick.startsWith("p:") ? pick.slice(2) : pick;
                const p = people.find((x: any) => x.name === name);
                addFollowPerson(p?.name ?? name, p?.role ?? "Follow");
              }
              setMode("idle");
            }}
          >
            Add
          </button>
          <input
            value={newFollow}
            onChange={(e) => setNewFollow(e.target.value)}
            placeholder="New follower or department"
            className="h-11 min-w-40 flex-1 rounded-md border border-line px-3 text-sm"
          />
          <button
            type="button"
            className="h-11 rounded-md border border-line px-3 text-sm font-semibold"
            onClick={() => {
              const name = newFollow.trim();
              if (!name) return;
              addDepartment(name);
              addFollowPerson(name, "Dept");
              setNewFollow("");
              setMode("idle");
            }}
          >
            Add new
          </button>
        </div>
  );
}

export function PeopleRowView2(props: { bag: { owner: any; list: any; peopleActs: any } }) {
  const { owner, list, peopleActs } = props.bag;
  return (
    <div className="flex flex-col gap-2 md:hidden">
        <div className="flex items-start gap-6">
          <div className="shrink-0">
            <p className="text-[10px] font-bold tracking-wide text-muted uppercase">Owner</p>
            <Tip label={owner.name} on>
              <span className="mt-0.5 inline-flex shrink-0" aria-label={`Owner ${owner.name}`}>
                <Initials name={owner.name} />
              </span>
            </Tip>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold tracking-wide text-muted uppercase">Followers</p>
            <div className="mt-0.5 flex min-w-0 items-center justify-end gap-1.5 overflow-x-auto">
              {list.length === 0 ? <p className="text-sm text-muted">None</p> : null}
              {list.map((f: any) => (
                <Tip key={f.name} label={f.name} on>
                  <span className="shrink-0" aria-label={f.name}>
                    <Initials name={f.name} />
                  </span>
                </Tip>
              ))}
            </div>
          </div>
        </div>
        {peopleActs(true)}
      </div>
  );
}
