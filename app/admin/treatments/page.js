"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ArrowLeft, Search, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import ImageUpload from "@/components/image-upload"
import Link from "next/link"
import AdminNavigation from "@/components/admin-navigation"

const AdminTreatmentsPage = () => {
  const [treatments, setTreatments] = useState([])
  const [products, setProducts] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    category: "",
    image_url: "",
    is_active: true,
  })
  const [loading, setLoading] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState([])
  const router = useRouter()
  const { toast } = useToast()

  const treatmentCategories = [
    {
      id: "aesthetic-dermatology",
      name: "Aesthetic Dermatology",
      description: "Advanced skin treatments and procedures",
      icon: "✨",
    },
    {
      id: "laser-treatments",
      name: "Laser Treatments",
      description: "Laser-based therapeutic procedures",
      icon: "🔬",
    },
    {
      id: "body-contouring",
      name: "Body Contouring",
      description: "Body shaping and fat reduction",
      icon: "💪",
    },
    {
      id: "hair-restoration",
      name: "Hair Restoration",
      description: "Hair transplant and restoration services",
      icon: "💇",
    },
    {
      id: "injectable-treatments",
      name: "Injectable Treatments",
      description: "Botox, fillers, and therapeutic injections",
      icon: "💉",
    },
    {
      id: "wellness-therapy",
      name: "Wellness & Therapy",
      description: "IV therapy and wellness treatments",
      icon: "🌿",
    },
    {
      id: "specialized-procedures",
      name: "Specialized Procedures",
      description: "Unique and specialized treatments",
      icon: "🎯",
    },
    {
      id: "spa-services",
      name: "Spa Services",
      description: "Relaxation and beauty treatments",
      icon: "🧘",
    },
    {
      id: "teeth-whitening",
      name: "Teeth Whitening",
      description: "Professional teeth whitening and dental aesthetics",
      icon: "🦷",
    },
  ]

  const getCategoryInfo = (categoryId) => {
    return treatmentCategories.find((cat) => cat.id === categoryId) || { name: categoryId, icon: "🏥" }
  }

  // Filter treatments based on search term
  const filteredTreatments = useMemo(() => {
    if (!searchTerm.trim()) {
      return treatments
    }

    const searchLower = searchTerm.toLowerCase()
    return treatments.filter((treatment) => {
      const categoryInfo = getCategoryInfo(treatment.category)
      return (
        treatment.name.toLowerCase().includes(searchLower) ||
        treatment.description.toLowerCase().includes(searchLower) ||
        categoryInfo.name.toLowerCase().includes(searchLower) ||
        treatment.category.toLowerCase().includes(searchLower)
      )
    })
  }, [treatments, searchTerm])

  useEffect(() => {
    checkAuth()
    fetchTreatments()
    fetchProducts()
  }, [])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/admin")
      return
    }
  }

  const fetchTreatments = async () => {
    const { data, error } = await supabase.from("treatments").select("*").order("created_at", { ascending: false })

    if (!error && data) {
      setTreatments(data)
    }
  }

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*").eq("is_active", true).order("name")

    if (!error && data) {
      setProducts(data)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageChange = (url, path) => {
    setFormData((prev) => ({
      ...prev,
      image_url: url,
    }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      duration: "",
      category: "",
      image_url: "",
      is_active: true,
    })
    setSelectedProducts([])
    setEditingTreatment(null)
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const treatmentData = {
        name: formData.name,
        description: formData.description,
        duration: Number.parseInt(formData.duration),
        category: formData.category,
        image_url: formData.image_url,
        is_active: formData.is_active,
      }

      let treatmentId

      if (editingTreatment) {
        const { error } = await supabase.from("treatments").update(treatmentData).eq("id", editingTreatment.id)

        if (error) throw error
        treatmentId = editingTreatment.id

        toast({
          title: "Treatment Updated",
          description: "Treatment has been successfully updated.",
        })
      } else {
        const { data, error } = await supabase.from("treatments").insert([treatmentData]).select()

        if (error) throw error
        treatmentId = data[0].id

        toast({
          title: "Treatment Added",
          description: "New treatment has been successfully added.",
        })
      }

      // Handle treatment-product relationships
      if (selectedProducts.length > 0) {
        // First, delete existing relationships if editing
        if (editingTreatment) {
          await supabase.from("treatment_products").delete().eq("treatment_id", treatmentId)
        }

        // Insert new relationships
        const relationships = selectedProducts.map((productId) => ({
          treatment_id: treatmentId,
          product_id: productId,
        }))

        const { error: relationError } = await supabase.from("treatment_products").insert(relationships)

        if (relationError) {
          console.error("Error creating treatment-product relationships:", relationError)
        }
      }

      setIsDialogOpen(false)
      resetForm()
      fetchTreatments()
    } catch (error) {
      console.error("Treatment save error:", error)
      toast({
        title: "Error",
        description: "Failed to save treatment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (treatment) => {
    setEditingTreatment(treatment)
    setFormData({
      name: treatment.name,
      description: treatment.description,
      duration: treatment.duration.toString(),
      category: treatment.category,
      image_url: treatment.image_url || "",
      is_active: treatment.is_active,
    })

    // Fetch related products
    const { data: relatedProducts } = await supabase
      .from("treatment_products")
      .select("product_id")
      .eq("treatment_id", treatment.id)

    if (relatedProducts) {
      setSelectedProducts(relatedProducts.map((rp) => rp.product_id))
    }

    setIsDialogOpen(true)
  }

  const handleDelete = async (treatmentId) => {
    if (!confirm("Are you sure you want to delete this treatment?")) return

    try {
      // First delete related product relationships
      await supabase.from("treatment_products").delete().eq("treatment_id", treatmentId)

      // Then delete the treatment
      const { error } = await supabase.from("treatments").delete().eq("id", treatmentId)

      if (error) throw error

      toast({
        title: "Treatment Deleted",
        description: "Treatment has been successfully deleted.",
      })

      fetchTreatments()
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Error",
        description: "Failed to delete treatment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleProductSelection = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  if (loading && treatments.length === 0) {
    return (
      <>
        <AdminNavigation />
        <div className="pt-16 min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading treatments...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <AdminNavigation />
      <div className="pt-14 min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between md:gap-8 gap-2 items-center mb-8">
            <div className="flex flex-col items-start gap-11">
              <Link href="/admin/dashboard" className="bg-card text-primary">
                <Button variant="outline" size="sm" className="bg-card rounded-sm border-border">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="items-start">
                <h1 className="text-3xl font-bold text-foreground">Manage Treatments</h1>
                <p className="text-muted-foreground">Add, edit, and manage your treatment services</p>
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-primary border hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4 mr-4 md:mr-2" />
                  Add Treatment
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card max-w-4xl max-h-[90vh] overflow-y-auto border-border">
                <DialogHeader>
                  <DialogTitle className="text-card-foreground">
                    {editingTreatment ? "Edit Treatment" : "Add New Treatment"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Image Upload Component */}
                  <ImageUpload
                    currentImage={formData.image_url}
                    onImageChange={handleImageChange}
                    bucket="treatment-images"
                    folder="treatments/"
                    label="Treatment Image"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-card-foreground">
                        Treatment Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter treatment name"
                        required
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration" className="text-card-foreground">
                        Duration (minutes) *
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => handleInputChange("duration", e.target.value)}
                        placeholder="60"
                        required
                        className="bg-background border-border"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-card-foreground">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe the treatment..."
                      rows={3}
                      required
                      className="bg-background border-border"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-card-foreground">
                      Category *
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {treatmentCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id} className="text-card-foreground">
                            <div className="flex items-center space-x-2">
                              <span>{category.icon}</span>
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Recommended Products Selection */}
                  <div>
                    <Label className="text-card-foreground">Recommended Products</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select products to recommend with this treatment
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3 bg-background border-border">
                      {products.map((product) => (
                        <div key={product.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`product-${product.id}`}
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleProductSelection(product.id)}
                            className="rounded"
                          />
                          <Label htmlFor={`product-${product.id}`} className="text-sm cursor-pointer text-foreground">
                            {product.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange("is_active", e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="is_active" className="text-card-foreground">
                      Treatment is active
                    </Label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="border-border"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-background border hover:bg-primary/90 text-primary-foreground"
                    >
                      {loading ? "Saving..." : editingTreatment ? "Update Treatment" : "Add Treatment"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search treatments by name, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 bg-background border-border"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {searchTerm && (
              <p className="text-sm text-muted-foreground mt-2">
                Found {filteredTreatments.length} treatment{filteredTreatments.length !== 1 ? "s" : ""} matching "
                {searchTerm}"
              </p>
            )}
          </div>

          {/* Treatments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTreatments.map((treatment) => {
              const categoryInfo = getCategoryInfo(treatment.category)
              return (
                <Card key={treatment.id} className="overflow-hidden bg-card border-border">
                  <div className="relative h-48">
                    <Image
                      src={treatment.image_url || "/placeholder.svg?height=200&width=300&query=treatment"}
                      alt={treatment.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={treatment.is_active ? "default" : "secondary"}>
                        {treatment.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <Badge variant="outline" className="text-xs border-border">
                        <span className="mr-1">{categoryInfo.icon}</span>
                        {categoryInfo.name}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-2 line-clamp-2">{treatment.name}</h3>
                    <p className="text-card-foreground/70 text-sm mb-3 line-clamp-2">{treatment.description}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-muted-foreground">Duration: {treatment.duration} min</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(treatment)}
                        className="flex-1 border-border"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(treatment.id)}
                        className="text-destructive hover:text-destructive border-border"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* No Results Messages */}
          {filteredTreatments.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-2">No treatments found matching "{searchTerm}"</p>
              <p className="text-muted-foreground text-sm">Try adjusting your search terms or browse all treatments.</p>
              <Button variant="outline" onClick={clearSearch} className="mt-4 border-border bg-transparent">
                Clear Search
              </Button>
            </div>
          )}

          {treatments.length === 0 && !searchTerm && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No treatments found. Add your first treatment to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default AdminTreatmentsPage
