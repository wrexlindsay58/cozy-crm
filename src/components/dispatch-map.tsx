import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { offices, shop } from "@/lib/dispatch-data";
import { HEX } from "@/lib/tokens";
import cozyMap from "@/features/dispatch/map-style.json";

export type MapView = "base" | "aerial" | "3d";
export type StreetPath = { unitId: string; color: string; coords: [number, number][] };
export type MapPerson = { id: string; name: string; initials: string; lat: number; lng: number; color: string; late?: boolean };
export type MapHouse = { id: string; resourceId: string; lat: number; lng: number; label: string; color: string };

const AERIAL = {
  version: 8 as const,
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
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
};

function MapCtor() {
  const m = maplibregl as unknown as { Map: typeof maplibregl.Map; default?: { Map: typeof maplibregl.Map } };
  return m.Map ?? m.default?.Map;
}

function pathData(paths: StreetPath[]) {
  return {
    type: "FeatureCollection" as const,
    features: paths
      .filter((p) => p.coords.length > 1)
      .map((p) => ({
        type: "Feature" as const,
        properties: { color: p.color, id: p.unitId },
        geometry: { type: "LineString" as const, coordinates: p.coords },
      })),
  };
}

function boundsOf(paths: StreetPath[], people: MapPerson[], houses: MapHouse[]) {
  const Ctor = maplibregl as unknown as { LngLatBounds: typeof maplibregl.LngLatBounds; default?: { LngLatBounds: typeof maplibregl.LngLatBounds } };
  const Bounds = Ctor.LngLatBounds ?? Ctor.default?.LngLatBounds;
  if (!Bounds) return null;
  const b = new Bounds();
  let n = 0;
  paths.forEach((p) =>
    p.coords.forEach((c) => {
      b.extend(c);
      n += 1;
    }),
  );
  people.forEach((u) => {
    b.extend([u.lng, u.lat]);
    n += 1;
  });
  houses.forEach((h) => {
    b.extend([h.lng, h.lat]);
    n += 1;
  });
  return n ? b : null;
}

function placeMarks(
  map: maplibregl.Map,
  office: "PHX" | "DFW" | "all",
  people: MapPerson[],
  houses: MapHouse[],
  onSelect: (id: string) => void,
  onStop: (resourceId: string, stopId: string) => void,
) {
  const Marker = (maplibregl as unknown as { Marker: typeof maplibregl.Marker; default?: { Marker: typeof maplibregl.Marker } }).Marker ?? (maplibregl as unknown as { default: { Marker: typeof maplibregl.Marker } }).default.Marker;
  const marks: maplibregl.Marker[] = [];
  const shops = office === "all" ? [shop.PHX, shop.DFW] : [shop[office]];
  shops.forEach((shopPt) => {
    const shopEl = document.createElement("div");
    shopEl.className = "dispatch-shop";
    shopEl.title = shopPt.name;
    marks.push(new Marker({ element: shopEl }).setLngLat([shopPt.lng, shopPt.lat]).addTo(map));
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
    marks.push(new Marker({ element: house, anchor: "bottom" }).setLngLat([s.lng, s.lat]).addTo(map));
  });
  people.forEach((u) => {
    const pin = document.createElement("button");
    pin.type = "button";
    pin.className = u.late ? "dispatch-pin is-behind" : "dispatch-pin";
    pin.style.background = u.color;
    pin.textContent = u.initials;
    pin.title = u.name;
    pin.addEventListener("click", (ev) => {
      ev.stopPropagation();
      onSelect(u.id);
    });
    marks.push(new Marker({ element: pin, anchor: "center" }).setLngLat([u.lng, u.lat]).addTo(map));
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
  showAll,
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
  showAll: boolean;
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

  function paintLines(map: maplibregl.Map, id: string | null) {
    if (!map.getLayer("routes-line")) return;
    map.setPaintProperty("routes-line", "line-opacity", id ? ["match", ["get", "id"], id, 0.95, 0.38] : 0.85);
    map.setPaintProperty("routes-line", "line-width", id ? ["match", ["get", "id"], id, 5, 2.5] : 3.5);
  }

  function fitAll(map: maplibregl.Map) {
    const b = boundsOf(pathsRef.current, peopleRef.current, housesRef.current);
    if (!b) return;
    map.fitBounds(b, { padding: 56, maxZoom: 12.2, duration: 500, pitch: view === "3d" ? 48 : 0 });
  }

  useEffect(() => {
    const el = wrap.current;
    const Ctor = MapCtor();
    if (!el || !Ctor) return;
    const center = office === "all" ? { lat: 33.2, lng: -104.6, zoom: 5.4 } : offices[office];
    const map = new Ctor({
      container: el,
      style: (view === "aerial" ? AERIAL : cozyMap) as never,
      center: [center.lng, center.lat],
      zoom: view === "3d" && office !== "all" ? 14.2 : center.zoom,
      pitch: view === "3d" ? 52 : 0,
      bearing: view === "3d" ? -16 : 0,
      maxPitch: 80,
      attributionControl: { compact: true },
    });
    el.style.background = "#f7fafb";
    mapRef.current = map;
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(el);
    const tick = window.setTimeout(() => map.resize(), 80);
    const tick2 = window.setTimeout(() => map.resize(), 400);

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
                  "fill-extrusion-color": "#d7e0e5",
                  "fill-extrusion-height": ["coalesce", ["get", "render_height"], ["get", "height"], 10],
                  "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
                  "fill-extrusion-opacity": 0.85,
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
        if (map.getLayer("routes-line")) map.removeLayer("routes-line");
        map.removeSource("routes");
      }
      map.addSource("routes", { type: "geojson", data: pathData(pathsRef.current) });
      map.addLayer({
        id: "routes-line",
        type: "line",
        source: "routes",
        paint: { "line-color": ["get", "color"], "line-width": 3.5, "line-opacity": 0.85 },
      });
      drawMarks(map);
      map.resize();
      fitAll(map);
    }
    map.on("load", ready);

    return () => {
      window.clearTimeout(tick);
      window.clearTimeout(tick2);
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
    if (map && showAll) fitAll(map);
  }, [paths, showAll]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    paintLines(map, showAll ? null : selectedId);
    if (showAll) {
      fitAll(map);
      return;
    }
    const hit = houses.find((s) => s.id === selectedStopId);
    if (hit) {
      map.flyTo({ center: [hit.lng, hit.lat], zoom: 16.4, pitch: view === "3d" ? 52 : 0, duration: 500 });
    }
  }, [selectedId, selectedStopId, showAll, view, houses]);

  return <div ref={wrap} className="dispatch-map h-full min-h-[22rem] w-full" />;
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
