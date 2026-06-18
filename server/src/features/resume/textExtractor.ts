import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  let parser: PDFParse | null = null;

  try {
    parser = new PDFParse({ data: buffer });
    const data = await parser.getText();

    if (!data?.text || data.text.trim().length < 10) {
      throw new Error("PDF has no readable text");
    }

    return data.text;
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Failed to extract text from PDF");
  } finally {
    await parser?.destroy();
  }
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });

    if (!result?.value || result.value.trim().length < 10) {
      throw new Error("DOCX has no readable text");
    }

    return result.value;
  } catch (error) {
    console.error("DOCX extraction error:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}

export async function extractText(
  buffer: Buffer,
  fileType: "pdf" | "docx"
): Promise<string> {
  if (buffer.length > MAX_SIZE) {
    throw new Error("File too large (max 5MB)");
  }

  if (fileType === "pdf") return extractTextFromPDF(buffer);
  if (fileType === "docx") return extractTextFromDOCX(buffer);

  throw new Error("Unsupported file type");
}
