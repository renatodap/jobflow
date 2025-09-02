import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import type { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api'

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.54/pdf.worker.min.js`
}

export interface PDFPage {
  pageNumber: number
  text: string
}

export interface PDFMetadata {
  title?: string
  author?: string
  subject?: string
  keywords?: string[]
  creationDate?: Date
  pageCount: number
  fileSize: number
}

export interface PDFExtractionResult {
  text: string
  pages: PDFPage[]
  metadata: PDFMetadata
}

export async function extractTextFromPDF(buffer: Buffer): Promise<PDFExtractionResult> {
  try {
    // Load the PDF document
    const pdf = await getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      verbosity: 0 // Suppress console logs
    }).promise

    // Extract metadata
    const metadata = await pdf.getMetadata()
    const pageCount = pdf.numPages

    const pdfMetadata: PDFMetadata = {
      title: metadata.info?.Title || undefined,
      author: metadata.info?.Author || undefined,
      subject: metadata.info?.Subject || undefined,
      keywords: metadata.info?.Keywords?.split(',').map(k => k.trim()) || undefined,
      creationDate: metadata.info?.CreationDate || undefined,
      pageCount,
      fileSize: buffer.length
    }

    // Extract text from all pages
    const pages: PDFPage[] = []
    let fullText = ''

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      
      // Combine all text items into a single string for this page
      const pageText = textContent.items
        .filter((item): item is TextItem => 'str' in item)
        .map(item => item.str)
        .join(' ')
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()

      pages.push({
        pageNumber: i,
        text: pageText
      })

      fullText += pageText + '\n\n'
    }

    return {
      text: fullText.trim(),
      pages,
      metadata: pdfMetadata
    }

  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function validatePDFBuffer(buffer: Buffer): { valid: boolean; error?: string } {
  // Check for PDF signature
  const pdfSignature = buffer.subarray(0, 4).toString()
  if (pdfSignature !== '%PDF') {
    return { valid: false, error: 'Invalid PDF file format' }
  }

  // Check minimum file size (PDF header is typically at least 100 bytes)
  if (buffer.length < 100) {
    return { valid: false, error: 'PDF file appears to be corrupted (too small)' }
  }

  return { valid: true }
}

export async function getPDFInfo(buffer: Buffer): Promise<{ pageCount: number; title?: string }> {
  try {
    const pdf = await getDocument({
      data: new Uint8Array(buffer),
      verbosity: 0
    }).promise

    const metadata = await pdf.getMetadata()
    
    return {
      pageCount: pdf.numPages,
      title: metadata.info?.Title || undefined
    }
  } catch (error) {
    throw new Error(`Failed to get PDF info: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}