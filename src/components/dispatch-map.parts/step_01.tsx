import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import { offices } from "@/lib/dispatch-data";
import cozyMap from "@/features/dispatch/map-style.json";
import { AERIAL, MapCtor, pathData, boundsOf, placeMarks, type MapView, type StreetPath, type MapPerson, type MapHouse } from "./part-01";

export function useMapStep1(ctx: any): any {
ctx.wrap = useRef<HTMLDivElement>(null);
ctx.mapRef = useRef<maplibregl.Map | null>(null);
ctx.marksRef = useRef<maplibregl.Marker[]>([]);
ctx.marksSig = useRef("");
ctx.peopleRef = useRef(ctx.people);
ctx.housesRef = useRef(ctx.houses);
ctx.pathsRef = useRef(ctx.paths);
ctx.onSelectRef = useRef(ctx.onSelect);
ctx.onStopRef = useRef(ctx.onPickStop);
ctx.peopleRef.current = ctx.people;
ctx.housesRef.current = ctx.houses;
ctx.pathsRef.current = ctx.paths;
ctx.onSelectRef.current = ctx.onSelect;
ctx.onStopRef.current = ctx.onPickStop;
}
