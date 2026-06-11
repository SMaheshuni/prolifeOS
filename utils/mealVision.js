// Sends a meal photo to the `analyze-meal` Supabase Edge Function and
// returns { name, calories }. The OpenAI key lives server-side only —
// the browser never sees it. The image is compressed to ~1024px JPEG
// before upload (OpenAI vision's `low` detail mode resizes to 512px
// anyway, so larger uploads waste bandwidth and risk hitting the
// edge-function request size limit on phone photos).

import { supabase } from '@/lib/supabase.client'

const MAX_IMAGE_DIM = 1024
const JPEG_QUALITY = 0.8

const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      const ratio = Math.min(
        MAX_IMAGE_DIM / img.width,
        MAX_IMAGE_DIM / img.height,
        1
      )
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl)
      reject(err)
    }
    img.src = objectUrl
  })

export const analyzeMealPhoto = async (file) => {
  if (!supabase) throw new Error('Supabase not configured')

  const dataUrl = await compressImage(file)

  const { data, error } = await supabase.functions.invoke('analyze-meal', {
    body: { image: dataUrl },
  })

  if (error) throw error

  const name = typeof data?.name === 'string' ? data.name.trim() : ''
  const calories = Number(data?.calories)
  if (!name || !Number.isFinite(calories)) {
    throw new Error('Could not parse meal from response')
  }
  return { name, calories: Math.round(calories) }
}
