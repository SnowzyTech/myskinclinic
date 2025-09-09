"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, ShoppingCart, Filter, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import ScrollAnimation from "@/components/scroll-animation"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

const TreatmentsPage = () => {
  const [treatments, setTreatments] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedTreatment, setSelectedTreatment] = useState(null)
  const [recommendedProducts, setRecommendedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const { addItem } = useCart()
  const { toast } = useToast()
  const treatmentsGridRef = useRef(null)

  const treatmentCategories = [
    {
      id: "all",
      name: "All Treatments",
      description: "View all available treatments",
      icon: "🏥",
    },
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
      id: "teeth-whitening",
      name: "Teeth Whitening",
      description: "Professional teeth whitening and dental aesthetics",
      icon: "🦷",
    },
  ]

  useEffect(() => {
    fetchTreatments()
    const urlParams = new URLSearchParams(window.location.search)
    const categoryParam = urlParams.get("category")
    if (categoryParam && categoryParam !== "all") {
      setSelectedCategory(categoryParam)
      setTimeout(() => {
        const element = document.getElementById(`category-${categoryParam}`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 500)
    }
  }, [])

  const fetchTreatments = async () => {
    try {
      const { data, error } = await supabase.from("treatments").select("*").eq("is_active", true).order("name")

      if (error) {
        console.error("Error fetching treatments:", error)
        setTreatments([])
      } else {
        setTreatments(data || [])
      }
    } catch (error) {
      console.error("Error fetching treatments:", error)
      setTreatments([])
    } finally {
      setLoading(false)
    }
  }

  const fetchRecommendedProducts = async (treatmentId) => {
    try {
      const { data: treatmentProducts, error: treatmentError } = await supabase
        .from("treatment_products")
        .select(`
          products (
            id,
            name,
            description,
            price,
            image_url,
            is_active
          )
        `)
        .eq("treatment_id", treatmentId)

      if (!treatmentError && treatmentProducts && treatmentProducts.length > 0) {
        const validProducts = treatmentProducts
          .map((tp) => tp.products)
          .filter((product) => product && product.is_active)

        if (validProducts.length > 0) {
          setRecommendedProducts(validProducts)
          return
        }
      }

      const treatment = treatments.find((t) => t.id === treatmentId)
      if (treatment && treatment.category) {
        const categoryMapping = {
          "skin-treatment": ["Skincare", "Face Care", "Anti-Aging"],
          "laser-hair-removal": ["Hair Care", "Body Care", "After Care"],
          "teeth-whitening": ["Oral Care", "Dental", "Whitening"],
          "aesthetic-dermatology": ["Skincare", "Anti-Aging", "Professional"],
          "laser-treatments": ["After Care", "Skincare", "Recovery"],
          "body-contouring": ["Body Care", "Wellness", "Recovery"],
          "hair-restoration": ["Hair Care", "Scalp Care", "Growth"],
          "injectable-treatments": ["After Care", "Skincare", "Recovery"],
          "wellness-therapy": ["Wellness", "Supplements", "Recovery"],
          "specialized-procedures": ["Professional", "After Care", "Recovery"],
        }

        const relevantCategories = categoryMapping[treatment.category] || ["Skincare"]

        const { data: categoryProducts, error: categoryError } = await supabase
          .from("products")
          .select(`
            id,
            name,
            description,
            price,
            image_url,
            is_active,
            categories (
              name
            )
          `)
          .eq("is_active", true)
          .limit(6)

        if (!categoryError && categoryProducts) {
          const filteredProducts = categoryProducts.filter(
            (product) =>
              product.categories &&
              relevantCategories.some((cat) => product.categories.name.toLowerCase().includes(cat.toLowerCase())),
          )

          if (filteredProducts.length > 0) {
            setRecommendedProducts(filteredProducts.slice(0, 4))
            return
          }

          setRecommendedProducts(categoryProducts.slice(0, 4))
        } else {
          setRecommendedProducts([])
        }
      } else {
        setRecommendedProducts([])
      }
    } catch (error) {
      console.error("Error fetching recommended products:", error)
      setRecommendedProducts([])
    }
  }

  const filteredTreatments = treatments.filter((treatment) => {
    if (selectedCategory === "all") return true
    return treatment.category === selectedCategory
  })

  const handleTreatmentClick = (treatment) => {
    setSelectedTreatment(treatment)
    if (treatment.id) {
      fetchRecommendedProducts(treatment.id)
    } else {
      setRecommendedProducts([])
    }
  }

  const handleAddToCart = (product) => {
    addItem(product)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId)
    setSelectedTreatment(null)
    setShowFilters(false)

    setTimeout(() => {
      treatmentsGridRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }, 100)
  }

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading treatments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-background">
      <section
        className="relative py-16 lg:h-[50vh] md:h-[60vh] h-[70vh] flex items-center justify-center text-center bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{
          backgroundImage: `url('/images/treatmentroom.jpg')`,
          backgroundPosition: "center center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimation>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Professional Treatments</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Transform your appearance with our advanced, clinically-proven treatments designed to address your unique
              needs
            </p>
          </ScrollAnimation>
        </div>
      </section>

      <div className="lg:hidden bg-card border-b border-border px-4 py-3">
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="w-full justify-between bg-background border-border"
        >
          <span className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            {treatmentCategories.find((cat) => cat.id === selectedCategory)?.name || "All Treatments"}
          </span>
          {showFilters ? <X className="w-4 h-4" /> : <span className="text-xs">Tap to filter</span>}
        </Button>
      </div>

      <section
        className={`bg-card border-b border-border transition-all duration-300 ${
          showFilters ? "block" : "hidden lg:block"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ScrollAnimation>
            <div className="text-center mb-8 hidden lg:block">
              <h2 className="text-2xl font-semibold text-card-foreground mb-2">Select Treatment Category</h2>
              <p className="text-card-foreground/70">Choose from our specialized treatment categories</p>
            </div>
          </ScrollAnimation>

          <ScrollAnimation delay={200}>
            <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {treatmentCategories.map((category) => (
                <button
                  key={category.id}
                  id={`category-${category.id}`}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 text-left group hover:scale-105 ${
                    selectedCategory === category.id
                      ? "bg-primary border-primary text-primary-foreground shadow-lg"
                      : "bg-background border-border text-foreground hover:border-primary/50 hover:bg-accent"
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <span className="text-2xl">{category.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p
                        className={`text-sm leading-relaxed ${
                          selectedCategory === category.id ? "text-primary-foreground/80" : "text-muted-foreground"
                        }`}
                      >
                        {category.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="lg:hidden space-y-2">
              {treatmentCategories.map((category) => (
                <button
                  key={category.id}
                  id={`category-mobile-${category.id}`}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`w-full p-4 rounded-lg border transition-all duration-200 text-left ${
                    selectedCategory === category.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-border text-foreground hover:bg-accent"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{category.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-medium">{category.name}</h3>
                      <p
                        className={`text-xs mt-1 ${
                          selectedCategory === category.id ? "text-primary-foreground/80" : "text-muted-foreground"
                        }`}
                      >
                        {category.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      <section className="py-12" ref={treatmentsGridRef}>
        <div className="max-w-7xl h-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              {selectedCategory === "all"
                ? "All Treatments"
                : treatmentCategories.find((cat) => cat.id === selectedCategory)?.name}
            </h3>
            <p className="text-muted-foreground">
              {filteredTreatments.length} treatment{filteredTreatments.length !== 1 ? "s" : ""} available
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTreatments.map((treatment, index) => (
              <ScrollAnimation key={`${treatment.id}-${index}`} delay={index * 100}>
                <Card className="overflow-hidden h-full hover:shadow-lg transition-all duration-300 cursor-pointer bg-card border-border">
                  <div className="relative h-64" onClick={() => handleTreatmentClick(treatment)}>
                    <Image
                      src={treatment.image_url || "/placeholder.svg?height=300&width=400&query=treatment"}
                      alt={treatment.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-card-foreground mb-3">{treatment.name}</h3>
                    <p className="text-card-foreground/70 mb-4 line-clamp-3">{treatment.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-card-foreground/60 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {treatment.duration} minutes
                      </div>
                      <Badge variant="outline" className="text-xs border-border">
                        {treatmentCategories.find((cat) => cat.id === treatment.category)?.icon}{" "}
                        {treatment.category?.replace("-", " ") || "Treatment"}
                      </Badge>
                    </div>

                    <div className="flex justify-center items-center gap-2">
                      <Button
                        onClick={() => handleTreatmentClick(treatment)}
                        className="flex-1 bg-primary border hover:bg-primary/90 text-primary-foreground"
                      >
                        View Details
                      </Button>
                      <Link href="/booking" className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full bg-background text-foreground border-border hover:bg-accent"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimation>
            ))}
          </div>

          {filteredTreatments.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No treatments found in this category.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimation>
            <div className="bg-card rounded-lg p-8 shadow-lg border border-border">
              <h3 className="text-2xl font-semibold text-card-foreground mb-4">Need Detailed Pricing Information?</h3>
              <p className="text-card-foreground/70 mb-6 max-w-2xl mx-auto">
                Download our comprehensive price list with detailed information on all treatments, packages, and
                services.
              </p>
              <a
                href="/documents/myskinaesthetics.pdf"
                download="MySkin-Price-List.pdf"
                className="inline-flex items-center px-8 py-4 bg-background border hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download Complete Price List
              </a>
            </div>
          </ScrollAnimation>
        </div>

        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      </section>

      {selectedTreatment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-card-foreground mb-2">{selectedTreatment.name}</h2>
                  <div className="flex items-center gap-4 text-card-foreground/60">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {selectedTreatment.duration} minutes
                    </span>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setSelectedTreatment(null)} className="border-border">
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="relative h-64 rounded-lg overflow-hidden mb-4">
                    <Image
                      src={selectedTreatment.image_url || "/placeholder.svg?height=300&width=400&query=treatment"}
                      alt={selectedTreatment.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-card-foreground/70 leading-relaxed">{selectedTreatment.description}</p>

                  <div className="mt-6">
                    <Link href="/booking">
                      <Button
                        size="lg"
                        className="w-full bg-primary border hover:bg-background text-primary-foreground"
                      >
                        <Calendar className="w-5 h-5 mr-2" />
                        Book This Treatment
                      </Button>
                    </Link>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-4">
                    Recommended Products
                    {recommendedProducts.length > 0 && (
                      <span className="text-sm font-normal text-card-foreground/60 ml-2">
                        ({recommendedProducts.length} products)
                      </span>
                    )}
                  </h3>
                  {recommendedProducts.length > 0 ? (
                    <>
                      <div className="block sm:hidden">
                        <Carousel
                          opts={{
                            align: "start",
                            loop: false,
                          }}
                          className="w-full"
                        >
                          <CarouselContent className="-ml-1">
                            {recommendedProducts.map((product) => (
                              <CarouselItem key={product.id} className="pl-1 basis-full xs:basis-4/5 sm:basis-3/4">
                                <Card className="p-3 bg-background border-border w-full h-full">
                                  <div className="flex flex-col xs:flex-row items-start xs:items-center space-y-3 xs:space-y-0 xs:space-x-3">
                                    <div className="relative w-full xs:w-14 h-[250px] xs:h-[250px] rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                      <Image
                                        src={product.image_url || "/placeholder.svg?height=64&width=64&query=product"}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0 w-full">
                                      <h4 className="font-semibold text-sm text-foreground truncate">{product.name}</h4>
                                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                        {product.description}
                                      </p>
                                      <div className="flex items-center justify-between mt-2">
                                        <span className="font-bold text-sm text-primary">₦{product.price}</span>
                                        <Button
                                          size="sm"
                                          onClick={() => handleAddToCart(product)}
                                          className="bg-primary border hover:bg-primary/90 text-primary-foreground text-xs px-2 py-1 h-7"
                                        >
                                          <ShoppingCart className="w-3 h-3 mr-1" />
                                          Add
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="left-0 -translate-x-1/2" />
                          <CarouselNext className="right-0 translate-x-1/2" />
                        </Carousel>
                      </div>

                      <div className="hidden sm:block space-y-4">
                        {recommendedProducts.map((product) => (
                          <Card key={product.id} className="p-4 bg-background border-border">
                            <div className="flex items-center space-x-4">
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                                <Image
                                  src={product.image_url || "/placeholder.svg?height=64&width=64&query=product"}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground">{product.name}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="font-bold text-primary">₦{product.price}</span>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddToCart(product)}
                                    className="bg-primary border hover:bg-primary/90 text-primary-foreground"
                                  >
                                    <ShoppingCart className="w-4 h-4 mr-1" />
                                    Add to Cart
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-card-foreground/60">No specific products recommended for this treatment.</p>
                      <Link href="/products">
                        <Button variant="outline" className="mt-4 bg-background border-border">
                          Browse All Products
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimation>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Not Sure Which Treatment is Right for You?</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Book a consultation with our expert aestheticians to create a personalized treatment plan
            </p>
            <Link href="/booking">
              <Button size="lg" variant="secondary" className="border px-8 py-3">
                Schedule Consultation
              </Button>
            </Link>
          </ScrollAnimation>
        </div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      </section>
    </div>
  )
}

export default TreatmentsPage
