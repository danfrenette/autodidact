import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClientOnlyFn } from '@tanstack/react-start'
import { buildCreateSourceInput } from '#/features/sources/source.mappers'
import type { CreateSourceResponse, Tag } from '#/features/sources/source.types'
import { trpcClient } from '#/providers/tanstack-query'
import { useTRPC } from '#/providers/trpc'
import type { ParsedDocument } from '../-types'

const uploadSourceFile = createClientOnlyFn(async (file: File) => {
  const directUpload = await import(
    '#/features/sources/api/direct-upload.client'
  )

  return directUpload.uploadSourceFile(file)
})

type UseProcessSourceOptions = {
  chapterTags: Record<string, Tag[]>
  document: ParsedDocument | null
  onProvidersRequired: () => void
  onSuccess: (data: CreateSourceResponse) => void
  selectedChapterIds: string[]
  tags: Tag[]
}

export function useProcessSource({
  chapterTags,
  document,
  onProvidersRequired,
  onSuccess,
  selectedChapterIds,
  tags,
}: UseProcessSourceOptions) {
  const queryClient = useQueryClient()
  const trpc = useTRPC()

  return useMutation({
    mutationFn: async () => {
      if (!document) {
        throw new Error('Select a PDF before processing')
      }

      const signedBlobId = await uploadSourceFile(document.file)

      return trpcClient.sources.create.mutate(
        buildCreateSourceInput(
          document,
          signedBlobId,
          selectedChapterIds,
          tags,
          chapterTags,
        ),
      )
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries(trpc.sources.list.queryFilter())
      await queryClient.invalidateQueries(
        trpc.sources.get.queryFilter({ id: data.data.source.id }),
      )
      onSuccess(data)
    },
    onError: (error) => {
      if (error.message.includes('providers before adding sources')) {
        onProvidersRequired()
      }
    },
  })
}
