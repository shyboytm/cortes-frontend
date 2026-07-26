const STORAGE_KEY = "cuelume-sound-enabled";

export function getStoredSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_KEY) !== "off";
}

export function setStoredSoundEnabled(enabled: boolean): void {
  window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
}
