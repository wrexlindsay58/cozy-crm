import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { offices, routes, shop, stops, units, type Unit } from "@/lib/dispatch-data";
import { HEX } from "@/lib/tokens";

const RASTER = {
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

const STATUS_HEX: Record<string, string> = {
  idle: HEX.idle,
  "en-route": HEX.watch,
  "on-site": HEX.navy,
  late: HEX.stop,
  done: HEX.go,
};

const BOUNDS = {
  PHX: { w: -112.62, e: -111.72, s: 33.32, n: 33.78 },
  DFW: { w: -97.55, e: -96.55, s: 32.55, n: 33.15 },
};

function xy(office: "PHX" | "DFW", lat: number, lng: number) {
  const b = BOUNDS[office];
  return {
    x: ((lng - b.w) / (b.e - b.w)) * 100,
    y: ((b.n - lat) / (b.n - b.s)) * 100,
  };
}

export function DispatchMap({
  office,
  selectedId,
  onSelect,
}: {
  office: "PHX" | "DFW";
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ remove: () => void; flyTo: (o: Record<string, unknown>) => void; resize: () => void } | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
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
      const view = offices[office];
      const map = new maplibregl.Map({
        container: wrap.current,
        style: RASTER as never,
        center: [view.lng, view.lat],
        zoom: view.zoom,
        attributionControl: false,
      });
      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
      mapRef.current = map;
      const observer = new ResizeObserver(() => map.resize());
      observer.observe(wrap.current);
      ro = observer;

      map.on("load", () => {
        if (dead) return;
        setTiles(true);
        map.resize();
        const here = units.filter((u) => u.office === office);
        const feats = here
          .filter((u) => routes[u.id])
          .map((u) => ({
            type: "Feature" as const,
            properties: { id: u.id },
            geometry: { type: "LineString" as const, coordinates: routes[u.id] },
          }));
        if (!map.getSource("routes")) {
          map.addSource("routes", {
            type: "geojson",
            data: { type: "FeatureCollection", features: feats },
          });
          map.addLayer({
            id: "routes-line",
            type: "line",
            source: "routes",
            paint: { "line-color": HEX.navy, "line-width": 3, "line-opacity": 0.8 },
          });
        }
        const stopFeats = here.flatMap((u) =>
          (stops[u.id] ?? []).map((s) => ({
            type: "Feature" as const,
            properties: { name: s.name },
            geometry: { type: "Point" as const, coordinates: [s.lng, s.lat] },
          })),
        );
        if (!map.getSource("stops")) {
          map.addSource("stops", { type: "geojson", data: { type: "FeatureCollection", features: stopFeats } });
          map.addLayer({
            id: "stops-pt",
            type: "circle",
            source: "stops",
            paint: {
              "circle-radius": 5,
              "circle-color": HEX.navy,
              "circle-stroke-width": 2,
              "circle-stroke-color": HEX.card,
            },
          });
        }
        const shopPt = shop[office];
        const shopEl = document.createElement("div");
        shopEl.className = "dispatch-shop";
        shopEl.title = shopPt.name;
        markers.push(new maplibregl.Marker({ element: shopEl }).setLngLat([shopPt.lng, shopPt.lat]).addTo(map));
        here.forEach((u) => {
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
  }, [office]);

  useEffect(() => {
    const u = units.find((x) => x.id === selectedId);
    if (!u || u.office !== office || !mapRef.current) return;
    mapRef.current.flyTo({ center: [u.lng, u.lat], zoom: 12, duration: 600 });
  }, [selectedId, office]);

  const here = units.filter((u) => u.office === office);
  const shopPt = shop[office];
  const shopXY = xy(office, shopPt.lat, shopPt.lng);

  return (
    <div className="relative h-full min-h-[22rem] w-full">
      {!tiles ? (
        <div className="absolute inset-0 bg-page">
          <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
            <rect width="100" height="100" fill={HEX.page} />
            <path d="M0 42 H100" stroke={HEX.line} strokeWidth="0.6" />
            <path d="M0 58 H100" stroke={HEX.line} strokeWidth="0.6" />
            <path d="M28 0 V100" stroke={HEX.line} strokeWidth="0.6" />
            <path d="M62 0 V100" stroke={HEX.lineStrong} strokeWidth="0.9" />
            <path d="M8 70 H92" stroke={HEX.navy} strokeWidth="0.5" opacity="0.35" />
            <text x="64" y="8" fill={HEX.faint} fontSize="3" fontFamily="IBM Plex Sans">
              {office === "PHX" ? "101" : "35"}
            </text>
            <text x="4" y="40" fill={HEX.faint} fontSize="3" fontFamily="IBM Plex Sans">
              {office === "PHX" ? "Bell" : "I-30"}
            </text>
          </svg>
          <i className="absolute size-2.5 rotate-45 bg-navy" style={{ left: `${shopXY.x}%`, top: `${shopXY.y}%` }} />
          {here.map((u) => {
            const p = xy(office, u.lat, u.lng);
            const on = u.id === selectedId;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => onSelect(u.id)}
                className="dispatch-pin absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.x}%`, top: `${p.y}%`, background: STATUS_HEX[u.status], outline: on ? `2px solid ${HEX.ink}` : undefined }}
              >
                {u.initials}
              </button>
            );
          })}
        </div>
      ) : null}
      <div ref={wrap} className={tiles ? "dispatch-map absolute inset-0" : "dispatch-map pointer-events-none absolute inset-0 opacity-0"} />
    </div>
  );
}

export function unitColor(u: Unit) {
  return STATUS_HEX[u.status];
}
