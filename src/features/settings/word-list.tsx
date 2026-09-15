import { useState } from "react";

export function WordList({
  items,
  onAdd,
}: {
  items: string[];
  onAdd: (name: string) => void;
}) {
  const [name, setName] = useState("");
  return (
    <div className="rounded-md border border-line bg-card p-4">
      <ul className="mb-3 space-y-1 text-sm">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onAdd(name);
          setName("");
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} className="h-11 flex-1 rounded-md border border-line px-3 text-sm" />
        <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">
          Add
        </button>
      </form>
    </div>
  );
}
