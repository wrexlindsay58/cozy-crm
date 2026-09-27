import { COMPOSE_EMOJI, CUSTOM_VALUES, PAY_ASKS, TRIGGER_LINKS } from "@/lib/canned";

export function ComposeExtrasView(props: { bag: { setPane: any; pane: any; canned: any; onTemplate: any; close: any; onInsert: any } }) {
  const { setPane, pane, canned, onTemplate, close, onInsert } = props.bag;
  return (
    <div className="py-1">
                  <button type="button" className="px-3 py-1 text-[11px] font-semibold text-muted" onClick={() => setPane("icons")}>
                    Back
                  </button>
                  {pane === "templates"
                    ? canned.map((c: any) => (
                        <button
                          key={c.id}
                          type="button"
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-page"
                          onClick={() => {
                            onTemplate(c.body, c.subject);
                            close();
                          }}
                        >
                          {c.label}
                        </button>
                      ))
                    : null}
                  {pane === "links"
                    ? TRIGGER_LINKS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-page"
                          onClick={() => {
                            onInsert(c.insert);
                            close();
                          }}
                        >
                          {c.label}
                        </button>
                      ))
                    : null}
                  {pane === "values"
                    ? CUSTOM_VALUES.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-page"
                          onClick={() => {
                            onInsert(c.insert);
                            close();
                          }}
                        >
                          {c.label}
                        </button>
                      ))
                    : null}
                  {pane === "pay"
                    ? PAY_ASKS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-page"
                          onClick={() => {
                            onInsert(c.insert);
                            close();
                          }}
                        >
                          {c.label}
                        </button>
                      ))
                    : null}
                  {pane === "emoji" ? (
                    <div className="grid grid-cols-5 gap-0 px-1 pb-1">
                      {COMPOSE_EMOJI.map((e) => (
                        <button
                          key={e}
                          type="button"
                          className="grid h-10 place-items-center text-base hover:bg-page"
                          onClick={() => {
                            onInsert(e);
                            close();
                          }}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
  );
}
