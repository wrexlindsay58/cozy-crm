import * as maplibregl from "maplibre-gl";
import { shop } from "@/lib/dispatch-data";
import { HEX } from "@/lib/tokens";

export type MapView = "base" | "aerial" | "3d";

export type StreetPath = { unitId: string; color: string; coords: [number, number][] };

export type MapPerson = { id: string; name: string; initials: string; lat: number; lng: number; color: string; late?: boolean };

export type MapHouse = { id: string; resourceId: string; lat: number; lng: number; label: string; color: string };

export const AERIAL = {
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

export function MapCtor() {
  const m = maplibregl as unknown as { Map: typeof maplibregl.Map; default?: { Map: typeof maplibregl.Map } };
  return m.Map ?? m.default?.Map;
}

export function pathData(paths: StreetPath[]) {
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

export function boundsOf(paths: StreetPath[], people: MapPerson[], houses: MapHouse[]) {
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

export function placeMarks(
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
