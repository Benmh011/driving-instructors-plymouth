// Short, unambiguous join codes — no 0/O/1/I/L, so they survive being
// read aloud, texted, or written on a card.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateInviteCode(length = 8): string {
  let out = "";
  for (let n = 0; n < length; n++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}
