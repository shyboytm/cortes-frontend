export const PREVIOUS_PATH_KEY = "nav:previousPath";

export function setPreviousPath(pathname: string) {
  try {
    window.sessionStorage.setItem(PREVIOUS_PATH_KEY, pathname);
  } catch {
  }
}
