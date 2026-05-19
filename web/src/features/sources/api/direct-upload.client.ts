import { DirectUpload } from '@rails/activestorage'

export async function uploadSourceFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const upload = new DirectUpload(
      file,
      '/api/rails/active_storage/direct_uploads',
    )

    upload.create((error, blob) => {
      if (error) {
        reject(new Error(error))
        return
      }

      resolve(blob.signed_id)
    })
  })
}
