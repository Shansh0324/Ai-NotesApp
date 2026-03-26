/**
 * Extracts text content from a PDF buffer using pdfjs-dist.
 * (pdf-parse v2 is used as a dependency provider for pdfjs-dist)
 * @param {Buffer} buffer - The PDF file buffer.
 * @returns {Promise<string>} Extracted text.
 */
const extractTextFromPDF = async (buffer) => {
    // Dynamic import for the ESM pdfjs-dist module
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

    const uint8Array = new Uint8Array(buffer);
    const doc = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    const textParts = [];
    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(' ');
        textParts.push(pageText);
    }

    await doc.destroy();
    return textParts.join('\n');
};

module.exports = { extractTextFromPDF };
