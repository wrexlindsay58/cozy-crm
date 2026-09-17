import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { offices, routes, shop, stops, units, type Unit } from "@/lib/dispatch-data";
import { HEX } from "@/lib/tokens";

export type MapView = "base" | "aerial" | "3d";

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
  base: "https://tiles.openfreemap.org/styles/liberty",
  aerial: AERIAL,
  "3d": "https://tiles.openfreemap.org/styles/liberty",
};

const STATUS_HEX: Record<string, string> = {
  idle: HEX.idle,
  "en-route": HEX.watch,
  "on-site": HEX.navy,
  late: HEX.stop,
  done: HEX.go,
};

function paint(map: maplibregl.Map, office: "PHX" | "DFW", view: MapView, onSelect: (id: string) => void, onStop: (unitId: string, stopId: string) => void) {
  const here = units.filter((u) => u.office === office);
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
              "fill-extrusion-color": "#c5ccd3",
              "fill-extrusion-height": ["coalesce", ["get", "render_height"], ["get", "height"], 10],
              "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
              "fill-extrusion-opacity": 0.86,
            },
          },
          label,
        );
      }
    } catch {
      /* pitched map still works */
    }
  }
  const feats = here
    .filter((u) => routes[u.id])
    .map((u) => ({
      type: "Feature" as const,
      properties: { id: u.id },
      geometry: { type: "LineString" as const, coordinates: routes[u.id] },
    }));
  if (map.getSource("routes")) map.removeLayer("routes-line"), map.removeSource("routes");
  map.addSource("routes", { type: "geojson", data: { type: "FeatureCollection", features: feats } });
  map.addLayer({
    id: "routes-line",
    type: "line",
    source: "routes",
    paint: { "line-color": HEX.navy, "line-width": 3, "line-opacity": 0.75 },
  });

  const marks: maplibregl.Marker[] = [];
  const shopPt = shop[office];
  const shopEl = document.createElement("div");
  shopEl.className = "dispatch-shop";
  shopEl.title = shopPt.name;
  marks.push(new maplibregl.Marker({ element: shopEl }).setLngLat([shopPt.lng, shopPt.lat]).addTo(map));
  here.forEach((u) => {
    (stops[u.id] ?? []).forEach((s) => {
      const house = document.createElement("button");
      house.type = "button";
      house.className = "dispatch-house";
      house.title = s.name;
      house.innerHTML = `<span>${s.name.slice(0, 1)}</span>`;
      house.addEventListener("click", (ev) => {
        ev.stopPropagation();
        onStop(u.id, s.id);
      });
      marks.push(new maplibregl.Marker({ element: house, anchor: "bottom" }).setLngLat([s.lng, s.lat]).addTo(map));
    });
    const pin = document.createElement("button");
    pin.type = "button";
    pin.className = "dispatch-pin";
    pin.style.background = STATUS_HEX[u.status];
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
  selectedId,
  selectedStopId,
  onSelect,
  onPickStop,
}: {
  office: "PHX" | "DFW";
  view: MapView;
  selectedId: string | null;
  selectedStopId: string | null;
  onSelect: (id: string) => void;
  onPickStop: (unitId: string, stopId: string) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const onSelectRef = useRef(onSelect);
  const onStopRef = useRef(onPickStop);
  onSelectRef.current = onSelect;
  onStopRef.current = onPickStop;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const center = offices[office];
    const map = new maplibregl.Map({
      container: el,
      style: STYLE[view] as never,
      center: [center.lng, center.lat],
      zoom: view === "3d" ? 15.4 : center.zoom,
      pitch: view === "3d" ? 58 : 0,
      bearing: view === "3d" ? -16 : 0,
      maxPitch: 80,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    const marks: maplibregl.Marker[] = [];
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(el);
    const tick = window.setTimeout(() => map.resize(), 80);

    function ready() {
      marks.splice(0).forEach((m) => m.remove());
      marks.push(...paint(map, office, view, (id) => onSelectRef.current(id), (a, b) => onStopRef.current(a, b)));
      map.resize();
    }
    map.on("load", ready);

    return () => {
      window.clearTimeout(tick);
      ro.disconnect();
      marks.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, [office, view]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (selectedStopId) {
      const hit = Object.values(stops)
        .flat()
        .find((s) => s.id === selectedStopId);
      if (hit) map.flyTo({ center: [hit.lng, hit.lat], zoom: 17.2, pitch: view === "3d" ? 60 : 0, duration: 700 });
      return;
    }
    const u = units.find((x) => x.id === selectedId);
    if (!u || u.office !== office) return;
    map.flyTo({ center: [u.lng, u.lat], zoom: view === "3d" ? 15.6 : 12.4, pitch: view === "3d" ? 58 : 0, duration: 600 });
  }, [selectedId, selectedStopId, office, view]);

  return <div ref={wrap} className="dispatch-map absolute inset-0 h-full w-full" />;
}

export function unitColor(u: Unit) {
  return STATUS_HEX[u.status];
}

export function streetViewSrc(lat: number, lng: number) {
  return `https://maps.google.com/maps?layer=c&cbll=${lat},${lng}&cbp=12,90,0,0,0&output=svembed`;
}
