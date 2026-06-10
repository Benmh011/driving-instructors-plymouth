"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removePhoto } from "@/app/dashboard/profile/actions";

const MAX_DIM = 512;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't read that image — try a JPG or PNG."));
    };
    img.src = url;
  });
}

// Downscale to a square-ish avatar and re-encode as JPEG to keep it small.
async function toResizedJpeg(file: File): Promise<Blob> {
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image processing isn't supported on this browser.");
  ctx.drawImage(img, 0, 0, w, h);
  const blob: Blob | null = await new Promise((res) =>
    canvas.toBlob((b) => res(b), "image/jpeg", 0.85),
  );
  if (!blob) throw new Error("Couldn't process that image.");
  return blob;
}

export default function PhotoUpload({
  photoSrc,
  initials,
}: {
  photoSrc: string | null;
  initials: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const resized = await toResizedJpeg(file);
      const form = new FormData();
      form.append("file", resized, "photo.jpg");
      const res = await fetch("/api/photo", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed — please try again.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed — please try again.");
    } finally {
      setBusy(false);
    }
  }

  function onRemove() {
    setError(null);
    startTransition(async () => {
      await removePhoto();
      router.refresh();
    });
  }

  const working = busy || pending;

  return (
    <div className="flex items-center gap-5">
      {photoSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoSrc}
          alt="Your profile photo"
          className="h-20 w-20 shrink-0 rounded-2xl object-cover"
        />
      ) : (
        <div
          className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-tarmac font-display text-2xl font-bold text-cream"
          aria-hidden
        >
          {initials}
        </div>
      )}

      <div>
        <div className="flex flex-wrap gap-3">
          <label
            className={`inline-flex cursor-pointer items-center rounded-full bg-sea px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sea-dark ${
              working ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            {working ? "Working…" : photoSrc ? "Change photo" : "Upload a photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={working}
              onChange={onChange}
            />
          </label>
          {photoSrc && (
            <button
              type="button"
              onClick={onRemove}
              disabled={working}
              className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
        <p className="mt-2 text-sm text-ink-soft">
          JPG, PNG or WebP — we&rsquo;ll resize it for you.
        </p>
        {error && <p className="mt-2 text-sm font-medium text-signal">{error}</p>}
      </div>
    </div>
  );
}
