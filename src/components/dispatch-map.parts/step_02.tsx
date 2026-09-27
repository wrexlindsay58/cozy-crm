import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import { offices } from "@/lib/dispatch-data";
import cozyMap from "@/features/dispatch/map-style.json";
import { AERIAL, MapCtor, pathData, boundsOf, placeMarks, type MapView, type StreetPath, type MapPerson, type MapHouse } from "./part-01";

export function useMapStep2(ctx: any): any {
useEffect(() => {
    const el = ctx.wrap.current;
    const Ctor = MapCtor();
    if (!el || !Ctor) return;
    const center = ctx.office === "all" ? { lat: 33.2, lng: -104.6, zoom: 5.4 } : offices[ctx.office as keyof typeof offices];
    const map = new Ctor({
      container: el,
      style: (ctx.view === "aerial" ? AERIAL : cozyMap) as never,
      center: [center.lng, center.lat],
      zoom: ctx.view === "3d" && ctx.office !== "all" ? 14.2 : center.zoom,
      pitch: ctx.view === "3d" ? 52 : 0,
      bearing: ctx.view === "3d" ? -16 : 0,
      maxPitch: 80,
      trackResize: false,
      fadeDuration: 0,
      attributionControl: { compact: true },
    });
    el.style.background = "#f7fafb";
    ctx.mapRef.current = map;
    ctx.marksSig.current = "";
    let lastW = 0;
    let lastH = 0;
    let raf = 0;
    const ro = new ResizeObserver(() => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (w < 8 || h < 8 || (w === lastW && h === lastH)) return;
        lastW = w;
        lastH = h;
        map.resize();
      });
    });
    ro.observe(el);

    function ready() {
      if (ctx.view === "3d") {
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
      map.addSource("routes", { type: "geojson", data: pathData(ctx.pathsRef.current) });
      map.addLayer({
        id: "routes-line",
        type: "line",
        source: "routes",
        paint: { "line-color": ["get", "color"], "line-width": 3.5, "line-opacity": 0.85 },
      });
      ctx.drawMarks(map);
      map.resize();
      ctx.fitAll(map);
    }
    map.on("load", ready);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      ctx.marksRef.current.forEach((m: any) => m.remove());
      ctx.marksRef.current = [];
      ctx.marksSig.current = "";
      map.remove();
      ctx.mapRef.current = null;
    };
  }, [ctx.office, ctx.view]);
useEffect(() => {
    const map = ctx.mapRef.current;
    if (!map) return;
    ctx.drawMarks(map);
  }, [ctx.people, ctx.houses, ctx.office]);
}
