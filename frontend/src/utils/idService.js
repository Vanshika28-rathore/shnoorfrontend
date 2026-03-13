import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../auth/firebase";

/**
 * Generates or retrieves a unique certificate ID for a user and course.
 * Format: SHN-YYYY-XXXX (e.g., SHN-2026-A1B2)
 */
export const getOrGenerateCertificateId = async (userId, courseName, studentName) => {
    if (!userId || !courseName) return null;

    // Sanitize course name for document ID
    const sanitizedCourse = courseName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const docId = `${userId}_${sanitizedCourse}`;
    const certRef = doc(db, "issued_certificates", docId);

    try {
        const certSnap = await getDoc(certRef);

        if (certSnap.exists()) {
            return certSnap.data().certificateId;
        }

        // Generate New ID
        const year = new Date().getFullYear();
        const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        const newId = `SHN-${year}-${randomPart}`;

        // Save to Firestore
        await setDoc(certRef, {
            userId,
            courseName,
            studentName: studentName || "Student",
            certificateId: newId,
            issuedAt: serverTimestamp(),
        });

        return newId;
    } catch (error) {
        console.error("Error in getOrGenerateCertificateId:", error);
        // Fallback ID if Firestore fails (not saved)
        return `SHN-${new Date().getFullYear()}-TEMP`;
    }
};
