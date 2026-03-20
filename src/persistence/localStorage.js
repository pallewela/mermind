export function loadFromLocalStorage(key) {
  try {
    const v = localStorage.getItem(key);
    return v || null;
  } catch {
    return null;
  }
}

export function saveToLocalStorage(key, value) {
  try {
    localStorage.setItem(key, String(value ?? ""));
  } catch {
    // ignore
  }
}

