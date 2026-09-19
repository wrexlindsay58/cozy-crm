import { Calendar, ClipboardList, Clock, Image, ListChecks, MessageSquare, StickyNote, Tag, Users } from "lucide-react";

export type ConvLane = "customer" | "internal" | "notes" | "tags" | "actions" | "history" | "media" | "form" | "book";

export const LANES: { id: ConvLane; label: string; icon: typeof MessageSquare }[] = [
  { id: "customer", label: "Customer", icon: MessageSquare },
  { id: "internal", label: "Internal", icon: Users },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "tags", label: "Tags", icon: Tag },
  { id: "actions", label: "Actions", icon: ListChecks },
  { id: "history", label: "History", icon: Clock },
  { id: "media", label: "Media & Files", icon: Image },
  { id: "book", label: "Book", icon: Calendar },
  { id: "form", label: "Form", icon: ClipboardList },
];
