// Shared localStorage-backed preference for whether Cuelume's UI sounds are
// enabled. Cuelume itself just starts enabled every load and doesn't persist
// a mute choice, so CuelumeSetup (root layout) and PrimaryNav's overlay menu
// toggle both go through these two helpers to keep the storage key and the
// "missing/invalid value defaults to enabled" behavior in one place.
const STORAGE_KEY = "cuelume-sound-enabled";

export function getStoredSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_KEY) !== "off";
}

export function setStoredSoundEnabled(enabled: boolean): void {
  window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
}
