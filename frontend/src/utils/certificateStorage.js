/**
 * Local certificate storage – certificates appear as soon as a student passes an exam,
 * without depending on the backend.
 */

const STORAGE_KEY = "local_certificates";

function getStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStorage(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Could not save certificates to localStorage", e);
  }
}

/**
 * Get all certificates for the current user (by user_id from localStorage).
 * Returns array of { id, course, date, score }.
 */
export function getLocalCertificates() {
  const userId = typeof localStorage !== "undefined" ? localStorage.getItem("user_id") : null;
  const all = getStorage();
  const forUser = userId ? all.filter((c) => c.userId === userId) : [];
  return forUser.map((c) => ({
    id: c.id,
    course: c.course,
    date: c.date,
    score: c.score,
    previewColor: "#003366",
  }));
}

/**
 * Add a certificate locally when a student passes an exam (no backend required).
 * @param {{ course: string, score: number }} opts
 */
export function addLocalCertificate(opts) {
  const userId = typeof localStorage !== "undefined" ? localStorage.getItem("user_id") : null;
  const list = getStorage();
  const id = `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const date = new Date().toLocaleDateString();
  list.push({
    id,
    userId: userId || "",
    course: opts.course || "Exam",
    score: opts.score ?? 0,
    date,
  });
  setStorage(list);
}
