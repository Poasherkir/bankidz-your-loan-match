import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageShell } from "@/components/BottomNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Clock, Navigation } from "lucide-react";
import { ALGIERS_CENTER, BRANCHES, haversineKm, type Branch } from "@/lib/branches";
import "leaflet/dist/leaflet.css";

export const Route = createFileRoute("/branches")({
  component: BranchesPage,
});

const BANK_FILTERS = ["الكل", "BNA", "CPA", "BDL", "BEA", "AGB", "SGA"];

function BranchesPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("الكل");
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const center = userLoc ?? ALGIERS_CENTER;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BRANCHES.filter((b) => {
      if (filter !== "الكل" && b.bankShort !== filter) return false;
      if (!q) return true;
      return (
        b.bankShort.toLowerCase().includes(q) ||
        b.bankName.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q)
      );
    })
      .map((b) => ({ ...b, distance: haversineKm(center, b) }))
      .sort((a, b) => a.distance - b.distance);
  }, [query, filter, center]);

  // Initialize Leaflet map
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapRef.current || mapInstanceRef.current) return;
      const map = L.map(mapRef.current, {
        center: [ALGIERS_CENTER.lat, ALGIERS_CENTER.lng],
        zoom: 12,
        zoomControl: false,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);
      L.control.zoom({ position: "topleft" }).addTo(map);
      mapInstanceRef.current = map;
    })();
    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync markers with filtered branches
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      const map = mapInstanceRef.current;
      if (!map || cancelled) return;

      // Clear old
      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current = [];

      filtered.forEach((b) => {
        const icon = L.divIcon({
          className: "bankidz-marker",
          html: `<div style="
            background:${b.color};
            width:32px;height:32px;border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:2px solid #C9A84C;
            box-shadow:0 4px 12px rgba(0,0,0,0.5);
            display:flex;align-items:center;justify-content:center;
            color:white;font-size:10px;font-weight:700;font-family:sans-serif;
          "><span style="transform:rotate(45deg)">${b.bankShort}</span></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -28],
        });
        const marker = L.marker([b.lat, b.lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div dir="rtl" style="font-family:sans-serif;min-width:180px">
            <div style="font-weight:700;color:#0A1628;font-size:14px;margin-bottom:4px">${b.bankName}</div>
            <div style="color:#374151;font-size:12px;margin-bottom:4px">📍 ${b.address}</div>
            <div style="color:#374151;font-size:12px">🕐 ${b.hours}</div>
          </div>
        `);
        marker.on("click", () => setSelectedId(b.id));
        markersRef.current.push(marker);
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [filtered]);

  // Focus marker when selected from list
  useEffect(() => {
    if (!selectedId) return;
    const branch = filtered.find((b) => b.id === selectedId);
    const map = mapInstanceRef.current;
    if (!branch || !map) return;
    map.flyTo([branch.lat, branch.lng], 15, { duration: 0.6 });
    const marker = markersRef.current.find((m) => {
      const ll = m.getLatLng();
      return ll.lat === branch.lat && ll.lng === branch.lng;
    });
    marker?.openPopup();
  }, [selectedId, filtered]);

  const locateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(loc);
        mapInstanceRef.current?.flyTo([loc.lat, loc.lng], 13);
      },
      () => {},
      { timeout: 5000 }
    );
  };

  return (
    <PageShell>
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold mb-1">الفروع</h1>
        <p className="text-sm text-muted-foreground mb-4">ابحث عن أقرب فرع بنكي إليك</p>

        <div className="relative mb-3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث باسم البنك أو العنوان..."
            className="pr-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {BANK_FILTERS.map((b) => {
            const active = filter === b;
            return (
              <button
                key={b}
                onClick={() => setFilter(b)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  active
                    ? "bg-gold text-gold-foreground border-gold"
                    : "bg-surface text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4">
        <div className="relative rounded-2xl overflow-hidden border border-border shadow-card">
          <div ref={mapRef} className="h-[320px] w-full bg-surface" style={{ direction: "ltr" }} />
          <Button
            type="button"
            size="sm"
            onClick={locateMe}
            className="absolute bottom-3 left-3 z-[400] gap-1 bg-gold text-gold-foreground hover:bg-gold/90 shadow-gold"
          >
            <Navigation className="h-3.5 w-3.5" />
            موقعي
          </Button>
        </div>
      </div>

      <div className="px-4 mt-4">
        <h2 className="text-sm font-semibold mb-2 text-muted-foreground">
          {filtered.length} فرع قريب
        </h2>
        <div className="space-y-2">
          {filtered.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedId(b.id)}
              className={`w-full text-right glass rounded-xl p-3 flex items-start gap-3 transition-all ${
                selectedId === b.id ? "ring-2 ring-gold" : ""
              }`}
            >
              <div
                className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: b.color }}
              >
                {b.bankShort}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-sm truncate">{b.bankName}</div>
                  <div className="text-[11px] text-gold shrink-0">{b.distance.toFixed(1)} كم</div>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{b.address}</span>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span className="truncate">{b.hours}</span>
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              لا توجد فروع مطابقة
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
