"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  beginTwoFactorSetup,
  confirmTwoFactorSetup,
  disableTwoFactor,
} from "@/app/dashboard/security/actions";

const btn =
  "press rounded-full bg-sea px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sea-dark disabled:opacity-50";
const ghost =
  "press rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink";
const field =
  "w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-ink";

type View = "idle" | "setup" | "done" | "disable";

export function TwoFactorManager({
  enabled,
  autoStart = false,
  continueHref,
}: {
  enabled: boolean;
  autoStart?: boolean;
  continueHref: string;
}) {
  const [on, setOn] = useState(enabled);
  const [view, setView] = useState<View>("idle");
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function begin() {
    setBusy(true);
    setError("");
    const res = await beginTwoFactorSetup();
    setBusy(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    setQr(res.qr);
    setSecret(res.secret);
    setView("setup");
  }

  useEffect(() => {
    if (autoStart && !on) begin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirm() {
    setBusy(true);
    setError("");
    const fd = new FormData();
    fd.set("code", code);
    const res = await confirmTwoFactorSetup(fd);
    setBusy(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    setBackupCodes(res.backupCodes);
    setOn(true);
    setCode("");
    setView("done");
  }

  async function disable() {
    setBusy(true);
    setError("");
    const fd = new FormData();
    fd.set("code", code);
    const res = await disableTwoFactor(fd);
    setBusy(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    setOn(false);
    setCode("");
    setView("idle");
  }

  // Backup codes screen (shown once right after enabling).
  if (view === "done") {
    return (
      <div className="rounded-2xl border border-hairline bg-cream p-6">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-go" />
          <p className="font-semibold text-ink">Two-factor is now on</p>
        </div>
        <p className="mt-2 text-sm text-ink">
          Save these backup codes somewhere safe. Each one works once if you ever
          lose access to your authenticator app.
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-hairline bg-white p-4 font-mono text-sm">
          {backupCodes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-soft">
          These won&apos;t be shown again.
        </p>
        <Link href={continueHref} className={`mt-4 inline-flex ${btn}`}>
          Done
        </Link>
      </div>
    );
  }

  // Enabled state: status + turn-off flow.
  if (on) {
    return (
      <div className="rounded-2xl border border-hairline bg-cream p-6">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-go" />
          <p className="font-semibold text-ink">
            Two-factor authentication is on
          </p>
        </div>
        <p className="mt-1.5 text-sm text-ink-soft">
          You&apos;ll be asked for a code from your authenticator app each time
          you sign in.
        </p>

        {view === "disable" ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-ink">
              Enter a current code to turn 2FA off:
            </p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit or backup code"
              className={field}
            />
            {error && <p className="text-sm font-medium text-signal">{error}</p>}
            <div className="flex gap-2">
              <button onClick={disable} disabled={busy || !code} className={btn}>
                {busy ? "…" : "Turn off 2FA"}
              </button>
              <button
                onClick={() => {
                  setView("idle");
                  setCode("");
                  setError("");
                }}
                className={ghost}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setView("disable");
              setError("");
            }}
            className={`mt-4 ${ghost}`}
          >
            Turn off
          </button>
        )}
      </div>
    );
  }

  // Setup state: QR + confirm.
  if (view === "setup") {
    return (
      <div className="rounded-2xl border border-hairline bg-cream p-6">
        <p className="font-semibold text-ink">
          Scan this with your authenticator app
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          Google Authenticator, Authy, 1Password — any of them work.
        </p>
        {qr && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qr}
            alt="Two-factor QR code"
            className="mt-4 h-44 w-44 rounded-lg border border-hairline bg-white p-2"
          />
        )}
        <p className="mt-3 text-xs text-ink-soft">
          Can&apos;t scan? Enter this key manually:
        </p>
        <code className="mt-1 block break-all rounded-lg bg-white px-3 py-2 font-mono text-xs">
          {secret}
        </code>
        <div className="mt-4 space-y-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            placeholder="Enter the 6-digit code"
            className={field}
          />
          {error && <p className="text-sm font-medium text-signal">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={confirm}
              disabled={busy || code.replace(/\s/g, "").length < 6}
              className={btn}
            >
              {busy ? "Checking…" : "Confirm & turn on"}
            </button>
            <button
              onClick={() => {
                setView("idle");
                setCode("");
                setError("");
              }}
              className={ghost}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Idle: off, with an enable button.
  return (
    <div className="rounded-2xl border border-hairline bg-cream p-6">
      <p className="font-semibold text-ink">
        Two-factor authentication is off
      </p>
      <p className="mt-1.5 text-sm text-ink-soft">
        Add a one-time code at sign-in so a stolen password isn&apos;t enough on
        its own.
      </p>
      {error && <p className="mt-3 text-sm font-medium text-signal">{error}</p>}
      <button onClick={begin} disabled={busy} className={`mt-4 ${btn}`}>
        {busy ? "…" : "Set up 2FA"}
      </button>
    </div>
  );
}
