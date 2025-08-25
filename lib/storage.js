import { supabase } from "./supabase"

export const uploadImage = async (file, bucket, folder = "") => {
  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${folder}${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) throw error

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName)

    return {
      success: true,
      url: publicUrl,
      path: fileName,
    }
  } catch (error) {
    console.error("Upload error:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export const deleteImage = async (bucket, path) => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Delete error:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export const getImageUrl = (bucket, path) => {
  if (!path) return null

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path)

  return publicUrl
}
