import { useState } from "react";
import { setDealerFeePct } from "@/features/money-settings/store";
import { setBrand, useBrand } from "@/features/brand/store";

const FONTS = ["Teko", "Oswald", "IBM Plex Sans", "Arial", "Georgia", "Impact"];

export function CompanyForm() {
  const brand = useBrand();
  const [fiscal, setFiscal] = useState("January");
  const [fee, setFee] = useState("5");
  const [saved, setSaved] = useState("");

  return (
    <form
      className="max-w-2xl space-y-3 rounded-md border border-line bg-card p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setDealerFeePct(Number(fee) || 0);
        setSaved("Saved on this device.");
      }}
    >
      <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Company</h2>
      <label className="block text-sm">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Name</span>
        <input value={brand.name} onChange={(e) => setBrand({ name: e.target.value })} className="mt-1 h-11 w-full rounded-md border border-line px-3 text-sm" />
      </label>
      <label className="block text-sm">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Tagline</span>
        <input value={brand.tagline} onChange={(e) => setBrand({ tagline: e.target.value })} className="mt-1 h-11 w-full rounded-md border border-line px-3 text-sm" />
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Phone</span>
          <input value={brand.phone} onChange={(e) => setBrand({ phone: e.target.value })} className="mt-1 h-11 w-full rounded-md border border-line px-3 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">License</span>
          <input value={brand.license} onChange={(e) => setBrand({ license: e.target.value })} className="mt-1 h-11 w-full rounded-md border border-line px-3 text-sm" />
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Logo URL</span>
        <input value={brand.logo} onChange={(e) => setBrand({ logo: e.target.value })} className="mt-1 h-11 w-full rounded-md border border-line px-3 text-sm" />
      </label>
      {brand.logo ? <img src={brand.logo} alt="" className="h-16 w-auto bg-black p-2" /> : null}

      <h2 className="pt-2 text-[11px] font-bold tracking-wide text-muted uppercase">Proposal brand</h2>
      <p className="text-[11px] text-muted">Colors and fonts on the customer proposal. This shop is Cozy: red, navy, black. Teko / Oswald / sans.</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {(
          [
            ["red", "Red"],
            ["navy", "Navy"],
            ["black", "Black"],
            ["gray", "Gray"],
            ["paper", "Paper"],
            ["ink", "Ink"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-[11px] font-bold tracking-wide text-muted uppercase">
            {label}
            <input type="color" value={brand[key]} onChange={(e) => setBrand({ [key]: e.target.value })} className="mt-1 h-11 w-full cursor-pointer rounded-md border border-line bg-card p-1" />
          </label>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Heading</span>
          <select value={brand.fontHead} onChange={(e) => setBrand({ fontHead: e.target.value })} className="mt-1 h-11 w-full rounded-md border border-line px-2 text-sm">
            {FONTS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Subhead</span>
          <select value={brand.fontSub} onChange={(e) => setBrand({ fontSub: e.target.value })} className="mt-1 h-11 w-full rounded-md border border-line px-2 text-sm">
            {FONTS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Body</span>
          <select value={brand.fontBody} onChange={(e) => setBrand({ fontBody: e.target.value })} className="mt-1 h-11 w-full rounded-md border border-line px-2 text-sm">
            {FONTS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Fiscal start</span>
        <select value={fiscal} onChange={(e) => setFiscal(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-line px-2 text-sm">
          {["January", "July", "October"].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">GoodLeap dealer fee %</span>
        <input value={fee} onChange={(e) => setFee(e.target.value)} inputMode="numeric" className="mt-1 h-11 w-full rounded-md border border-line px-3 text-sm" />
      </label>
      <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">
        Save
      </button>
      {saved ? <p className="text-sm text-up">{saved}</p> : null}
    </form>
  );
}
