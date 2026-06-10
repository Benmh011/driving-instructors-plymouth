// Builds the public src for an instructor's profile photo, or null if none.
// The ?v= changes whenever the stored pathname changes (every new upload),
// so the immutable cache on the serving route never goes stale.
export function instructorPhotoSrc(
  id: string,
  photoUrl: string | null,
): string | null {
  if (!photoUrl) return null;
  return `/api/instructor-photo/${id}?v=${encodeURIComponent(photoUrl)}`;
}
