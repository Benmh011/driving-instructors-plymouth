"use client";

import { useState } from "react";
import {
  setBlockPackageActive,
  deleteBlockPackage,
} from "@/app/dashboard/blocks/actions";

export default function BlockRowActions({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const [pending, setPending] = useState(false);

  function toggle() {
    setPending(true);
    void setBlockPackageActive(id, !active);
  }

  function remove() {
    if (!window.confirm("Delete this block? Past purchases stay on the ledger.")) {
      return;
    }
    setPending(true);
    void deleteBlockPackage(id);
  }

  return (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className="rounded-full border border-ink/20 px-3.5 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
      >
        {active ? "Hide" : "Show"}
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="rounded-full border border-ink/20 px-3.5 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
