"use client";

import { useEffect, useRef, useState } from "react";
import { sendMessage, markRead } from "@/app/messages/actions";

type Msg = { id: string; senderId: string; body: string; createdAt: string };

export default function Conversation({
  instructorId,
  learnerId,
  meId,
  otherName,
  initial,
}: {
  instructorId: string;
  learnerId: string;
  meId: string;
  otherName: string;
  initial: Msg[];
}) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastTsRef = useRef<string | undefined>(initial[initial.length - 1]?.createdAt);

  useEffect(() => {
    lastTsRef.current = messages[messages.length - 1]?.createdAt;
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
    markRead(instructorId, learnerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function pullNew() {
    const params = new URLSearchParams({ instructorId, learnerId });
    if (lastTsRef.current) params.set("after", lastTsRef.current);
    try {
      const res = await fetch(`/api/messages?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { messages: Msg[] };
      if (data.messages.length > 0) {
        setMessages((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          return [...prev, ...data.messages.filter((m) => !seen.has(m.id))];
        });
        if (data.messages.some((m) => m.senderId !== meId)) {
          markRead(instructorId, learnerId);
        }
      }
    } catch {
      // ignore transient network errors
    }
  }

  useEffect(() => {
    const id = setInterval(pullNew, 12000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructorId, learnerId, meId]);

  async function handleSend() {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    const result = await sendMessage(instructorId, learnerId, body);
    setSending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setText("");
    await pullNew();
  }

  return (
    <div className="flex flex-col">
      <div className="rounded-xl border border-line/40 bg-line/10 px-4 py-2.5 text-xs leading-relaxed text-ink-soft">
        Messages are stored and may be reviewed to keep everyone safe. Please keep it about
        lessons.
      </div>

      <div className="mt-4 space-y-2.5">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-[15px] text-ink-soft">
            No messages yet — say hello to {otherName}.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === meId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] ${
                    mine
                      ? "rounded-br-md bg-sea text-white"
                      : "rounded-bl-md border border-hairline bg-cream text-ink"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={`mt-1 text-[11px] ${mine ? "text-white/70" : "text-ink-soft"}`}>
                    {new Date(m.createdAt).toLocaleString("en-GB", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                      day: "numeric",
                      month: "short",
                      timeZone: "UTC",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="mt-3 text-sm font-medium text-signal">{error}</p>}

      <div className="mt-4 flex items-end gap-2">
        <textarea
          name="message"
          aria-label={`Message ${otherName}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          placeholder={`Message ${otherName}…`}
          className="max-h-32 w-full resize-none rounded-2xl border border-ink/20 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-ink"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="shrink-0 rounded-full bg-sea px-5 py-3 font-semibold text-white transition-colors hover:bg-sea-dark disabled:opacity-50"
        >
          {sending ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
