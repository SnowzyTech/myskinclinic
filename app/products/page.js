"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Search, Filter } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import ScrollAnimation from "@/components/scroll-animation"

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedBrand, setSelectedBrand] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [loading, setLoading] = useState(true)
  const [openCategories, setOpenCategories] = useState({})
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const { addItem } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchBrands()
  }, [])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, searchTerm, selectedCategory, selectedBrand, sortBy])

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name,
          parent_id
        ),
        brands (
          id,
          name
        )
      `)
      .eq("is_active", true)

    if (!error && data) {
      setProducts(data)
    }
    setLoading(false)
  }

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("parent_id", { nullsFirst: true })
      .order("name")

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

  const filterAndSortProducts = () => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => {
        // Check if product category matches selected category or its parent
        const productCategory = product.categories
        if (!productCategory) return false

        return productCategory.id === selectedCategory || productCategory.parent_id === selectedCategory
      })
    }

    if (selectedBrand !== "all") {
      filtered = filtered.filter((product) => product.brand_id === selectedBrand)
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "name":
        default:
          return a.name.localeCompare(b.name)
      }
    })

    setFilteredProducts(filtered)
  }

  const handleAddToCart = (product) => {
    addItem(product)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
      color: "bg-card"
    })
  }

  const toggleCategory = (categoryId) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  const getMainCategories = () => {
    return categories.filter((cat) => !cat.parent_id)
  }

  const getSubCategories = (parentId) => {
    return categories.filter((cat) => cat.parent_id === parentId)
  }

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-card">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-background">
      {/* Header */}
      <section className="bg-card py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimation>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Premium Skincare Products</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover our carefully curated collection of professional-grade skincare products
            </p>
          </ScrollAnimation>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Filters Section */}
        <div className="mb-8">
          <ScrollAnimation>
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full bg-card border-border"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showMobileFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>

            {/* Filters Container */}
            <div className={`bg-card p-6 rounded-lg border border-border ${showMobileFilters || "hidden lg:block"}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-card border-border"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Categories</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="all">All Categories</SelectItem>
                      {getMainCategories().map((mainCat) => [
                        <SelectItem key={mainCat.id} value={mainCat.id}>
                          {mainCat.name}
                        </SelectItem>,
                        ...getSubCategories(mainCat.id).map((subCat) => (
                          <SelectItem key={subCat.id} value={subCat.id}>
                            &nbsp;&nbsp;• {subCat.name}
                          </SelectItem>
                        )),
                      ])}
                    </SelectContent>
                  </Select>
                </div>

                {/* Brands */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Brands</label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue placeholder="All Brands" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="all">All Brands</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="price-low">Price (Low to High)</SelectItem>
                      <SelectItem value="price-high">Price (High to Low)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>

        {/* Products Grid */}
        <div>
          {filteredProducts.length === 0 ? (
            <ScrollAnimation>
              <div className="text-center py-12">
                <p className="text-primary text-lg">No products found matching your criteria.</p>
              </div>
            </ScrollAnimation>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">
                  Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                  <ScrollAnimation key={product.id} delay={index * 50}>
                    <Card className="overflow-hidden h-full hover:shadow-lg transition-all duration-300 bg-card border-border">
                      <div className="relative h-48">
                        <Image
                          src={product.image_url || "/placeholder.svg?height=200&width=300&query=skincare product"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="mb-2 flex justify-between items-start">
                          <span className="text-xs text-primary font-medium">{product.categories?.name}</span>
                          {product.brands && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                              {product.brands.name}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">{product.name}</h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-primary">₦{product.price?.toLocaleString()}</span>
                          <div className="flex gap-2">
                            <Link href={`/products/${product.id}`}>
                              <Button variant="outline" size="sm" className="text-primary bg-card">
                                View
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              onClick={() => handleAddToCart(product)}
                              className="bg-background border hover:bg-primary/90 text-primary-foreground"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollAnimation>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductsPage
