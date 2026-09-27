import { field, label } from "./part-01";

export function EventModalView2(props: { bag: { lead: any; query: any; setLeadId: any; setQuery: any; hits: any; pickLead: any; who: any; type: any; products: any; sow: any; job: any; title: any; setTitle: any } }) {
  const { lead, query, setLeadId, setQuery, hits, pickLead, who, type, products, sow, job, title, setTitle } = props.bag;
  return (
    <div>
              <label className={label}>
                Contact
                <input value={lead ? `${lead.name} · ${lead.city}` : query} onChange={(e) => { setLeadId(""); setQuery(e.target.value); }} placeholder="Search a house" className={field} />
              </label>
              {hits.length ? (
                <ul className="mt-1 overflow-hidden rounded-md border border-line">
                  {hits.map((l: any) => (
                    <li key={l.id}>
                      <button type="button" className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-page" onClick={() => pickLead(l.id)}>
                        <span className="text-sm font-semibold">{l.name}</span>
                        <span className="text-[12px] text-muted">
                          {l.address} · {l.city} · {l.source}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {lead ? (
                <div className="mt-2 space-y-2 rounded-md border border-line bg-page p-3 text-[13px]">
                  <p className="font-semibold">{lead.name}</p>
                  <p className="text-muted">
                    {lead.address} · {lead.city}
                  </p>
                  <p className="text-muted">
                    {lead.phone}
                    {lead.email ? ` · ${lead.email}` : ""}
                  </p>
                  {who === "sales" || type === "Assessment" ? (
                    <>
                      <p>
                        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Source </span>
                        {lead.source}
                        {lead.referrerName ? ` · ${lead.referrerName}` : ""}
                      </p>
                      <p>
                        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Status </span>
                        {lead.status}
                      </p>
                      {lead.notes ? <p className="text-muted">{lead.notes}</p> : null}
                    </>
                  ) : null}
                  {who === "production" ? (
                    <>
                      {products.length ? (
                        <ul className="space-y-1">
                          {products.map((p: any) => (
                            <li key={p.label}>
                              <p className="font-semibold">
                                {p.label}
                                {p.qty ? ` · ${p.qty}` : ""}
                              </p>
                              {p.notes ? <p className="text-muted">{p.notes}</p> : null}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted">No sold products on this file yet.</p>
                      )}
                      {sow ? (
                        <p className="whitespace-pre-wrap text-muted">
                          <span className="block text-[11px] font-bold tracking-wide text-muted uppercase">SOW</span>
                          {sow}
                        </p>
                      ) : null}
                    </>
                  ) : null}
                  <a href={job ? `/projects/${job.jobId}` : `/leads/${lead.id}`} className="inline-block text-[12px] font-semibold text-navy">
                    Open file
                  </a>
                </div>
              ) : (
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Name this if it isn't a house" className={`${field} mt-2`} />
              )}
            </div>
  );
}

export function EventModalView4(props: { bag: { linkDraft: any; setLinkDraft: any; setLinks: any; links: any } }) {
  const { linkDraft, setLinkDraft, setLinks, links } = props.bag;
  return (
    <div>
            <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Links</p>
            <div className="mt-1 flex gap-2">
              <input value={linkDraft} onChange={(e) => setLinkDraft(e.target.value)} placeholder="https://…" className={field} />
              <button
                type="button"
                className="h-10 shrink-0 rounded-md border border-line px-3 text-sm font-semibold"
                onClick={() => {
                  const url = linkDraft.trim();
                  if (!url) return;
                  setLinks((ls: any) => [...ls, { id: `LK-${Date.now()}`, label: url.replace(/^https?:\/\//, "").slice(0, 32), url }]);
                  setLinkDraft("");
                }}
              >
                Add
              </button>
            </div>
            {links.length ? (
              <ul className="mt-2 space-y-1">
                {links.map((l: any) => (
                  <li key={l.id} className="flex items-center gap-2 text-[13px]">
                    <a href={l.url} target="_blank" rel="noreferrer" className="truncate font-semibold text-navy">
                      {l.label}
                    </a>
                    <button type="button" className="ml-auto text-[12px] text-muted" onClick={() => setLinks((ls: any) => ls.filter((x: any) => x.id !== l.id))}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
  );
}
