"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ImageUpload from "@/components/image-upload"
import AdminNavigation from "@/components/admin-navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

const AdminBlogPage = () => {
  const [posts, setPosts] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    image_url: "",
    image_path: "",
    slug: "",
    is_published: false,
  })
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log("[v0] Blog: Checking authentication...")
      const response = await fetch("/api/verify-admin")

      if (!response.ok) {
        console.log("[v0] Blog: Not authenticated, redirecting to login...")
        router.push("/admin")
        return
      }

      const { authenticated } = await response.json()
      if (!authenticated) {
        console.log("[v0] Blog: Not authenticated, redirecting to login...")
        router.push("/admin")
        return
      }

      console.log("[v0] Blog: Authenticated, loading data...")
      setAuthChecked(true)
      await fetchPosts()
    } catch (error) {
      console.error("[v0] Blog: Auth check failed:", error)
      router.push("/admin")
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async () => {
    const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false })

    if (!error && data) {
      setPosts(data)
    }
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-")
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      }

      if (field === "title") {
        updated.slug = generateSlug(value)
      }

      return updated
    })
  }

  const handleImageChange = (url, path) => {
    setFormData((prev) => ({
      ...prev,
      image_url: url,
      image_path: path,
    }))
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      image_url: "",
      image_path: "",
      slug: "",
      is_published: false,
    })
    setEditingPost(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.title || !formData.content || !formData.excerpt) {
        throw new Error("Please fill in all required fields")
      }

      const postData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        image_url: formData.image_url,
        slug: formData.slug || generateSlug(formData.title),
        is_published: formData.is_published,
      }

      if (editingPost) {
        const { error } = await supabase.from("blog_posts").update(postData).eq("id", editingPost.id)

        if (error) throw error

        toast({
          title: "Post Updated",
          description: "Blog post has been successfully updated.",
        })
      } else {
        const { error } = await supabase.from("blog_posts").insert([postData])

        if (error) throw error

        toast({
          title: "Post Created",
          description: "New blog post has been successfully created.",
        })
      }

      setIsDialogOpen(false)
      resetForm()
      fetchPosts()
    } catch (error) {
      console.error("Post save error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (post) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      image_url: post.image_url || "",
      image_path: "",
      slug: post.slug,
      is_published: post.is_published,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (postId) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return

    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", postId)

      if (error) throw error

      toast({
        title: "Post Deleted",
        description: "Blog post has been successfully deleted.",
      })

      fetchPosts()
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const togglePublished = async (post) => {
    try {
      const { error } = await supabase.from("blog_posts").update({ is_published: !post.is_published }).eq("id", post.id)

      if (error) throw error

      toast({
        title: post.is_published ? "Post Unpublished" : "Post Published",
        description: `Blog post has been ${post.is_published ? "unpublished" : "published"}.`,
      })

      fetchPosts()
    } catch (error) {
      console.error("Toggle publish error:", error)
      toast({
        title: "Error",
        description: "Failed to update post status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (!authChecked || loading) {
    return (
      <>
        <AdminNavigation />
        <div className="pt-16 min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              {!authChecked ? "Verifying access..." : "Loading blog posts..."}
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <AdminNavigation />
      <div className="md:pt-16 pt-16 min-h-screen bg-background overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div className="flex flex-col gap-4">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm" className="bg-card text-primary w-fit">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground md:mt-3 mt-5">Manage Blog Posts</h1>
                <p className="text-muted-foreground">Create, edit, and manage your blog content</p>
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={resetForm}
                  className="bg-primary border hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl bg-card max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPost ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <ImageUpload
                    currentImage={formData.image_url}
                    onImageChange={handleImageChange}
                    bucket="blog-images"
                    folder="posts/"
                    label="Featured Image"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Post Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="Enter post title"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">URL Slug *</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleInputChange("slug", e.target.value)}
                        placeholder="url-friendly-slug"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt *</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange("excerpt", e.target.value)}
                      placeholder="Brief description of the post..."
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => handleInputChange("content", e.target.value)}
                      placeholder="Write your blog post content here..."
                      rows={12}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_published"
                      checked={formData.is_published}
                      onChange={(e) => handleInputChange("is_published", e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="is_published">Publish immediately</Label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-primary border hover:bg-primary/90 text-primary-foreground"
                    >
                      {loading ? "Saving..." : editingPost ? "Update Post" : "Create Post"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden bg-card border-border">
                <div className="relative h-48">
                  <Image
                    src={post.image_url || "/placeholder.svg?height=200&width=300&query=blog post"}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Badge variant={post.is_published ? "default" : "secondary"}>
                      {post.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-3">{post.excerpt}</p>
                  <div className="flex justify-between items-center mb-3 text-xs text-muted-foreground">
                    <span>Created: {formatDate(post.created_at)}</span>
                    <span>Updated: {formatDate(post.updated_at)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(post)} className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => togglePublished(post)} className="flex-1">
                      {post.is_published ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-1" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          Publish
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(post.id)} className="">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {post.is_published && (
                    <div className="mt-2">
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <Button variant="outline" size="sm" className="w-full bg-transparent text-primary text-xs">
                          View Live Post →
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No blog posts found. Create your first post to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default AdminBlogPage
