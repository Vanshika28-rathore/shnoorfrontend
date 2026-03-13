import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Captures a DOM element and downloads it as a PDF.
 * @param {string} elementId - The ID of the element to capture.
 * @param {string} fileName - The name of the downloaded file.
 */
export const exportToPDF = async (elementId, fileName = "certificate.pdf") => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error("Element not found for PDF export:", elementId);
        return;
    }

    try {
        // 1. Capture as canvas with high resolution
        const canvas = await html2canvas(element, {
            scale: 3, // High resolution for professional print
            useCORS: true, // Crucial for external image URLs (Firebase Storage)
            allowTaint: true,
            backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");

        // 2. Initialize PDF (A4 Landscape usually works best for certificates)
        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "px",
            format: [canvas.width, canvas.height],
        });

        const width = pdf.internal.pageSize.getWidth();
        const height = pdf.internal.pageSize.getHeight();

        // 3. Add image to PDF
        pdf.addImage(imgData, "PNG", 0, 0, width, height);

        // 4. Download
        pdf.save(fileName);
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF. Please try again.");
    }
};
