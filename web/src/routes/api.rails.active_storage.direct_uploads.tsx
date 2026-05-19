import { createFileRoute } from '@tanstack/react-router'
import { requestRails } from '#/lib/rails-api'

async function createDirectUpload({ request }: { request: Request }) {
  const payload = await requestRails(
    '/rails/active_storage/direct_uploads',
    {
      method: 'POST',
      data: await request.json(),
    },
    { request, csrf: true },
  )

  return Response.json(payload)
}

export const Route = createFileRoute(
  '/api/rails/active_storage/direct_uploads',
)({
  server: {
    handlers: {
      POST: createDirectUpload,
    },
  },
})
