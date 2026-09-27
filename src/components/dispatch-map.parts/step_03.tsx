import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import { offices } from "@/lib/dispatch-data";
import cozyMap from "@/features/dispatch/map-style.json";
import { AERIAL, MapCtor, pathData, boundsOf, placeMarks, type MapView, type StreetPath, type MapPerson, type MapHouse } from "./part-01";

export function useMapStep3(ctx: any): any {
useEffect(() => {
    const map = ctx.mapRef.current;
    const src = map?.getSource("routes") as maplibregl.GeoJSONSource | undefined;
    src?.setData(pathData(ctx.paths));
  }, [ctx.paths]);
useEffect(() => {
    const map = ctx.mapRef.current;
    if (!map) return;
    ctx.paintLines(map, ctx.showAll ? null : ctx.selectedId);
  }, [ctx.selectedId, ctx.showAll]);
useEffect(() => {
    const map = ctx.mapRef.current;
    if (!map || !ctx.showAll) return;
    ctx.fitAll(map);
  }, [ctx.showAll]);
useEffect(() => {
    const map = ctx.mapRef.current;
    if (!map || ctx.showAll || !ctx.selectedStopId) return;
    const hit = ctx.houses.find((s: any) => s.id === ctx.selectedStopId);
    if (!hit) return;
    map.easeTo({ center: [hit.lng, hit.lat], zoom: 16.4, duration: 300, pitch: ctx.view === "3d" ? 52 : 0 });
  }, [ctx.selectedStopId, ctx.showAll, ctx.view, ctx.houses]);
return { __halt: true as const, __ret: <div ref={ctx.wrap} className="dispatch-map h-full min-h-0 w-full" /> }
}
