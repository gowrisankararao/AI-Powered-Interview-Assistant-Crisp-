import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url"; // 👈 worker setup
import mammoth from "mammoth";
import Tesseract from "tesseract.js"; // 👈 optional OCR fallback

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// Extract text from PDF
export async function extractTextFromPdf(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strs = content.items.map((i) => i.str).join(" ");
      text += "\n" + strs;
    }

    if (!text.trim()) {
      console.warn("PDF has no extractable text — possible scanned resume.");
    }

    return text;
  } catch (err) {
    console.error("PDF parsing failed:", err);
    throw new Error("Unable to read PDF. Try another file.");
  }
}

// OCR fallback (for scanned PDFs)
export async function extractTextWithOCR(file) {
  console.log("Using OCR fallback...");
  const { data: { text } } = await Tesseract.recognize(file, "eng");
  return text;
}

// Extract text from DOCX
export async function extractTextFromDocx(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (err) {
    console.error("DOCX parsing failed:", err);
    throw new Error("Unable to read DOCX. Try another file.");
  }
}

// Parse contact info
export function parseContactInfo(text) {
  if (!text) return { name: "", email: "", phone: "" };

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const firstLine = lines.length > 0 ? lines[0] : "";

  const nameMatch =
    text.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2})/) || (firstLine ? [firstLine] : null);

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);

  return {
    name: nameMatch ? nameMatch[0].trim() : "",
    email: emailMatch ? emailMatch[0].trim() : "",
    phone: phoneMatch ? phoneMatch[0].replace(/\s+/g, "") : "",
  };
}

// Main parser
export async function parseResume(file) {
  let text = "";

  try {
    if (file.type === "application/pdf") {
      text = await extractTextFromPdf(file);
      if (!text.trim()) {
        text = await extractTextWithOCR(file); // fallback if scanned
      }
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx")
    ) {
      text = await extractTextFromDocx(file);
    } else {
      throw new Error("Unsupported file format. Please upload PDF or DOCX.");
    }

    console.log("Extracted Resume Text:", text);

    const profile = parseContactInfo(text);

    return {
      ...profile,
      rawText: text, // keep full resume text for debugging
    };
  } catch (err) {
    console.error("Resume parsing error:", err);
    throw new Error("Failed to parse resume: " + err.message);
  }
}
