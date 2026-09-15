import { useState } from "react";
import { addCategory, addField, toggleCategory, useAssessCategories } from "./categories";

export function AssessmentCategorySettings() {
  const cats = useAssessCategories();
  const [name, setName] = useState("");
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">These show on every assessment. Turn one off and it leaves the file. Fields are what the closer fills on that category.</p>
      {cats.map((c) => (
        <CategoryRow key={c.id} cat={c} />
      ))}
      <form
        className="flex flex-col gap-2 rounded-md border border-line bg-card p-4 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          addCategory(name);
          setName("");
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category"
          className="h-11 min-w-0 flex-1 rounded-md border border-line px-3 text-sm outline-none focus:border-navy"
        />
        <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">
          Add category
        </button>
      </form>
    </div>
  );
}

function CategoryRow({ cat }: { cat: ReturnType<typeof useAssessCategories>[number] }) {
  const [field, setField] = useState("");
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">{cat.label}</h2>
        <button type="button" onClick={() => toggleCategory(cat.id)} className="h-9 rounded-md border border-line px-3 text-[11px] font-semibold">
          {cat.on ? "On" : "Off"}
        </button>
      </div>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {cat.fields.map((f) => (
          <li key={f.id} className="h-7 rounded-md bg-page px-2 text-[11px] font-semibold leading-7">
            {f.label}
          </li>
        ))}
        {cat.fields.length === 0 ? <li className="text-sm text-muted">No fields yet.</li> : null}
      </ul>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          addField(cat.id, field);
          setField("");
        }}
      >
        <input
          value={field}
          onChange={(e) => setField(e.target.value)}
          placeholder="New field"
          className="h-11 min-w-0 flex-1 rounded-md border border-line px-3 text-sm outline-none focus:border-navy"
        />
        <button type="submit" className="h-11 rounded-md border border-line px-3 text-sm font-semibold">
          Add field
        </button>
      </form>
    </section>
  );
}
