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
        // Foolproof Native PNG Encoder bypassing HTML2Canvas's SVG & CORS processing bugs
        const toPngDataUrl = async (url) => {
            if (!url) return url;
            if (url.startsWith('data:image/png')) return url;

            let cleanUrl = url;
            if (cleanUrl.includes('/public/')) {
                cleanUrl = cleanUrl.replace('/public/', '/');
            }

            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous'; // Essential for Firebase
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    // For SVGs lacking intrinsic sizes, fallback to 200px or their rendered width
                    canvas.width = img.width || img.naturalWidth || 200;
                    canvas.height = img.height || img.naturalHeight || 200;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/png')); // Flawless PNG base64
                };
                img.onerror = (err) => {
                    console.warn('Native Canvas conversion failed for', cleanUrl, err);
                    resolve(cleanUrl);
                };
                // Bust cache to prevent browser from reusing a non-CORS response
                img.src = cleanUrl + (cleanUrl.includes('?') ? '&' : '?') + 'cb=' + new Date().getTime();
            });
        };

        // Convert all images in the ORIGINAL DOM to Base64 (to preserve CSS layout contexts)
        const imgs = Array.from(element.querySelectorAll("img"));
        const originalSrcs = []; // Store original URLs to restore later

        for (let i = 0; i < imgs.length; i++) {
            const img = imgs[i];
            originalSrcs.push(img.src);
            if (img.src && !img.src.startsWith("data:image/png")) {
                img.src = await toPngDataUrl(img.src);
            }
        }

        // Wait for images to be 'complete'
        await Promise.all(
            imgs.map(
                (img) =>
                    new Promise((resolve) => {
                        if (img.complete) resolve();
                        else { img.onload = resolve; img.onerror = resolve; }
                    })
            )
        );

        // Give the browser 100ms to repaint the substituted base64 image data onto the screen
        await new Promise(resolve => setTimeout(resolve, 100));

        // 1. Capture as canvas with high resolution
        const canvas = await html2canvas(element, {
            scale: 3, // High resolution for professional print
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: false,
            onclone: (_clonedDoc, clonedEl) => {
                // Force dimensions to prevent CSS collapse
                const computed = window.getComputedStyle(element);
                clonedEl.style.width = computed.width;
                clonedEl.style.height = computed.height;
            },
        });

        // Restore original image sources so the DOM remains untouched
        for (let i = 0; i < imgs.length; i++) {
            imgs[i].src = originalSrcs[i];
        }

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