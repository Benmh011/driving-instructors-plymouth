"use client";

import { useEffect, useState } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const DISMISS_KEY = "dip-push-prompt-dismissed";
const RESHOW_AFTER_MS = 14 * 24 * 60 * 60 * 1000; // 2 weeks

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

type Mode = "hidden" | "enable" | "ios-install";

export default function PushPrompt() {
  const [mode, setMode] = useState<Mode>("hidden");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!VAPID_PUBLIC_KEY) return;

    try {
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      if (dismissedAt && Date.now() - Number(dismissedAt) < RESHOW_AFTER_MS) return;
    } catch {
      /* ignore */
    }

    const supported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    if (!supported) {
      if (isIos() && !isStandalone()) setMode("ios-install");
      return;
    }

    // Only nudge people who haven't decided yet.
    if (Notification.permission !== "default") return;

    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (!sub) setMode("enable");
      })
      .catch(() => setMode("enable"));
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setMode("hidden");
  }

  async function enable() {
    if (!VAPID_PUBLIC_KEY) return;
    setWorking(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMode("hidden");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      setMode("hidden");
    } catch {
      /* leave the prompt up so they can retry */
    } finally {
      setWorking(false);
    }
  }

  if (mode === "hidden") return null;

  if (mode === "ios-install") {
    return (
      <div className="mb-8 flex items-start gap-4 rounded-2xl border border-sea/30 bg-sea/10 p-5">
        <span className="text-2xl leading-none">🔔</span>
        <div className="flex-1 text-[15px]">
          <p className="font-display font-semibold text-ink">Want lesson alerts?</p>
          <p className="mt-1 text-ink-soft">
            On iPhone, add this app to your Home Screen first (the Share button &rarr; Add
            to Home Screen), open it from there, then you can switch on notifications.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 text-xl text-ink-soft transition-colors hover:text-ink"
        >
          &times;
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-sea/30 bg-sea/10 p-5 sm:flex-row sm:items-center">
      <span className="text-2xl leading-none">🔔</span>
      <div className="flex-1 text-[15px]">
        <p className="font-display font-semibold text-ink">Turn on lesson alerts</p>
        <p className="mt-1 text-ink-soft">
          Get notified about new messages, bookings and upcoming lessons — even when the
          app is closed.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={dismiss}
          className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
        >
          Not now
        </button>
        <button
          type="button"
          onClick={enable}
          disabled={working}
          className="rounded-full bg-sea px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sea-dark disabled:opacity-60"
        >
          {working ? "One sec…" : "Turn on alerts"}
        </button>
      </div>
    </div>
  );
}
