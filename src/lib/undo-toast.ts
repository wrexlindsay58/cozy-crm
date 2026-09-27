import { toast } from "sonner";

export function undoToast(message: string, undo: () => void) {
  const id = toast(message, {
    duration: 5_000,
    action: {
      label: "Undo",
      onClick: () => {
        undo();
        toast.dismiss(id);
      },
    },
  });
}
