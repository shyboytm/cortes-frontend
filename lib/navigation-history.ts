// sessionStorage key NavigationHistoryTracker writes to, and the one
// useSmartBackHref reads from.
export const PREVIOUS_PATH_KEY = "nav:previousPath";

export function setPreviousPath(pathname: string) {
  try {
    window.sessionStorage.setItem(PREVIOUS_PATH_KEY, pathname);
  } catch {
    // sessionStorage can throw in private-browsing/locked-down contexts —
    // losing "where did they come from" tracking isn't worth failing over.
  }
}
