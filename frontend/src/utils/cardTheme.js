// Curated gradient pairs that stay within the app's existing palette
// (ink/stamp/teal/mustard) so cards never clash with the rest of the UI,
// regardless of what destination text the user typed.
const GRADIENTS = [
  'from-teal/70 to-ink/80',
  'from-stamp/70 to-ink/80',
  'from-mustard/70 to-stamp/70',
  'from-ink/80 to-teal/60',
  'from-stamp/60 to-mustard/70',
  'from-indigo/80 to-ink/70',
  'from-indigo/70 to-stamp/60',
];

export function gradientForDestination(destination) {
  let hash = 0;
  for (let i = 0; i < destination.length; i++) {
    hash = (hash * 31 + destination.charCodeAt(i)) >>> 0;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}

export function monogramForDestination(destination) {
  return destination.trim().charAt(0).toUpperCase() || '?';
}