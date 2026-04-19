export const CLOUDINARY_CLOUD_NAME = process.env['NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'] || ''
export const CLOUDINARY_UPLOAD_PRESET = process.env['NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET'] || ''

export async function uploadToCloudinary(file: File): Promise<{ secure_url: string; thumbnail_url: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('resource_type', 'video')

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error('Failed to upload video to Cloudinary')
  }

  const data = await response.json()

  // Generate thumbnail URL from video
  const thumbnailUrl = data.secure_url.replace(/\.[^/.]+$/, '.jpg')

  return {
    secure_url: data.secure_url,
    thumbnail_url: thumbnailUrl,
  }
}
