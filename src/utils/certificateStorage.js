/**
 * Local certificate storage – certificates appear as soon as a student passes an exam,
 * without depending on the backend.
 */

const STORAGE_KEY = "local_certificates";

export function normalizeCertificateCourseName(course) {
  const value = String(course || "").trim();
  const lower = value.toLowerCase();

  if (
    lower === "react fundamentals quiz" ||
    lower === "practice quiz" ||
    lower.includes("practice quiz")
  ) {
    return "PRACTICE QUIZ";
  }

  return value || "Exam";
}

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

export function claimAnonymousCertificates(userId) {
  if (!userId) return;

  const list = getStorage();
  let changed = false;

  const nextList = list.map((certificate) => {
    if (certificate.userId) {
      return certificate;
    }

    changed = true;
    return {
      ...certificate,
      userId,
    };
  });

  if (changed) {
    setStorage(nextList);
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
    course: normalizeCertificateCourseName(c.course),
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
  const course = normalizeCertificateCourseName(opts.course);

  if (userId) {
    const existingCertificate = list.find(
      (certificate) => certificate.userId === userId && normalizeCertificateCourseName(certificate.course) === course
    );

    if (existingCertificate) {
      return existingCertificate;
    }
  }

  const id = `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const date = new Date().toLocaleDateString();
  const certificate = {
    id,
    userId: userId || "",
    course,
    score: opts.score ?? 0,
    date,
  };

  list.push(certificate);
  setStorage(list);

  return certificate;
}