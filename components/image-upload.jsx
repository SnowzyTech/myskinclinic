"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader, Eye, LinkIcon } from "lucide-react"
import { uploadImage, deleteImage } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

const ImageUpload = ({
  currentImage,
  onImageChange,
  bucket = "product-images",
  folder = "",
  label = "Product Image",
  accept = "image/*",
}) => {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentImage)
  const [imageUrl, setImageUrl] = useState(currentImage || "")
  const [activeTab, setActiveTab] = useState("upload")
  const fileInputRef = useRef(null)
  const { toast } = useToast()

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      // Upload to Supabase Storage
      const result = await uploadImage(file, bucket, folder)

      if (result.success) {
        onImageChange(result.url, result.path)
        setImageUrl(result.url)
        toast({
          title: "Image Uploaded",
          description: "Image has been successfully uploaded.",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      })
      setPreview(currentImage)
    } finally {
      setUploading(false)
    }
  }

  const handleUrlChange = (url) => {
    setImageUrl(url)
  }

  const handleUrlPreview = () => {
    if (!imageUrl) {
      toast({
        title: "No URL Provided",
        description: "Please enter an image URL first.",
        variant: "destructive",
      })
      return
    }

    // Basic URL validation
    try {
      new URL(imageUrl.startsWith("http") ? imageUrl : `https://${imageUrl}`)
    } catch {
      // If not a valid URL, assume it's a relative path
      if (!imageUrl.startsWith("/")) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid image URL or path.",
          variant: "destructive",
        })
        return
      }
    }

    setPreview(imageUrl)
    onImageChange(imageUrl, null)
    toast({
      title: "Image URL Set",
      description: "Image URL has been set successfully.",
    })
  }

  const handleRemoveImage = async () => {
    if (currentImage && currentImage.includes("supabase")) {
      // Extract path from Supabase URL for deletion
      try {
        const urlParts = currentImage.split("/")
        const path = urlParts[urlParts.length - 1]
        await deleteImage(bucket, path)
      } catch (error) {
        console.error("Delete error:", error)
      }
    }

    setPreview(null)
    setImageUrl("")
    onImageChange(null, null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <Label>{label}</Label>

      {/* Image Preview */}
      {preview && (
        <div className="relative w-full h-48 border border-gray-300 rounded-lg overflow-hidden">
          <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
            disabled={uploading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="w-full">
        <div className="flex border-b border-gray-200 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "upload"
                ? "border-rose-500 text-rose-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "url"
                ? "border-rose-500 text-rose-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <LinkIcon className="w-4 h-4 inline mr-2" />
            Image URL
          </button>
        </div>

        {/* File Upload Content */}
        {activeTab === "upload" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />

              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2"
              >
                {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Uploading..." : preview ? "Change Image" : "Upload Image"}
              </Button>

              {preview && (
                <Button type="button" variant="outline" onClick={handleRemoveImage} disabled={uploading}>
                  Remove
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-500">Supported formats: JPG, PNG, GIF. Max size: 5MB.</p>
          </div>
        )}

        {/* URL Input Content */}
        {activeTab === "url" && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg or /placeholder.svg?height=300&width=300"
                  value={imageUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUrlPreview}
                  disabled={!imageUrl}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
              </div>

              {preview && (
                <Button type="button" variant="outline" onClick={handleRemoveImage} className="w-full bg-transparent">
                  Remove Image
                </Button>
              )}
            </div>

            <div className="text-sm text-gray-500 space-y-1">
              <p>
                <strong>Examples:</strong>
              </p>
              <p>• External: https://images.unsplash.com/photo-123456</p>
              <p>• Placeholder: /placeholder.svg?height=300&width=300&query=skincare serum</p>
              <p>• Relative: /images/product.jpg</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageUpload
