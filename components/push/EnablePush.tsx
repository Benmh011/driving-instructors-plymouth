"use client";

import { useEffect, useState } from "react";

type State =
  | "loading"
  | "nokey"
  | "unsupported"
  | "ios-needs-install"
  | "denied"
  | "off"
  | "on"
  | "working";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

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
    // iOS Safari legacy flag
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

// Reject after `ms` so a stalled step (pushManager.subscribe is notorious for
// hanging on iOS PWAs) can't leave the button stuck on "One sec…".
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms),
    ),
  ]);
}

export default function EnablePush() {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (!VAPID_PUBLIC_KEY) {
      setState("nokey");
      return;
    }
    const supported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    if (!supported) {
      // On iOS, push only exists once the app is installed to the home screen.
      if (isIos() && !isStandalone()) setState("ios-needs-install");
      else setState("unsupported");
      return;
    }

    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }

    // Guard against navigator.serviceWorker.ready never resolving (seen on
    // some installed iOS PWAs) — if it hasn't settled shortly, fall back to
    // "off" so the enable button still appears instead of a blank loading box.
    let settled = false;
    const fallback = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        setState("off");
      }
    }, 4000);

    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(fallback);
        setState(sub ? "on" : "off");
      })
      .catch(() => {
        if (settled) return;
        settled = true;
        window.clearTimeout(fallback);
        setState("off");
      });

    return () => window.clearTimeout(fallback);
  }, []);

  async function enable() {
    if (!VAPID_PUBLIC_KEY) return;
    setState("working");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        return;
      }
      const reg = await withTimeout(navigator.serviceWorker.ready, 5000);
      // Reuse an existing browser subscription if there is one; only create a
      // fresh one when needed (re-subscribing can stall on iOS).
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await withTimeout(
          reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              VAPID_PUBLIC_KEY,
            ) as BufferSource,
          }),
          12000,
        );
      }
      // Register server-side, but don't let a slow/failed POST strand the UI —
      // the device is subscribed at the browser level either way.
      await withTimeout(
        fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub.toJSON()),
        }),
        8000,
      ).catch(() => {});
      setState("on");
    } catch {
      // Whatever went wrong, settle on the truth: does the browser actually
      // have a subscription? Never leave the button stuck on "working".
      try {
        const reg = await withTimeout(navigator.serviceWorker.ready, 3000);
        const sub = await reg.pushManager.getSubscription();
        setState(sub ? "on" : "off");
      } catch {
        setState("off");
      }
    }
  }

  async function disable() {
    setState("working");
    try {
      const reg = await withTimeout(navigator.serviceWorker.ready, 5000);
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
        await sub.unsubscribe().catch(() => {});
      }
      setState("off");
    } catch {
      setState("on");
    }
  }

  // Hide only while still detecting, or when notifications aren't configured
  // for the site at all.
  if (state === "loading" || state === "nokey") {
    return null;
  }

  const shell =
    "rounded-2xl border border-hairline bg-cream p-5 flex items-start gap-4";

  if (state === "unsupported") {
    return (
      <div className={shell}>
        <div className="text-2xl leading-none">🔔</div>
        <div className="text-[15px] text-ink-soft">
          <p className="font-display font-semibold text-ink">
            Notifications not available here
          </p>
          <p className="mt-1">
            This device or browser can&rsquo;t show app notifications. On iPhone
            you need iOS 16.4 or newer, and the app must be opened from your Home
            Screen (not Safari).
          </p>
        </div>
      </div>
    );
  }

  if (state === "ios-needs-install") {
    return (
      <div className={shell}>
        <div className="text-2xl leading-none">🔔</div>
        <div className="text-[15px] text-ink-soft">
          <p className="font-display font-semibold text-ink">Turn on alerts</p>
          <p className="mt-1">
            Add this app to your Home Screen (Share &rarr; Add to Home Screen),
            open it from there, then come back to switch on notifications.
          </p>
        </div>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className={shell}>
        <div className="text-2xl leading-none">🔕</div>
        <div className="text-[15px] text-ink-soft">
          <p className="font-display font-semibold text-ink">Alerts are blocked</p>
          <p className="mt-1">
            Notifications are turned off for this app in your device settings.
            Re-enable them there to get message alerts.
          </p>
        </div>
      </div>
    );
  }

  const busy = state === "working";

  return (
    <div className={shell}>
      <div className="text-2xl leading-none">{state === "on" ? "🔔" : "🔕"}</div>
      <div className="flex-1">
        <p className="font-display font-semibold text-ink">
          {state === "on" ? "Alerts are on" : "Get message alerts"}
        </p>
        <p className="mt-1 text-[15px] text-ink-soft">
          {state === "on"
            ? "We'll notify this device when you get a new message."
            : "Get a notification on this device when someone messages you."}
        </p>
        <button
          type="button"
          onClick={state === "on" ? disable : enable}
          disabled={busy}
          className={`mt-3 rounded-full px-5 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
            state === "on" ? "bg-ink/70 hover:bg-ink" : "bg-sea hover:bg-sea-dark"
          }`}
        >
          {busy
            ? "One sec…"
            : state === "on"
              ? "Turn off"
              : "Turn on notifications"}
        </button>
      </div>
    </div>
  );
}
