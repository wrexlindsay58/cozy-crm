import { Bits } from "@/features/record-shell/file-sheet";
import { useState } from "react";
import { addManualReview, addReferral, API_REVIEW_PLATFORMS, MANUAL_REVIEW_PLATFORMS, sendReview, type AccountFile, type AccountReview } from "./store";

const field = "h-10 min-w-0 flex-1 rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy";

export function VoiceCard({ file }: { file: AccountFile }) {
  return (
    <div className="space-y-2">
      <Reviews file={file} />
      <Referrals file={file} />
    </div>
  );
}

function Reviews({ file }: { file: AccountFile }) {
  const [platform, setPlatform] = useState<string>(MANUAL_REVIEW_PLATFORMS[0]);
  const [rating, setRating] = useState("5");
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [manual, setManual] = useState(false);

  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="type-section">Reviews</h2>
      <p className="type-meta mt-1">Google and Facebook pull in on their own. Add the others by hand.</p>
      <ul className="mt-3 space-y-2">
        {API_REVIEW_PLATFORMS.map((name) => {
          const row = file.reviews.find((r) => r.platform === name && r.source === "api") ?? file.reviews.find((r) => r.platform === name);
          return <ApiRow key={name} accountId={file.accountId} platform={name} row={row} />;
        })}
        {file.reviews
          .filter((r) => r.source === "manual")
          .map((r) => (
            <li key={r.id} className="rounded-md border border-line px-3 py-2">
              <p className="type-value">{r.platform}</p>
              <Bits items={[{ label: "Rating", value: `${r.rating} star` }, { label: "By", value: r.author }, { label: "When", value: r.at }, { label: "Source", value: "Added by hand" }]} />
              {r.text ? <p className="type-body mt-2">{r.text}</p> : null}
            </li>
          ))}
      </ul>
      <button type="button" onClick={() => setManual((v) => !v)} className="mt-3 text-[12px] font-semibold text-navy">
        {manual ? "Close" : "Add a review"}
      </button>
      {manual ? (
        <div className="mt-2 flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={field}>
              {MANUAL_REVIEW_PLATFORMS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <select value={rating} onChange={(e) => setRating(e.target.value)} className="h-10 rounded-md border border-line bg-card px-2 text-sm">
              {["5", "4", "3", "2", "1"].map((n) => (
                <option key={n} value={n}>
                  {n} star
                </option>
              ))}
            </select>
          </div>
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Who wrote it" className={field} />
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="What they wrote" className={field} />
          <button
            type="button"
            onClick={() => {
              const ok = addManualReview(file.accountId, { platform, rating: Number(rating), text, author });
              if (!ok) return;
              setText("");
              setAuthor("");
              setManual(false);
            }}
            className="h-10 self-start rounded-md bg-navy px-3 text-sm font-semibold text-card"
          >
            Save review
          </button>
        </div>
      ) : null}
    </section>
  );
}

function ApiRow({ accountId, platform, row }: { accountId: string; platform: string; row?: AccountReview }) {
  const left = row?.status === "Left";
  return (
    <li className="rounded-md border border-line px-3 py-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="type-value">{platform}</p>
          <Bits
            items={[
              { label: "Rating", value: left && row?.rating ? `${row.rating} star` : "" },
              { label: "Status", value: left ? "Pulled" : row?.status === "Sent" ? "Request sent" : "Not pulled yet" },
              { label: "By", value: row?.author },
              { label: "When", value: row?.at },
            ]}
          />
        </div>
        {left ? null : (
          <button type="button" onClick={() => sendReview(accountId, platform)} className="h-8 shrink-0 rounded-md bg-navy px-2.5 text-[12px] font-semibold text-card">
            Send request
          </button>
        )}
      </div>
      {row?.text ? <p className="mt-1.5 text-sm">{row.text}</p> : null}
    </li>
  );
}

function Referrals({ file }: { file: AccountFile }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="type-section">Referrals</h2>
      <p className="type-meta mt-1">People this customer sent us. They stay on this account.</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className={field} />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className={field} />
        <button
          type="button"
          onClick={() => {
            addReferral(file.accountId, name, phone);
            setName("");
            setPhone("");
          }}
          className="h-10 shrink-0 rounded-md bg-navy px-3 text-sm font-semibold text-card"
        >
          Add
        </button>
      </div>
      <ul className="mt-3 space-y-2">
        {file.referrals.length === 0 ? <li className="text-sm text-muted">None yet.</li> : null}
        {file.referrals.map((r) => (
          <li key={r.id} className="text-sm">
            <p className="type-value">{r.name}</p>
            <Bits items={[{ label: "Status", value: r.status }, { label: "Phone", value: r.phone }]} />
            {r.leadId ? (
              <a href={`/leads/${r.leadId}`} className="ml-2 font-semibold text-navy">
                Open
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
