import { WHO, CHANNEL, TYPE, PIPE, initials } from "./bits-01";
import { Pick } from "./bits-04";
import { ExtraPick, IconChip } from "./bits-05";
import { useConversations3 } from "./useConversations3";
import { BellOff, Ban, Calendar, Inbox, Mail, MessageSquare, Phone, Search, SquareArrowOutUpRight, Star, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { toggleStar } from "@/features/thread/store";

export function VConversations02({ bag }: { bag: ReturnType<typeof useConversations3> }) {
  const { active, channel, extra, mobileThread, openRow, pipe, query, rows, setChannel, setExtra, setPipe, setQuery, setStarredOnly, setTalkType, setUnreadOnly, setWho, starredOnly, talkType, unreadOnly, who } = bag;
  return (
    <>
<aside className={cn("flex w-full shrink-0 flex-col border-r border-line bg-card @container md:w-[clamp(18rem,34%,40rem)]", mobileThread && "max-md:hidden")}>
          <div className="border-b border-line px-2 py-2">
            <label className="relative block">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name or number"
                className="h-10 w-full rounded-md border border-line bg-card pr-3 pl-9 text-sm outline-none"
              />
            </label>
            <div className="mt-1.5 flex w-full items-center gap-0.5">
              <Pick items={WHO} value={who} onChange={setWho} />
              <IconChip
                label="Starred"
                face="Star"
                icon={Star}
                on={starredOnly}
                filled={starredOnly}
                onClick={() => setStarredOnly((v) => !v)}
              />
              <IconChip
                label="Unread"
                face="New"
                icon={Inbox}
                on={unreadOnly}
                onClick={() => setUnreadOnly((v) => !v)}
              />
              <span className="h-4 w-px shrink-0 bg-line" />
              <Pick items={CHANNEL} value={channel} onChange={setChannel} />
              <Pick items={TYPE} value={talkType} onChange={setTalkType} />
              <Pick items={PIPE} value={pipe} onChange={setPipe} />
              <ExtraPick value={extra} onChange={setExtra} />
            </div>
          </div>
          <ul className="min-h-0 flex-1 overflow-auto">
            {rows.map((t) => {
              const on = t.id === active?.id;
              return (
                <li key={t.id} className={cn("border-b border-line", on && "bg-page")}>
                  <div className={cn("flex items-start gap-2 border-l-4 px-2 py-2.5", on ? "border-l-navy" : "border-l-transparent")}>
                    <button
                      type="button"
                      aria-label={t.starred ? "Unstar" : "Star"}
                      className="mt-2 grid size-8 shrink-0 place-items-center text-muted"
                      onClick={() => toggleStar(t.id)}
                    >
                      <Star className={cn("size-3.5", t.starred && "fill-navy text-navy")} />
                    </button>
                    <button type="button" className="min-w-0 flex-1 text-left" onClick={() => openRow(t.id)}>
                      <span className="flex items-center gap-2">
                        <span className="relative grid size-9 shrink-0 place-items-center rounded-md bg-navy text-[10px] font-bold text-card">
                          {initials(t.name)}
                          {t.unread ? (
                            <i className="absolute -top-1 -right-1 grid min-w-4 place-items-center rounded-full bg-alert px-1 text-[9px] font-bold text-card">
                              {t.unread}
                            </i>
                          ) : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1">
                            <span className={cn("type-group truncate", t.unread && "font-bold")}>{t.name}</span>
                            {t.blocked ? <Ban className="size-3 shrink-0 text-stop" /> : null}
                            {t.dndOn ? <BellOff className="size-3 shrink-0 text-alert" /> : null}
                          </span>
                        </span>
                        <span className="shrink-0 text-[10px] text-faint">{t.last?.at ?? ""}</span>
                      </span>
                      <span className="type-meta mt-1 flex items-center gap-1">
                        {t.last?.channel === "call" ? <Phone className="size-3" /> : t.last?.channel === "email" ? <Mail className="size-3" /> : t.last?.channel === "internal" ? <Users className="size-3" /> : <MessageSquare className="size-3" />}
                        <span className="truncate">{t.last?.text ?? "No talk yet"}</span>
                      </span>
                      {t.appt ? (
                        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-navy">
                          <Calendar className="size-3" />
                          Sep {t.appt.day} {t.appt.time}
                        </span>
                      ) : null}
                    </button>
                    <a
                      href={t.pipe.href}
                      aria-label="Open file"
                      className="mt-2 grid size-8 shrink-0 place-items-center rounded-md text-muted hover:bg-page hover:text-navy"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SquareArrowOutUpRight className="size-3.5" />
                    </a>
                  </div>
                </li>
              );
            })}
            {rows.length === 0 ? <li className="px-4 py-8 text-sm text-muted">No contacts.</li> : null}
          </ul>
        </aside>
    </>
  );
}
