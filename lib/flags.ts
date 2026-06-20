// Block bookings / prepaid credit are gated OFF by default. The prepaid model
// needs FCA-aware legal sign-off before it goes live, so it stays hidden until
// BLOCK_BOOKINGS_ENABLED=true is set in the environment.
export function blockBookingsEnabled(): boolean {
  return process.env.BLOCK_BOOKINGS_ENABLED === "true";
}
