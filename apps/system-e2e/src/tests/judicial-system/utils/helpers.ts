import PDFDocument from 'pdfkit'
import getStream from 'get-stream'

export function randomPoliceCaseNumber() {
  return `007-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000)}`
}

export function randomCourtCaseNumber() {
  return `R-${Math.floor(Math.random() * 1000)}/${new Date().getFullYear()}`
}

export function randomAppealCaseNumber() {
  return `${Math.floor(Math.random() * 1000)}/${new Date().getFullYear()}`
}

export async function createPdf(text: string) {
  const doc = new PDFDocument()
  doc.text(text)
  doc.end()
  return await getStream.buffer(doc)
}
