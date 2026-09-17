import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { offices, routes, shop, stops, units, type Unit } from "@/lib/dispatch-data";
import { HEX } from "@/lib/tokens";

export type MapView = "base" | "aerial" | "3d";

const AERIAL = {
  version: 8 as const,
  sources: {
    esri: {
      type: "raster" as const,
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "Tiles © Esri",
    },
  },
  layers: [{ id: "esri", type: "raster" as const, source: "esri" }],
};

const BASE = {
  version: 8 as const,
  sources: {
    carto: {
      type: "raster" as const,
      tiles: [
        "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap © CARTO",
    },
  },
  layers: [{ id: "carto", type: "raster" as const, source: "carto" }],
};

const OPENFREE = "https://tiles.openfreemap.org/styles/bright";

const STATUS_HEX: Record<string, string> = {
  idle: HEX.idle,
  "en-route": HEX.watch,
  "on-site": HEX.navy,
  late: HEX.stop,
  done: HEX.go,
};

type MapHandle = {
  remove: () => void;
  flyTo: (o: Record<string, unknown>) => void;
  resize: () => void;
  setPitch: (n: number) => unknown;
  setBearing: (n: number) => unknown;
};

function addBuildings(map: { getLayer: (id: string) => unknown; getSource: (id: string) => unknown; getStyle: () => { layers?: { id: string; type: string }[] }; addSource: (id: string, s: object) => void; addLayer: (l: object, before?: string) => void }) {
  if (map.getLayer("3d-buildings")) return;
  const layers = map.getStyle().layers ?? [];
  const label = layers.find((l) => l.type === "symbol")?.id;
  if (!map.getSource("openfreemap")) {
    map.addSource("openfreemap", { type: "vector", url: "https://tiles.openfreemap.org/planet" });
  }
  map.addLayer(
    {
      id: "3d-buildings",
      source: "openfreemap",
      "source-layer": "building",
      type: "fill-extrusion",
      minzoom: 14,
      filter: ["!=", ["get", "hide_3d"], true],
      paint: {
        "fill-extrusion-color": "#c5ccd3",
        "fill-extrusion-height": ["coalesce", ["get", "render_height"], ["get", "height"], 10],
        "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
        "fill-extrusion-opacity": 0.88,
      },
    },
    label,
  );
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
  const mapRef = useRef<MapHandle | null>(null);
  const onSelectRef = useRef(onSelect);
  const onStopRef = useRef(onPickStop);
  onSelectRef.current = onSelect;
  onStopRef.current = onPickStop;
  const [tiles, setTiles] = useState(false);

  useEffect(() => {
    const root = wrap.current;
    if (!root) return;
    let dead = false;
    let ro: ResizeObserver | undefined;
    const markers: { remove: () => void }[] = [];

    (async () => {
      const maplibregl = await import("maplibre-gl");
      if (dead || !wrap.current) return;
      const viewOffice = offices[office];
      const style = view === "aerial" ? AERIAL : view === "3d" ? OPENFREE : BASE;
      const map = new maplibregl.Map({
        container: wrap.current,
        style: style as never,
        center: [viewOffice.lng, viewOffice.lat],
        zoom: view === "3d" ? 15.2 : viewOffice.zoom,
        pitch: view === "3d" ? 58 : 0,
        bearing: view === "3d" ? -18 : 0,
        maxPitch: 80,
        attributionControl: false,
        canvasContextAttributes: { antialias: view === "3d" },
      });
      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");
      mapRef.current = map;
      const observer = new ResizeObserver(() => map.resize());
      observer.observe(wrap.current);
      ro = observer;

      map.on("load", () => {
        if (dead) return;
        setTiles(true);
        map.resize();
        if (view === "3d") {
          try {
            addBuildings(map as never);
          } catch {
            /* tiles without buildings still pitch */
          }
        }
        const here = units.filter((u) => u.office === office);
        const feats = here
          .filter((u) => routes[u.id])
          .map((u) => ({
            type: "Feature" as const,
            properties: { id: u.id },
            geometry: { type: "LineString" as const, coordinates: routes[u.id] },
          }));
        if (!map.getSource("routes")) {
          map.addSource("routes", { type: "geojson", data: { type: "FeatureCollection", features: feats } });
          map.addLayer({
            id: "routes-line",
            type: "line",
            source: "routes",
            paint: { "line-color": HEX.navy, "line-width": 3, "line-opacity": 0.75 },
          });
        }
        const shopPt = shop[office];
        const shopEl = document.createElement("div");
        shopEl.className = "dispatch-shop";
        shopEl.title = shopPt.name;
        markers.push(new maplibregl.Marker({ element: shopEl }).setLngLat([shopPt.lng, shopPt.lat]).addTo(map));

        here.forEach((u) => {
          (stops[u.id] ?? []).forEach((s) => {
            const house = document.createElement("button");
            house.type = "button";
            house.className = "dispatch-house";
            house.title = s.name;
            house.innerHTML = `<span>${s.name.slice(0, 1)}</span>`;
            house.addEventListener("click", (ev) => {
              ev.stopPropagation();
              onStopRef.current(u.id, s.id);
            });
            markers.push(new maplibregl.Marker({ element: house, anchor: "bottom" }).setLngLat([s.lng, s.lat]).addTo(map));
          });
          const pin = document.createElement("button");
          pin.type = "button";
          pin.className = "dispatch-pin";
          pin.style.background = STATUS_HEX[u.status];
          pin.textContent = u.initials;
          pin.title = u.name;
          pin.addEventListener("click", (ev) => {
            ev.stopPropagation();
            onSelectRef.current(u.id);
          });
          markers.push(new maplibregl.Marker({ element: pin, anchor: "center" }).setLngLat([u.lng, u.lat]).addTo(map));
        });
      });
    })();

    return () => {
      dead = true;
      setTiles(false);
      ro?.disconnect();
      markers.forEach((m) => m.remove());
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [office, view]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (selectedStopId) {
      const hit = Object.values(stops)
        .flat()
        .find((s) => s.id === selectedStopId);
      if (hit) mapRef.current.flyTo({ center: [hit.lng, hit.lat], zoom: 17.2, pitch: view === "3d" ? 60 : 0, duration: 700 });
      return;
    }
    const u = units.find((x) => x.id === selectedId);
    if (!u || u.office !== office) return;
    mapRef.current.flyTo({ center: [u.lng, u.lat], zoom: view === "3d" ? 15.6 : 12.4, pitch: view === "3d" ? 58 : 0, duration: 600 });
  }, [selectedId, selectedStopId, office, view]);

  return (
    <div className="relative h-full min-h-[22rem] w-full">
      {!tiles ? <div className="absolute inset-0 bg-page" /> : null}
      <div ref={wrap} className="dispatch-map absolute inset-0" />
    </div>
  );
}

export function unitColor(u: Unit) {
  return STATUS_HEX[u.status];
}

export function streetViewSrc(lat: number, lng: number) {
  return `https://maps.google.com/maps?layer=c&cbll=${lat},${lng}&cbp=12,90,0,0,0&output=svembed`;
}
