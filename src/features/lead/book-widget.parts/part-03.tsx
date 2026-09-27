import { DAYS, HOURS, LENGTHS, selectClass } from "./part-01";
import { Field } from "./part-02";
import { BookWidgetView21 } from "./part-04";

export function BookWidgetView(props: { bag: { day: any; setDay: any; hour: any; setHour: any; length: any; setLength: any } }) {
  const { day, setDay, hour, setHour, length, setLength } = props.bag;
  return (
    <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Day">
              <select value={day} onChange={(e) => setDay(Number(e.target.value))} className={selectClass}>
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    Sep {d}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Time">
              <select value={hour} onChange={(e) => setHour(e.target.value)} className={selectClass}>
                {HOURS.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
            </Field>
            <Field label="Length">
              <select value={length} onChange={(e) => setLength(e.target.value)} className={selectClass}>
                {LENGTHS.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
            </Field>
          </div>
  );
}

export function BookWidgetView5(props: { bag: { leadId: any; kind: any; day: any; hour: any; assignee: any; setBy: any; notes: any; def: any; crew: any; length: any; scope: any; pipe: any; setSaved: any; setOpen: any; onKind: any; setAssignee: any; assignList: any; setCrew: any; setDay: any; setHour: any; setLength: any; setNotes: any; setScope: any; saved: any } }) {
  const { leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved } = props.bag;
  return (
    <BookWidgetView6 bag={{ leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved }} />
  );
}

function BookWidgetView6(props: { bag: { leadId: any; kind: any; day: any; hour: any; assignee: any; setBy: any; notes: any; def: any; crew: any; length: any; scope: any; pipe: any; setSaved: any; setOpen: any; onKind: any; setAssignee: any; assignList: any; setCrew: any; setDay: any; setHour: any; setLength: any; setNotes: any; setScope: any; saved: any } }) {
  const { leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved } = props.bag;
  return (
    <BookWidgetView7 bag={{ leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved }} />
  );
}

function BookWidgetView7(props: { bag: { leadId: any; kind: any; day: any; hour: any; assignee: any; setBy: any; notes: any; def: any; crew: any; length: any; scope: any; pipe: any; setSaved: any; setOpen: any; onKind: any; setAssignee: any; assignList: any; setCrew: any; setDay: any; setHour: any; setLength: any; setNotes: any; setScope: any; saved: any } }) {
  const { leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved } = props.bag;
  return (
    <BookWidgetView8 bag={{ leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved }} />
  );
}

function BookWidgetView8(props: { bag: { leadId: any; kind: any; day: any; hour: any; assignee: any; setBy: any; notes: any; def: any; crew: any; length: any; scope: any; pipe: any; setSaved: any; setOpen: any; onKind: any; setAssignee: any; assignList: any; setCrew: any; setDay: any; setHour: any; setLength: any; setNotes: any; setScope: any; saved: any } }) {
  const { leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved } = props.bag;
  return (
    <BookWidgetView9 bag={{ leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved }} />
  );
}

function BookWidgetView9(props: { bag: { leadId: any; kind: any; day: any; hour: any; assignee: any; setBy: any; notes: any; def: any; crew: any; length: any; scope: any; pipe: any; setSaved: any; setOpen: any; onKind: any; setAssignee: any; assignList: any; setCrew: any; setDay: any; setHour: any; setLength: any; setNotes: any; setScope: any; saved: any } }) {
  const { leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved } = props.bag;
  return (
    <BookWidgetView10 bag={{ leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved }} />
  );
}

function BookWidgetView10(props: { bag: { leadId: any; kind: any; day: any; hour: any; assignee: any; setBy: any; notes: any; def: any; crew: any; length: any; scope: any; pipe: any; setSaved: any; setOpen: any; onKind: any; setAssignee: any; assignList: any; setCrew: any; setDay: any; setHour: any; setLength: any; setNotes: any; setScope: any; saved: any } }) {
  const { leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved } = props.bag;
  return (
    <BookWidgetView11 bag={{ leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved }} />
  );
}

function BookWidgetView11(props: { bag: { leadId: any; kind: any; day: any; hour: any; assignee: any; setBy: any; notes: any; def: any; crew: any; length: any; scope: any; pipe: any; setSaved: any; setOpen: any; onKind: any; setAssignee: any; assignList: any; setCrew: any; setDay: any; setHour: any; setLength: any; setNotes: any; setScope: any; saved: any } }) {
  const { leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved } = props.bag;
  return (
    <BookWidgetView12 bag={{ leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved }} />
  );
}

function BookWidgetView12(props: { bag: { leadId: any; kind: any; day: any; hour: any; assignee: any; setBy: any; notes: any; def: any; crew: any; length: any; scope: any; pipe: any; setSaved: any; setOpen: any; onKind: any; setAssignee: any; assignList: any; setCrew: any; setDay: any; setHour: any; setLength: any; setNotes: any; setScope: any; saved: any } }) {
  const { leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved } = props.bag;
  return (
    <BookWidgetView13 bag={{ leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved }} />
  );
}

function BookWidgetView13(props: { bag: { leadId: any; kind: any; day: any; hour: any; assignee: any; setBy: any; notes: any; def: any; crew: any; length: any; scope: any; pipe: any; setSaved: any; setOpen: any; onKind: any; setAssignee: any; assignList: any; setCrew: any; setDay: any; setHour: any; setLength: any; setNotes: any; setScope: any; saved: any } }) {
  const { leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved } = props.bag;
  return (
    <BookWidgetView14 bag={{ leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved }} />
  );
}

function BookWidgetView14(props: { bag: { leadId: any; kind: any; day: any; hour: any; assignee: any; setBy: any; notes: any; def: any; crew: any; length: any; scope: any; pipe: any; setSaved: any; setOpen: any; onKind: any; setAssignee: any; assignList: any; setCrew: any; setDay: any; setHour: any; setLength: any; setNotes: any; setScope: any; saved: any } }) {
  const { leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved } = props.bag;
  return (
    <BookWidgetView15 bag={{ leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved }} />
  );
}

function BookWidgetView15(props: { bag: { leadId: any; kind: any; day: any; hour: any; assignee: any; setBy: any; notes: any; def: any; crew: any; length: any; scope: any; pipe: any; setSaved: any; setOpen: any; onKind: any; setAssignee: any; assignList: any; setCrew: any; setDay: any; setHour: any; setLength: any; setNotes: any; setScope: any; saved: any } }) {
  const { leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved } = props.bag;
  return (
    <BookWidgetView16 bag={{ leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved }} />
  );
}

function BookWidgetView16(props: { bag: { leadId: any; kind: any; day: any; hour: any; assignee: any; setBy: any; notes: any; def: any; crew: any; length: any; scope: any; pipe: any; setSaved: any; setOpen: any; onKind: any; setAssignee: any; assignList: any; setCrew: any; setDay: any; setHour: any; setLength: any; setNotes: any; setScope: any; saved: any } }) {
  const { leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved } = props.bag;
  return (
    <BookWidgetView17 bag={{ leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved }} />
  );
}

function BookWidgetView17(props: { bag: { leadId: any; kind: any; day: any; hour: any; assignee: any; setBy: any; notes: any; def: any; crew: any; length: any; scope: any; pipe: any; setSaved: any; setOpen: any; onKind: any; setAssignee: any; assignList: any; setCrew: any; setDay: any; setHour: any; setLength: any; setNotes: any; setScope: any; saved: any } }) {
  const { leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved } = props.bag;
  return (
    <BookWidgetView18 bag={{ leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved }} />
  );
}

function BookWidgetView18(props: { bag: { leadId: any; kind: any; day: any; hour: any; assignee: any; setBy: any; notes: any; def: any; crew: any; length: any; scope: any; pipe: any; setSaved: any; setOpen: any; onKind: any; setAssignee: any; assignList: any; setCrew: any; setDay: any; setHour: any; setLength: any; setNotes: any; setScope: any; saved: any } }) {
  const { leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved } = props.bag;
  return (
    <BookWidgetView19 bag={{ leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved }} />
  );
}

function BookWidgetView19(props: { bag: { leadId: any; kind: any; day: any; hour: any; assignee: any; setBy: any; notes: any; def: any; crew: any; length: any; scope: any; pipe: any; setSaved: any; setOpen: any; onKind: any; setAssignee: any; assignList: any; setCrew: any; setDay: any; setHour: any; setLength: any; setNotes: any; setScope: any; saved: any } }) {
  const { leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved } = props.bag;
  return (
    <BookWidgetView20 bag={{ leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved }} />
  );
}

function BookWidgetView20(props: { bag: { leadId: any; kind: any; day: any; hour: any; assignee: any; setBy: any; notes: any; def: any; crew: any; length: any; scope: any; pipe: any; setSaved: any; setOpen: any; onKind: any; setAssignee: any; assignList: any; setCrew: any; setDay: any; setHour: any; setLength: any; setNotes: any; setScope: any; saved: any } }) {
  const { leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved } = props.bag;
  return (
    <BookWidgetView21 bag={{ leadId, kind, day, hour, assignee, setBy, notes, def, crew, length, scope, pipe, setSaved, setOpen, onKind, setAssignee, assignList, setCrew, setDay, setHour, setLength, setNotes, setScope, saved }} />
  );
}
