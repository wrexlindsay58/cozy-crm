import { FileMedia } from "../../file-media";
import { FilePane } from "../../file-sections";
import { cn } from "@/lib/cn";
import { pipeName, RecordShellView2 } from "../part-01";
import { RecordShellView20 } from "./part-02";

export function RecordShellView(__p: { bag: { mobileTalk: any; props: any; setMobileTalk: any; lane: any; setLane: any; lead: any; callOpen: any; setCallOpen: any; draft: any; setDraft: any; talkScope: any; setTalkScope: any; talkLane: any; startCall: any } }) {
  const { mobileTalk, props, setMobileTalk, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall } = __p.bag;
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:grid lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
        <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:contents", mobileTalk && "max-lg:hidden")}>
          <FilePane
            foot={
              <>
                <FileMedia personId={props.personId} photos={props.photos} pipeline={pipeName(props.kind)} />
                <button
                  type="button"
                  className="mt-3 flex h-11 w-full items-center justify-center rounded-md border border-line text-sm font-semibold text-navy lg:hidden"
                  onClick={() => setMobileTalk(true)}
                >
                  Talk
                </button>
              </>
            }
          >
            {props.children}
          </FilePane>
        </div>

        <RecordShellView2 bag={{ mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall }} />
      </div>
  );
}

export function RecordShellView4(__p: { bag: { mobileTalk: any; setMobileTalk: any; props: any; lane: any; setLane: any; lead: any; callOpen: any; setCallOpen: any; draft: any; setDraft: any; talkScope: any; setTalkScope: any; talkLane: any; startCall: any } }) {
  const { mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall } = __p.bag;
  return (
    <RecordShellView5 bag={{ mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall }} />
  );
}

function RecordShellView5(__p: { bag: { mobileTalk: any; setMobileTalk: any; props: any; lane: any; setLane: any; lead: any; callOpen: any; setCallOpen: any; draft: any; setDraft: any; talkScope: any; setTalkScope: any; talkLane: any; startCall: any } }) {
  const { mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall } = __p.bag;
  return (
    <RecordShellView6 bag={{ mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall }} />
  );
}

function RecordShellView6(__p: { bag: { mobileTalk: any; setMobileTalk: any; props: any; lane: any; setLane: any; lead: any; callOpen: any; setCallOpen: any; draft: any; setDraft: any; talkScope: any; setTalkScope: any; talkLane: any; startCall: any } }) {
  const { mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall } = __p.bag;
  return (
    <RecordShellView7 bag={{ mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall }} />
  );
}

function RecordShellView7(__p: { bag: { mobileTalk: any; setMobileTalk: any; props: any; lane: any; setLane: any; lead: any; callOpen: any; setCallOpen: any; draft: any; setDraft: any; talkScope: any; setTalkScope: any; talkLane: any; startCall: any } }) {
  const { mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall } = __p.bag;
  return (
    <RecordShellView8 bag={{ mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall }} />
  );
}

function RecordShellView8(__p: { bag: { mobileTalk: any; setMobileTalk: any; props: any; lane: any; setLane: any; lead: any; callOpen: any; setCallOpen: any; draft: any; setDraft: any; talkScope: any; setTalkScope: any; talkLane: any; startCall: any } }) {
  const { mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall } = __p.bag;
  return (
    <RecordShellView9 bag={{ mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall }} />
  );
}

function RecordShellView9(__p: { bag: { mobileTalk: any; setMobileTalk: any; props: any; lane: any; setLane: any; lead: any; callOpen: any; setCallOpen: any; draft: any; setDraft: any; talkScope: any; setTalkScope: any; talkLane: any; startCall: any } }) {
  const { mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall } = __p.bag;
  return (
    <RecordShellView10 bag={{ mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall }} />
  );
}

function RecordShellView10(__p: { bag: { mobileTalk: any; setMobileTalk: any; props: any; lane: any; setLane: any; lead: any; callOpen: any; setCallOpen: any; draft: any; setDraft: any; talkScope: any; setTalkScope: any; talkLane: any; startCall: any } }) {
  const { mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall } = __p.bag;
  return (
    <RecordShellView11 bag={{ mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall }} />
  );
}

function RecordShellView11(__p: { bag: { mobileTalk: any; setMobileTalk: any; props: any; lane: any; setLane: any; lead: any; callOpen: any; setCallOpen: any; draft: any; setDraft: any; talkScope: any; setTalkScope: any; talkLane: any; startCall: any } }) {
  const { mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall } = __p.bag;
  return (
    <RecordShellView12 bag={{ mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall }} />
  );
}

function RecordShellView12(__p: { bag: { mobileTalk: any; setMobileTalk: any; props: any; lane: any; setLane: any; lead: any; callOpen: any; setCallOpen: any; draft: any; setDraft: any; talkScope: any; setTalkScope: any; talkLane: any; startCall: any } }) {
  const { mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall } = __p.bag;
  return (
    <RecordShellView13 bag={{ mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall }} />
  );
}

function RecordShellView13(__p: { bag: { mobileTalk: any; setMobileTalk: any; props: any; lane: any; setLane: any; lead: any; callOpen: any; setCallOpen: any; draft: any; setDraft: any; talkScope: any; setTalkScope: any; talkLane: any; startCall: any } }) {
  const { mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall } = __p.bag;
  return (
    <RecordShellView14 bag={{ mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall }} />
  );
}

function RecordShellView14(__p: { bag: { mobileTalk: any; setMobileTalk: any; props: any; lane: any; setLane: any; lead: any; callOpen: any; setCallOpen: any; draft: any; setDraft: any; talkScope: any; setTalkScope: any; talkLane: any; startCall: any } }) {
  const { mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall } = __p.bag;
  return (
    <RecordShellView15 bag={{ mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall }} />
  );
}

function RecordShellView15(__p: { bag: { mobileTalk: any; setMobileTalk: any; props: any; lane: any; setLane: any; lead: any; callOpen: any; setCallOpen: any; draft: any; setDraft: any; talkScope: any; setTalkScope: any; talkLane: any; startCall: any } }) {
  const { mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall } = __p.bag;
  return (
    <RecordShellView16 bag={{ mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall }} />
  );
}

function RecordShellView16(__p: { bag: { mobileTalk: any; setMobileTalk: any; props: any; lane: any; setLane: any; lead: any; callOpen: any; setCallOpen: any; draft: any; setDraft: any; talkScope: any; setTalkScope: any; talkLane: any; startCall: any } }) {
  const { mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall } = __p.bag;
  return (
    <RecordShellView17 bag={{ mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall }} />
  );
}

function RecordShellView17(__p: { bag: { mobileTalk: any; setMobileTalk: any; props: any; lane: any; setLane: any; lead: any; callOpen: any; setCallOpen: any; draft: any; setDraft: any; talkScope: any; setTalkScope: any; talkLane: any; startCall: any } }) {
  const { mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall } = __p.bag;
  return (
    <RecordShellView18 bag={{ mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall }} />
  );
}

function RecordShellView18(__p: { bag: { mobileTalk: any; setMobileTalk: any; props: any; lane: any; setLane: any; lead: any; callOpen: any; setCallOpen: any; draft: any; setDraft: any; talkScope: any; setTalkScope: any; talkLane: any; startCall: any } }) {
  const { mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall } = __p.bag;
  return (
    <RecordShellView19 bag={{ mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall }} />
  );
}

function RecordShellView19(__p: { bag: { mobileTalk: any; setMobileTalk: any; props: any; lane: any; setLane: any; lead: any; callOpen: any; setCallOpen: any; draft: any; setDraft: any; talkScope: any; setTalkScope: any; talkLane: any; startCall: any } }) {
  const { mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall } = __p.bag;
  return (
    <RecordShellView20 bag={{ mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall }} />
  );
}
