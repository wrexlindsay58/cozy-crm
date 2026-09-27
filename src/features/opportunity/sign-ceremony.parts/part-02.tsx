import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { Proposal } from "../store";
import { SignCeremony } from "./part-01";
import { SignCeremonyView20 } from "./part-03";

export function SignDialog({
  proposal,
  optionId,
  onClose,
}: {
  proposal: Proposal;
  optionId: string;
  onClose: () => void;
}) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4" role="dialog" aria-modal="true" aria-label="Sign in person">
      <div className="max-h-[94vh] w-full max-w-4xl overflow-auto rounded-md bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="type-group">Sign in person</p>
          <button type="button" className="grid size-10 place-items-center text-muted" aria-label="Close" onClick={onClose}>
            <X className="size-5" />
          </button>
        </div>
        <SignCeremony proposal={proposal} mode="in-home" optionId={optionId} witnessed tall onDone={onClose} />
      </div>
    </div>,
    document.body,
  );
}

export function SignCeremonyView3(props: { bag: { mode: any; lead: any; agreement: any; onScroll: any; tall: any; markup: any; read: any; records: any; setRecords: any; paper: any; setPaper: any; intent: any; setIntent: any; waiting: any; name: any; setName: any; setSignature: any; ready: any; sign: any; co: any; coName: any; setCoName: any; setCoSignature: any; coReady: any; witnessed: any; proposal: any; opt: any; brand: any; setEmailed: any; emailed: any } }) {
  const { mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed } = props.bag;
  return (
    <SignCeremonyView4 bag={{ mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed }} />
  );
}

function SignCeremonyView4(props: { bag: { mode: any; lead: any; agreement: any; onScroll: any; tall: any; markup: any; read: any; records: any; setRecords: any; paper: any; setPaper: any; intent: any; setIntent: any; waiting: any; name: any; setName: any; setSignature: any; ready: any; sign: any; co: any; coName: any; setCoName: any; setCoSignature: any; coReady: any; witnessed: any; proposal: any; opt: any; brand: any; setEmailed: any; emailed: any } }) {
  const { mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed } = props.bag;
  return (
    <SignCeremonyView5 bag={{ mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed }} />
  );
}

function SignCeremonyView5(props: { bag: { mode: any; lead: any; agreement: any; onScroll: any; tall: any; markup: any; read: any; records: any; setRecords: any; paper: any; setPaper: any; intent: any; setIntent: any; waiting: any; name: any; setName: any; setSignature: any; ready: any; sign: any; co: any; coName: any; setCoName: any; setCoSignature: any; coReady: any; witnessed: any; proposal: any; opt: any; brand: any; setEmailed: any; emailed: any } }) {
  const { mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed } = props.bag;
  return (
    <SignCeremonyView6 bag={{ mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed }} />
  );
}

function SignCeremonyView6(props: { bag: { mode: any; lead: any; agreement: any; onScroll: any; tall: any; markup: any; read: any; records: any; setRecords: any; paper: any; setPaper: any; intent: any; setIntent: any; waiting: any; name: any; setName: any; setSignature: any; ready: any; sign: any; co: any; coName: any; setCoName: any; setCoSignature: any; coReady: any; witnessed: any; proposal: any; opt: any; brand: any; setEmailed: any; emailed: any } }) {
  const { mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed } = props.bag;
  return (
    <SignCeremonyView7 bag={{ mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed }} />
  );
}

function SignCeremonyView7(props: { bag: { mode: any; lead: any; agreement: any; onScroll: any; tall: any; markup: any; read: any; records: any; setRecords: any; paper: any; setPaper: any; intent: any; setIntent: any; waiting: any; name: any; setName: any; setSignature: any; ready: any; sign: any; co: any; coName: any; setCoName: any; setCoSignature: any; coReady: any; witnessed: any; proposal: any; opt: any; brand: any; setEmailed: any; emailed: any } }) {
  const { mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed } = props.bag;
  return (
    <SignCeremonyView8 bag={{ mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed }} />
  );
}

function SignCeremonyView8(props: { bag: { mode: any; lead: any; agreement: any; onScroll: any; tall: any; markup: any; read: any; records: any; setRecords: any; paper: any; setPaper: any; intent: any; setIntent: any; waiting: any; name: any; setName: any; setSignature: any; ready: any; sign: any; co: any; coName: any; setCoName: any; setCoSignature: any; coReady: any; witnessed: any; proposal: any; opt: any; brand: any; setEmailed: any; emailed: any } }) {
  const { mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed } = props.bag;
  return (
    <SignCeremonyView9 bag={{ mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed }} />
  );
}

function SignCeremonyView9(props: { bag: { mode: any; lead: any; agreement: any; onScroll: any; tall: any; markup: any; read: any; records: any; setRecords: any; paper: any; setPaper: any; intent: any; setIntent: any; waiting: any; name: any; setName: any; setSignature: any; ready: any; sign: any; co: any; coName: any; setCoName: any; setCoSignature: any; coReady: any; witnessed: any; proposal: any; opt: any; brand: any; setEmailed: any; emailed: any } }) {
  const { mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed } = props.bag;
  return (
    <SignCeremonyView10 bag={{ mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed }} />
  );
}

function SignCeremonyView10(props: { bag: { mode: any; lead: any; agreement: any; onScroll: any; tall: any; markup: any; read: any; records: any; setRecords: any; paper: any; setPaper: any; intent: any; setIntent: any; waiting: any; name: any; setName: any; setSignature: any; ready: any; sign: any; co: any; coName: any; setCoName: any; setCoSignature: any; coReady: any; witnessed: any; proposal: any; opt: any; brand: any; setEmailed: any; emailed: any } }) {
  const { mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed } = props.bag;
  return (
    <SignCeremonyView11 bag={{ mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed }} />
  );
}

function SignCeremonyView11(props: { bag: { mode: any; lead: any; agreement: any; onScroll: any; tall: any; markup: any; read: any; records: any; setRecords: any; paper: any; setPaper: any; intent: any; setIntent: any; waiting: any; name: any; setName: any; setSignature: any; ready: any; sign: any; co: any; coName: any; setCoName: any; setCoSignature: any; coReady: any; witnessed: any; proposal: any; opt: any; brand: any; setEmailed: any; emailed: any } }) {
  const { mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed } = props.bag;
  return (
    <SignCeremonyView12 bag={{ mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed }} />
  );
}

function SignCeremonyView12(props: { bag: { mode: any; lead: any; agreement: any; onScroll: any; tall: any; markup: any; read: any; records: any; setRecords: any; paper: any; setPaper: any; intent: any; setIntent: any; waiting: any; name: any; setName: any; setSignature: any; ready: any; sign: any; co: any; coName: any; setCoName: any; setCoSignature: any; coReady: any; witnessed: any; proposal: any; opt: any; brand: any; setEmailed: any; emailed: any } }) {
  const { mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed } = props.bag;
  return (
    <SignCeremonyView13 bag={{ mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed }} />
  );
}

function SignCeremonyView13(props: { bag: { mode: any; lead: any; agreement: any; onScroll: any; tall: any; markup: any; read: any; records: any; setRecords: any; paper: any; setPaper: any; intent: any; setIntent: any; waiting: any; name: any; setName: any; setSignature: any; ready: any; sign: any; co: any; coName: any; setCoName: any; setCoSignature: any; coReady: any; witnessed: any; proposal: any; opt: any; brand: any; setEmailed: any; emailed: any } }) {
  const { mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed } = props.bag;
  return (
    <SignCeremonyView14 bag={{ mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed }} />
  );
}

function SignCeremonyView14(props: { bag: { mode: any; lead: any; agreement: any; onScroll: any; tall: any; markup: any; read: any; records: any; setRecords: any; paper: any; setPaper: any; intent: any; setIntent: any; waiting: any; name: any; setName: any; setSignature: any; ready: any; sign: any; co: any; coName: any; setCoName: any; setCoSignature: any; coReady: any; witnessed: any; proposal: any; opt: any; brand: any; setEmailed: any; emailed: any } }) {
  const { mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed } = props.bag;
  return (
    <SignCeremonyView15 bag={{ mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed }} />
  );
}

function SignCeremonyView15(props: { bag: { mode: any; lead: any; agreement: any; onScroll: any; tall: any; markup: any; read: any; records: any; setRecords: any; paper: any; setPaper: any; intent: any; setIntent: any; waiting: any; name: any; setName: any; setSignature: any; ready: any; sign: any; co: any; coName: any; setCoName: any; setCoSignature: any; coReady: any; witnessed: any; proposal: any; opt: any; brand: any; setEmailed: any; emailed: any } }) {
  const { mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed } = props.bag;
  return (
    <SignCeremonyView16 bag={{ mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed }} />
  );
}

function SignCeremonyView16(props: { bag: { mode: any; lead: any; agreement: any; onScroll: any; tall: any; markup: any; read: any; records: any; setRecords: any; paper: any; setPaper: any; intent: any; setIntent: any; waiting: any; name: any; setName: any; setSignature: any; ready: any; sign: any; co: any; coName: any; setCoName: any; setCoSignature: any; coReady: any; witnessed: any; proposal: any; opt: any; brand: any; setEmailed: any; emailed: any } }) {
  const { mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed } = props.bag;
  return (
    <SignCeremonyView17 bag={{ mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed }} />
  );
}

function SignCeremonyView17(props: { bag: { mode: any; lead: any; agreement: any; onScroll: any; tall: any; markup: any; read: any; records: any; setRecords: any; paper: any; setPaper: any; intent: any; setIntent: any; waiting: any; name: any; setName: any; setSignature: any; ready: any; sign: any; co: any; coName: any; setCoName: any; setCoSignature: any; coReady: any; witnessed: any; proposal: any; opt: any; brand: any; setEmailed: any; emailed: any } }) {
  const { mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed } = props.bag;
  return (
    <SignCeremonyView18 bag={{ mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed }} />
  );
}

function SignCeremonyView18(props: { bag: { mode: any; lead: any; agreement: any; onScroll: any; tall: any; markup: any; read: any; records: any; setRecords: any; paper: any; setPaper: any; intent: any; setIntent: any; waiting: any; name: any; setName: any; setSignature: any; ready: any; sign: any; co: any; coName: any; setCoName: any; setCoSignature: any; coReady: any; witnessed: any; proposal: any; opt: any; brand: any; setEmailed: any; emailed: any } }) {
  const { mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed } = props.bag;
  return (
    <SignCeremonyView19 bag={{ mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed }} />
  );
}

function SignCeremonyView19(props: { bag: { mode: any; lead: any; agreement: any; onScroll: any; tall: any; markup: any; read: any; records: any; setRecords: any; paper: any; setPaper: any; intent: any; setIntent: any; waiting: any; name: any; setName: any; setSignature: any; ready: any; sign: any; co: any; coName: any; setCoName: any; setCoSignature: any; coReady: any; witnessed: any; proposal: any; opt: any; brand: any; setEmailed: any; emailed: any } }) {
  const { mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed } = props.bag;
  return (
    <SignCeremonyView20 bag={{ mode, lead, agreement, onScroll, tall, markup, read, records, setRecords, paper, setPaper, intent, setIntent, waiting, name, setName, setSignature, ready, sign, co, coName, setCoName, setCoSignature, coReady, witnessed, proposal, opt, brand, setEmailed, emailed }} />
  );
}
