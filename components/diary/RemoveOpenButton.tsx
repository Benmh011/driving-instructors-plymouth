"use client";

import { useState } from "react";
import { removeOpenLesson } from "@/app/diary/actions";

export default function RemoveOpenButton({ id }: { id: string }) {
  const [pending, setPending] = useState(false);

  function onClick() {
    if (!window.confirm("Remove this open lesson slot?")) return;
    setPending(true);
    void removeOpenLesson(id);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="shrink-0 rounded-full border border-ink/20 px-3.5 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
    >
      {pending ? "…" : "Remove"}
    </button>
  );
}
