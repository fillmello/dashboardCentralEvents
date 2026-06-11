export const HOME_CONFIG = {
  dropNumber: "03",
  dropName: "FUNDAÇÃO",
  heroTitleLine1: "PEDRA",
  heroTitleLine2: "ANGULAR",
  editionSize: 240,
  remaining: 93,
  freeShipping: 600,
  gridCols: 4,
  stripeAngle: -45,
  showCountdown: true,
  showManifesto: true,
  showNewsletter: true,
  // Countdown target: 6 days, 3 hours, 22 minutes from page load
  countdownOffsetMs: (6 * 86400 + 3 * 3600 + 22 * 60) * 1000,
} as const;

export type HomeConfig = typeof HOME_CONFIG;
