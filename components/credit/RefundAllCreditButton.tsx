"use client";

import { useState, useTransition } from "react";
import { refundAllCredit } from "@/app/dashboard/credit/actions";

const PHRASE = "REFUND ALL";

export default function RefundAllCreditButton({ count }: { count: number }) {
  const [arming, setArming] = useState(false);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  const ready = text.trim().toUpperCase() === PHRASE;
  const plural = count === 1 ? "" : "s";

  function confirm() {
    if (!ready) return;
    setError("");
    setDone("");
    startTransition(async () => {
      const res = await refundAllCredit();
      if (res?.error) setError(res.error);
      else {
        const n = res?.students ?? 0;
        setDone(`Refunded ${n} student${n === 1 ? "" : "s"}.`);
      }
      setArming(false);
      setText("");
    });
  }

  if (done) return <p className="text-sm font-semibold text-go">{done}</p>;

  if (!arming) {
    return (
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => setArming(true)}
          className="self-start rounded-full border border-signal px-4 py-2 text-sm font-semibold text-signal transition-colors hover:bg-signal hover:text-white press"
        >
          Refund everyone…
        </button>
        {error && <span className="text-xs font-medium text-signal">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-sm text-ink">
        This refunds unused hours to{" "}
        <span className="font-semibold">
          all {count} student{plural}
        </span>{" "}
        and can&rsquo;t be undone. Type{" "}
        <span className="font-mono font-semibold tracking-wide">{PHRASE}</span>{" "}
        to confirm.
      </p>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
        spellCheck={false}
        placeholder={PHRASE}
        className="w-52 rounded-xl border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-sea"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={confirm}
          disabled={!ready || pending}
          className="rounded-full bg-signal px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-signal/90 disabled:opacity-40 press"
        >
          {pending ? "Refunding…" : `Refund all ${count}`}
        </button>
        <button
          type="button"
          onClick={() => {
            setArming(false);
            setText("");
          }}
          disabled={pending}
          className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
      {error && <span className="text-xs font-medium text-signal">{error}</span>}
    </div>
  );
}
