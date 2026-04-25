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
}

type PdfModule = {
  getDocument(options: { data: Uint8Array; disableWorker: boolean }): {
    promise: Promise<PdfDocument>
  }
}

export async function parsePdfDocument(file: File): Promise<ParsedDocument> {
  const pdfjs = (await import('pdfjs-dist')) as PdfModule
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer), disableWorker: true }).promise
  const outline = (await pdf.getOutline()) ?? []
  const flattened = flattenOutline(outline)

  if (!flattened.length) {
    return {
      file,
      pageCount: pdf.numPages,
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

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'section'
}
