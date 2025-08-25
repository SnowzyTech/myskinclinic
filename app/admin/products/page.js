"use client"

import { useState, useEffect } from "react"
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
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import ImageUpload from "@/components/image-upload"
import Link from "next/link"
import AdminNavigation from "@/components/admin-navigation"

const AdminProductsPage = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ingredients: "",
    price: "",
    category_id: "",
    brand_id: "",
    stock_quantity: "",
    image_url: "",
    image_path: "",
    is_active: true,
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
    fetchProducts()
    fetchCategories()
    fetchBrands()
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

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name
        ),
        brands (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setProducts(data)
    }
  }

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*").order("name")

    if (!error && data) {
      setCategories(data)
    }
  }

  const fetchBrands = async () => {
    const { data, error } = await supabase.from("brands").select("*").order("name")

    if (!error && data) {
      setBrands(data)
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
      image_path: path,
    }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      ingredients: "",
      price: "",
      category_id: "",
      brand_id: "",
      stock_quantity: "",
      image_url: "",
      image_path: "",
      is_active: true,
    })
    setEditingProduct(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        ingredients: formData.ingredients,
        price: Number.parseFloat(formData.price),
        category_id: formData.category_id,
        brand_id: formData.brand_id || null,
        stock_quantity: Number.parseInt(formData.stock_quantity),
        image_url: formData.image_url,
        is_active: formData.is_active,
      }

      if (editingProduct) {
        const { error } = await supabase.from("products").update(productData).eq("id", editingProduct.id)

        if (error) throw error

        toast({
          title: "Product Updated",
          description: "Product has been successfully updated.",
        })
      } else {
        const { error } = await supabase.from("products").insert([productData])

        if (error) throw error

        toast({
          title: "Product Added",
          description: "New product has been successfully added.",
        })
      }

      setIsDialogOpen(false)
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error("Product save error:", error)
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      ingredients: product.ingredients || "",
      price: product.price.toString(),
      category_id: product.category_id,
      brand_id: product.brand_id || "",
      stock_quantity: product.stock_quantity.toString(),
      image_url: product.image_url || "",
      image_path: "",
      is_active: product.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const { error } = await supabase.from("products").delete().eq("id", productId)

      if (error) throw error

      toast({
        title: "Product Deleted",
        description: "Product has been successfully deleted.",
      })

      fetchProducts()
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <>
        <AdminNavigation />
        <div className="pt-16 min-h-screen flex items-center justify-center bg-card">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <AdminNavigation />
      <div className="pt-12 min-h-screen bg-background ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between md:gap-8 gap-1 items-center mb-8">
            <div className="flex flex-col items-start gap-9">
              <Link href="/admin/dashboard" className="bg-card text-primary">
                <Button variant="outline" size="sm" className="bg-card rounded-sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="items-end pt-1">
                <h1 className="text-3xl font-bold text-primary">Manage Products</h1>
                <p className="text-gray-600">Add, edit, and manage your product catalog</p>
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-card border hover:bg-background text-primary">
                  <Plus className="w-4 h-4 mr-4 md:mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Image Upload Component */}
                  <ImageUpload
                    currentImage={formData.image_url}
                    onImageChange={handleImageChange}
                    bucket="product-images"
                    folder="products/"
                    label="Product Image"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter product name"
                        required
                        className="bg-card"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price (₦) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        placeholder="0.00"
                        required
                        className="bg-card"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe the product..."
                      rows={3}
                      required
                      className="bg-card"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ingredients">Ingredients</Label>
                    <Textarea
                      id="ingredients"
                      value={formData.ingredients}
                      onChange={(e) => handleInputChange("ingredients", e.target.value)}
                      placeholder="List the key ingredients..."
                      rows={2}
                      className="bg-card"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) => handleInputChange("category_id", value)}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="brand">Brand</Label>
                      <Select value={formData.brand_id} onValueChange={(value) => handleInputChange("brand_id", value)}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem className="bg-background" value="none">No Brand</SelectItem>
                          {brands.map((brand) => (
                            <SelectItem className="bg-background" key={brand.id} value={brand.id.toString()}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock Quantity *</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock_quantity}
                        onChange={(e) => handleInputChange("stock_quantity", e.target.value)}
                        placeholder="0"
                        required
                        className="bg-background"
                      />
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
                    <Label htmlFor="is_active">Product is active</Label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-card border hover:bg-gray-800 text-gray-50">
                      {loading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={product.image_url || "/placeholder.svg?height=200&width=300&query=skincare product"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="mb-2 flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {product.categories?.name}
                    </Badge>
                    {product.brands && (
                      <Badge variant="secondary" className="text-xs">
                        {product.brands.name}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-primary/90 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-primary">₦{product.price}</span>
                    <span className="text-sm text-gray-500">Stock: {product.stock_quantity}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(product)} className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="text-gray-200 hover:text-gray-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found. Add your first product to get started.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default AdminProductsPage
