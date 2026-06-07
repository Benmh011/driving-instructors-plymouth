"use client";

import { useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import { saveBadge } from "@/app/dashboard/badge/actions";

export default function BadgeUpload() {
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const blob = await upload(`badges/${file.name}`, file, {
        access: "private",
        handleUploadUrl: "/api/badge-upload",
      });
      startTransition(() => {
        saveBadge(blob.pathname);
      });
    } catch {
      setError("Upload failed — try a JPG, PNG or WebP under 15MB.");
    } finally {
      setUploading(false);
    }
  }

  const busy = uploading || pending;

  return (
    <div>
      <label
        className={`inline-flex cursor-pointer items-center gap-2 rounded-full bg-sea px-6 py-3 font-semibold text-white transition-colors hover:bg-sea-dark ${
          busy ? "cursor-not-allowed opacity-60" : ""
        }`}
      >
        {busy ? "Uploading…" : "Upload badge photo"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={busy}
          onChange={onChange}
        />
      </label>
      {error && <p className="mt-2 text-sm font-medium text-signal">{error}</p>}
    </div>
  );
}
