"use client";

import { useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import { savePhoto, removePhoto } from "@/app/dashboard/profile/actions";

export default function PhotoUpload({
  photoUrl,
  initials,
}: {
  photoUrl: string | null;
  initials: string;
}) {
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const blob = await upload(`profile-photos/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/photo-upload",
      });
      startTransition(() => {
        savePhoto(blob.url);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed — please try again.");
      console.error("Photo upload error:", err);
    } finally {
      setUploading(false);
    }
  }

  function onRemove() {
    startTransition(() => {
      removePhoto();
    });
  }

  const busy = uploading || pending;

  return (
    <div className="flex items-center gap-5">
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
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
              busy ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            {busy ? "Uploading…" : photoUrl ? "Change photo" : "Upload a photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={busy}
              onChange={onChange}
            />
          </label>
          {photoUrl && (
            <button
              type="button"
              onClick={onRemove}
              disabled={busy}
              className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
        <p className="mt-2 text-sm text-ink-soft">JPG, PNG or WebP, up to 8MB.</p>
        {error && <p className="mt-2 text-sm font-medium text-signal">{error}</p>}
      </div>
    </div>
  );
}
