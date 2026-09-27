import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useDoors, type FlowPlace } from "./door";

export function FlowRedirect({ id, here }: { id: string; here: FlowPlace }) {
  const doors = useDoors();
  const door = id ? doors[id] : undefined;
  const navigate = useNavigate();
  useEffect(() => {
    if (!door || door.place === here) return;
    if (door.place === "lead") void navigate({ to: "/leads/$leadId", params: { leadId: door.id } });
    else if (door.place === "assessment") void navigate({ to: "/assessments/$assessmentId", params: { assessmentId: door.id } });
    else if (door.place === "opportunity") void navigate({ to: "/opportunities/$oppId", params: { oppId: door.id } });
    else if (door.place === "job") void navigate({ to: "/projects/$projectId", params: { projectId: door.id } });
    else void navigate({ to: "/accounts/$accountId", params: { accountId: door.id } });
  }, [door, here, navigate]);
  return null;
}
