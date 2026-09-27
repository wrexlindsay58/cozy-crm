type Row = { id: string; name: string; note: string };

export let reduction: Row[] = [
  { id: "RI-1", name: "Attic install", note: "Baffles → blow → photos" },
  { id: "RI-2", name: "Air seal install", note: "Can lights → top plates" },
];

export let pins: Row[] = [
  { id: "PN-1", name: "Home", note: "Canvass pin" },
  { id: "PN-2", name: "Not home", note: "Canvass pin" },
  { id: "PN-3", name: "Not interested", note: "Canvass pin" },
];

export function write_reduction(__v: any) { reduction = __v; }

export function write_pins(__v: any) { pins = __v; }
