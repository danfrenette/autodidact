import type { ParsedChapter, ParsedDocument } from '../-types'

type OutlineNode = {
  title?: string
  dest?: unknown
  items?: OutlineNode[]
}

type PdfDocument = {
  numPages: number
  getOutline(): Promise<OutlineNode[] | null>
  getDestination(destination: string): Promise<unknown>
  getPageIndex(reference: { num: number; gen: number }): Promise<number>
  getPage(pageNumber: number): Promise<PdfPage>
}

type TextItem = {
  str?: string
  transform?: number[]
}

type PdfPage = {
  getTextContent(): Promise<{
    items: TextItem[]
  }>
}

type PdfModule = {
  GlobalWorkerOptions: {
    workerSrc: string
  }
  getDocument(options: { data: Uint8Array; disableWorker?: boolean }): {
    promise: Promise<PdfDocument>
  }
}

let workerConfigured = false

export async function parsePdfDocument(file: File): Promise<ParsedDocument> {
  const pdfjs = (await import('pdfjs-dist')) as PdfModule

  if (!workerConfigured) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
    workerConfigured = true
  }

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
  const flattened = await extractOutlineChapters(pdf)

  if (!flattened.length) {
    const tableOfContentsChapters = await extractTableOfContentsChapters(pdf)

    if (tableOfContentsChapters.length) {
      return {
        file,
        pageCount: pdf.numPages,
        chapters: tableOfContentsChapters,
      }
    }

    return buildFallbackDocument(file, pdf.numPages)
  }

  const chapters = await Promise.all(
    flattened.map(async (node, index) => ({
      id: `${index + 1}-${slugify(node.title ?? 'section')}`,
      number: index + 1,
      title: node.title?.trim() || `Section ${index + 1}`,
      page: await resolveDestinationPage(pdf, node.dest, index + 1),
    }))
  )

  return {
    file,
    pageCount: pdf.numPages,
    chapters,
  }
}

async function extractOutlineChapters(pdf: PdfDocument) {
  try {
    const outline = (await pdf.getOutline()) ?? []

    return flattenOutline(outline)
  } catch {
    return []
  }
}

function flattenOutline(nodes: OutlineNode[], chapters: OutlineNode[] = []): OutlineNode[] {
  for (const node of nodes) {
    if (node.title?.trim()) chapters.push(node)
    if (node.items?.length) flattenOutline(node.items, chapters)
  }

  return chapters
}

async function resolveDestinationPage(pdf: PdfDocument, destination: unknown, fallbackPage: number) {
  try {
    const resolvedDestination = typeof destination === 'string'
      ? await pdf.getDestination(destination)
      : destination

    if (!Array.isArray(resolvedDestination) || !resolvedDestination[0]) {
      return fallbackPage
    }

    const pageReference = resolvedDestination[0]

    if (typeof pageReference === 'object' && pageReference && 'num' in pageReference && 'gen' in pageReference) {
      return (await pdf.getPageIndex(pageReference as { num: number; gen: number })) + 1
    }
  } catch {
    return fallbackPage
  }

  return fallbackPage
}

async function extractTableOfContentsChapters(pdf: PdfDocument): Promise<ParsedChapter[]> {
  const chapters: ParsedChapter[] = []
  let inContentsSection = false

  for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, 20); pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()
    const lines = groupTextItemsIntoLines(textContent.items)
    const normalizedLines = lines.map((line) => normalizeWhitespace(line.text))

    if (!inContentsSection && normalizedLines.some((line) => /^contents$/i.test(line))) {
      inContentsSection = true
      continue
    }

    if (!inContentsSection) continue

    let pageProducedChapter = false

    for (const line of normalizedLines) {
      const chapter = parseContentsLine(line)

      if (!chapter) continue

      pageProducedChapter = true
      chapters.push({
        id: `${chapter.number}-${slugify(chapter.title)}`,
        number: chapter.number,
        title: chapter.title,
        page: chapter.page,
      })
    }

    if (chapters.length && !pageProducedChapter) {
      break
    }
  }

  return dedupeChapters(chapters)
}

function groupTextItemsIntoLines(items: TextItem[]) {
  const sortedItems = [...items]
    .map((item) => ({
      text: item.str ?? '',
      x: item.transform?.[4] ?? 0,
      y: item.transform?.[5] ?? 0,
    }))
    .filter((item) => item.text.trim())
    .sort((left, right) => {
      if (Math.abs(right.y - left.y) > 2) return right.y - left.y
      return left.x - right.x
    })

  const lines: Array<{ y: number; text: string }> = []

  for (const item of sortedItems) {
    const existingLine = lines.find((line) => Math.abs(line.y - item.y) <= 2)

    if (existingLine) {
      existingLine.text = `${existingLine.text} ${item.text}`
      continue
    }

    lines.push({ y: item.y, text: item.text })
  }

  return lines
}

function parseContentsLine(line: string) {
  const match = line.match(/^(\d{1,3})\s+(.+?)\s+(\d{1,4})$/)

  if (!match) return null

  const number = Number(match[1])
  const title = match[2]?.trim()
  const page = Number(match[3])

  if (!Number.isFinite(number) || !title || !Number.isFinite(page)) return null

  return { number, title, page }
}

function dedupeChapters(chapters: ParsedChapter[]) {
  const seen = new Set<string>()

  return chapters.filter((chapter) => {
    const key = `${chapter.number}:${chapter.title}:${chapter.page}`

    if (seen.has(key)) return false

    seen.add(key)
    return true
  })
}

function buildFallbackDocument(file: File, pageCount: number): ParsedDocument {
  return {
    file,
    pageCount,
    chapters: [
      {
        id: 'full-document',
        number: 1,
        title: 'Full document',
        page: 1,
      },
    ],
  }
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'section'
}
