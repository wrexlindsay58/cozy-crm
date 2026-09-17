import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/cn";
import { offices, shop } from "@/lib/dispatch-data";
import { HEX } from "@/lib/tokens";

export type MapView = "base" | "aerial" | "3d";
export type StreetPath = { unitId: string; color: string; coords: [number, number][] };
export type MapPerson = { id: string; name: string; initials: string; lat: number; lng: number; color: string };
export type MapHouse = { id: string; resourceId: string; lat: number; lng: number; label: string; color: string };

const AERIAL = {
  version: 8 as const,
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sources: {
    esri: {
      type: "raster" as const,
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "Tiles © Esri",
      maxzoom: 19,
    },
  },
  layers: [{ id: "esri", type: "raster" as const, source: "esri" }],
};

const STYLE: Record<MapView, string | typeof AERIAL> = {
  base: "https://tiles.openfreemap.org/styles/dark",
  aerial: AERIAL,
  "3d": "https://tiles.openfreemap.org/styles/dark",
};

function pathData(paths: StreetPath[]) {
  return {
    type: "FeatureCollection" as const,
    features: paths
      .filter((p) => p.coords.length > 1)
      .map((p) => ({
        type: "Feature" as const,
        properties: { color: p.color },
        geometry: { type: "LineString" as const, coordinates: p.coords },
      })),
  };
}

function placeMarks(
  map: maplibregl.Map,
  office: "PHX" | "DFW" | "all",
  people: MapPerson[],
  houses: MapHouse[],
  onSelect: (id: string) => void,
  onStop: (resourceId: string, stopId: string) => void,
) {
  const marks: maplibregl.Marker[] = [];
  const shops = office === "all" ? [shop.PHX, shop.DFW] : [shop[office]];
  shops.forEach((shopPt) => {
    const shopEl = document.createElement("div");
    shopEl.className = "dispatch-shop";
    shopEl.title = shopPt.name;
    marks.push(new maplibregl.Marker({ element: shopEl }).setLngLat([shopPt.lng, shopPt.lat]).addTo(map));
  });
  houses.forEach((s) => {
    const house = document.createElement("button");
    house.type = "button";
    house.className = "dispatch-house";
    house.title = s.label;
    house.innerHTML = `<span style="background:${s.color}">${s.label.slice(0, 1)}</span>`;
    house.addEventListener("click", (ev) => {
      ev.stopPropagation();
      onStop(s.resourceId, s.id);
    });
    marks.push(new maplibregl.Marker({ element: house, anchor: "bottom" }).setLngLat([s.lng, s.lat]).addTo(map));
  });
  people.forEach((u) => {
    const pin = document.createElement("button");
    pin.type = "button";
    pin.className = "dispatch-pin";
    pin.style.background = u.color;
    pin.textContent = u.initials;
    pin.title = u.name;
    pin.addEventListener("click", (ev) => {
      ev.stopPropagation();
      onSelect(u.id);
    });
    marks.push(new maplibregl.Marker({ element: pin, anchor: "center" }).setLngLat([u.lng, u.lat]).addTo(map));
  });
  return marks;
}

export function DispatchMap({
  office,
  view,
  people,
  houses,
  paths,
  selectedId,
  selectedStopId,
  onSelect,
  onPickStop,
}: {
  office: "PHX" | "DFW" | "all";
  view: MapView;
  people: MapPerson[];
  houses: MapHouse[];
  paths: StreetPath[];
  selectedId: string | null;
  selectedStopId: string | null;
  onSelect: (id: string) => void;
  onPickStop: (resourceId: string, stopId: string) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const marksRef = useRef<maplibregl.Marker[]>([]);
  const peopleRef = useRef(people);
  const housesRef = useRef(houses);
  const pathsRef = useRef(paths);
  const onSelectRef = useRef(onSelect);
  const onStopRef = useRef(onPickStop);
  peopleRef.current = people;
  housesRef.current = houses;
  pathsRef.current = paths;
  onSelectRef.current = onSelect;
  onStopRef.current = onPickStop;

  function drawMarks(map: maplibregl.Map) {
    marksRef.current.forEach((m) => m.remove());
    marksRef.current = placeMarks(map, office, peopleRef.current, housesRef.current, (id) => onSelectRef.current(id), (a, b) => onStopRef.current(a, b));
  }

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const center = office === "all" ? { lat: 33.2, lng: -104.6, zoom: 5.4 } : offices[office];
    const map = new maplibregl.Map({
      container: el,
      style: STYLE[view] as never,
      center: [center.lng, center.lat],
      zoom: view === "3d" && office !== "all" ? 15.4 : center.zoom,
      pitch: view === "3d" ? 58 : 0,
      bearing: view === "3d" ? -16 : 0,
      maxPitch: 80,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(el);
    const tick = window.setTimeout(() => map.resize(), 80);

    function ready() {
      if (view === "3d") {
        try {
          const layers = map.getStyle().layers ?? [];
          const label = layers.find((l: { type: string; id: string }) => l.type === "symbol")?.id;
          if (!map.getLayer("3d-buildings") && map.getSource("openmaptiles")) {
            map.addLayer(
              {
                id: "3d-buildings",
                source: "openmaptiles",
                "source-layer": "building",
                type: "fill-extrusion",
                minzoom: 14,
                paint: {
                  "fill-extrusion-color": "#5a6570",
                  "fill-extrusion-height": ["coalesce", ["get", "render_height"], ["get", "height"], 10],
                  "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
                  "fill-extrusion-opacity": 0.8,
                },
              },
              label,
            );
          }
        } catch {
          /* pitched map still works */
        }
      }
      if (map.getSource("routes")) {
        map.removeLayer("routes-line");
        map.removeSource("routes");
      }
      map.addSource("routes", { type: "geojson", data: pathData(pathsRef.current) });
      map.addLayer({
        id: "routes-line",
        type: "line",
        source: "routes",
        paint: { "line-color": ["get", "color"], "line-width": 4, "line-opacity": 0.9 },
      });
      drawMarks(map);
      map.resize();
    }
    map.on("load", ready);

    return () => {
      window.clearTimeout(tick);
      ro.disconnect();
      marksRef.current.forEach((m) => m.remove());
      marksRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [office, view]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    drawMarks(map);
  }, [people, houses, office]);

  useEffect(() => {
    const map = mapRef.current;
    const src = map?.getSource("routes") as maplibregl.GeoJSONSource | undefined;
    src?.setData(pathData(paths));
  }, [paths]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const hit = houses.find((s) => s.id === selectedStopId);
    if (hit) {
      map.flyTo({ center: [hit.lng, hit.lat], zoom: 17.2, pitch: view === "3d" ? 60 : 0, duration: 700 });
      return;
    }
    const u = people.find((x) => x.id === selectedId);
    if (!u) return;
    map.flyTo({ center: [u.lng, u.lat], zoom: view === "3d" ? 15.6 : 12.4, pitch: view === "3d" ? 58 : 0, duration: 600 });
  }, [selectedId, selectedStopId, office, view, houses, people]);

  return <div ref={wrap} className={cn("dispatch-map absolute inset-0 h-full w-full", view === "aerial" ? "dispatch-map-aerial" : "dispatch-map-ink")} />;
}

export function statusColor(status: string) {
  if (status === "late" || status === "Behind") return HEX.stop;
  if (status === "en-route" || status === "Dispatched") return HEX.watch;
  if (status === "on-site") return HEX.navy;
  if (status === "done" || status === "Done") return HEX.go;
  return HEX.idle;
}

export function streetViewSrc(lat: number, lng: number) {
  return `https://maps.google.com/maps?layer=c&cbll=${lat},${lng}&cbp=12,90,0,0,0&output=svembed`;
}
