import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import { offices } from "@/lib/dispatch-data";
import cozyMap from "@/features/dispatch/map-style.json";
import { AERIAL, MapCtor, pathData, boundsOf, placeMarks, type MapView, type StreetPath, type MapPerson, type MapHouse } from "./part-01";
import { stepFns } from "./step-fns";
import { useMapStep1 } from "./step_01";
import { useMapStep2 } from "./step_02";
import { useMapStep3 } from "./step_03";

export function DispatchMap(__p0: {
  office: "PHX" | "DFW" | "all";
  view: MapView;
  people: MapPerson[];
  houses: MapHouse[];
  paths: StreetPath[];
  selectedId: string | null;
  selectedStopId: string | null;
  showAll: boolean;
  onSelect: (id: string) => void;
  onPickStop: (resourceId: string, stopId: string) => void;
}) {
  const ctx: any = {};
  { const {
  office,
  view,
  people,
  houses,
  paths,
  selectedId,
  selectedStopId,
  showAll,
  onSelect,
  onPickStop,
} = __p0; ctx.office = office; ctx.view = view; ctx.people = people; ctx.houses = houses; ctx.paths = paths; ctx.selectedId = selectedId; ctx.selectedStopId = selectedStopId; ctx.showAll = showAll; ctx.onSelect = onSelect; ctx.onPickStop = onPickStop; }
  const __h0 = stepFns(ctx);
  const __h1 = useMapStep1(ctx);
  const __h2 = useMapStep2(ctx);
  const __h3 = useMapStep3(ctx);
  if (__h0 && __h0.__halt) return __h0.__ret;
  if (__h1 && __h1.__halt) return __h1.__ret;
  if (__h2 && __h2.__halt) return __h2.__ret;
  if (__h3 && __h3.__halt) return __h3.__ret;
}
