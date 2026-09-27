import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import { offices } from "@/lib/dispatch-data";
import cozyMap from "@/features/dispatch/map-style.json";
import { AERIAL, MapCtor, pathData, boundsOf, placeMarks, type MapView, type StreetPath, type MapPerson, type MapHouse } from "./part-01";

export function stepFns(ctx: any): any {
ctx.drawMarks = function drawMarks(map: maplibregl.Map) {
    const sig =
      ctx.peopleRef.current.map((p: any) => `${p.id}:${p.lat}:${p.lng}:${p.late ? 1 : 0}`).join("|") +
      "#" +
      ctx.housesRef.current.map((h: any) => `${h.id}:${h.lat}:${h.lng}`).join("|") +
      "#" +
      ctx.office;
    if (ctx.marksSig.current === sig) return;
    ctx.marksSig.current = sig;
    ctx.marksRef.current.forEach((m: any) => m.remove());
    ctx.marksRef.current = placeMarks(map, ctx.office, ctx.peopleRef.current, ctx.housesRef.current, (id) => ctx.onSelectRef.current(id), (a, b) => ctx.onStopRef.current(a, b));
  };
ctx.paintLines = function paintLines(map: maplibregl.Map, id: string | null) {
    if (!map.getLayer("routes-line")) return;
    map.setPaintProperty("routes-line", "line-opacity", id ? ["match", ["get", "id"], id, 0.95, 0.38] : 0.85);
    map.setPaintProperty("routes-line", "line-width", id ? ["match", ["get", "id"], id, 5, 2.5] : 3.5);
  };
ctx.fitAll = function fitAll(map: maplibregl.Map) {
    const b = boundsOf(ctx.pathsRef.current, ctx.peopleRef.current, ctx.housesRef.current);
    if (!b) return;
    map.fitBounds(b, { padding: 56, maxZoom: 12.2, duration: 0, pitch: ctx.view === "3d" ? 48 : 0 });
  };
}
