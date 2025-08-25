"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Award, Users } from 'lucide-react'
import { supabase } from "@/lib/supabase"
import ScrollAnimation from "@/components/scroll-animation"

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [treatments, setTreatments] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedAge, setSelectedAge] = useState("40")

  // Hero carousel images
  const heroImages = [
    "/images/aesthetics8.jpg",
    "/images/aesthetics9.jpg",
    "/images/aesthetics1.jpg",
    "/images/aesthetics10.jpg",
     "/images/aesthetics3.jpg",
  ]

  // Age-specific content with images
  const ageContent = {
    20: {
      title: "Skin Treatments for 20's",
      image: "/images/african20.webp",
      description:
        "In your 20s, prevention is key. Your skin is at its peak collagen production, but environmental factors and lifestyle choices can start to take their toll. Our treatments focus on maintaining your natural glow, preventing early signs of aging, and establishing a solid skincare routine.",
      additionalText:
        "From gentle cleansing treatments to protective antioxidant therapies, we help you build the foundation for lifelong healthy skin. Regular HydraFacials and LED therapy can maintain your skin's natural radiance.",
    },
    30: {
      title: "Skin Treatments for 30's",
      image: "/images/african30.webp",
      description:
        "Your 30s mark the beginning of visible aging signs. Collagen production starts to slow down, and you may notice fine lines, uneven skin tone, and changes in texture. Our treatments target these early concerns with advanced preventive care.",
      additionalText:
        "Microneedling, chemical peels, and targeted serums become essential. We focus on maintaining elasticity, evening skin tone, and preventing deeper lines from forming.",
    },
    40: {
      title: "Skin Treatments for 40's",
      image: "/images/african40.jpg",
      description:
        "As we age, our skin undergoes significant changes. In your 40s, collagen production decreases, fine lines become more pronounced, and skin elasticity diminishes. Our specialized treatments are designed to address these specific concerns with advanced technology and proven techniques.",
      additionalText:
        "From HydraFacials to microneedling, chemical peels to LED therapy, we offer comprehensive solutions that restore your skin's natural radiance and help you feel confident at any age.",
    },
    50: {
      title: "Skin Treatments for 50's",
      image: "/images/african50.jpg",
      description:
        "In your 50s, hormonal changes significantly impact your skin. Menopause can cause dryness, loss of firmness, and deeper wrinkles. Our comprehensive treatments focus on restoration, hydration, and advanced anti-aging solutions.",
      additionalText:
        "Bio-remodelling treatments, advanced peels, and intensive hydration therapies help restore volume, improve texture, and maintain a youthful appearance. We combine multiple modalities for optimal results.",
    },
  }

  useEffect(() => {
    fetchFeaturedProducts()
    fetchTreatments()
  }, [])

  // Hero image carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1))
    }, 4000) // Change image every 4 seconds

    return () => clearInterval(interval)
  }, [heroImages.length])

  const fetchFeaturedProducts = async () => {
    const { data, error } = await supabase.from("products").select("*").eq("is_active", true).limit(4)

    if (!error && data) {
      setFeaturedProducts(data)
    }
  }

  const fetchTreatments = async () => {
    const { data, error } = await supabase.from("treatments").select("*").eq("is_active", true).limit(3)

    if (!error && data) {
      setTreatments(data)
    }
  }

  return (
    <div className="pt-16 bg-background overflow-x-hidden">
      {/* Hero Section - Full Width with Carousel */}
      <section className="relative h-[70vh] min-h-[600px] overflow-hidden">
        {/* Image Carousel */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`Professional aesthetic treatment ${index + 1}`}
                fill
                className="object-cover w-full h-full"
                priority={index === 0}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>

        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <ScrollAnimation animation="fadeInUp">
              <h1 className="md:text-5xl text-4xl lg:text-7xl font-light mb-6 tracking-wide">
                Transform Your Beauty with
                <span className="block font-bold mt-2">Professional Care</span>
              </h1>
              <p className="text-xl lg:text-2xl mb-8 font-light opacity-90 max-w-2xl mx-auto">
                Experience the ultimate in aesthetic treatments with our advanced procedures and premium products
              </p>
              <Link href="/booking">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100 px-12 py-4 text-lg font-medium tracking-wide"
                >
                  BOOK CONSULTATION
                </Button>
              </Link>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Three Column Trust Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="text-center mb-16">
              <h2 className="text-sm font-medium text-white mb-4 tracking-widest uppercase">
                Know the skin you're in... Know MySkin
              </h2>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <ScrollAnimation delay={100}>
              <div className="text-center h-full bg-card rounded-lg p-12 border-1">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Trusted for over 10 years</h3>
                <p className="text-muted-foreground leading-relaxed">
                  MySkin clinics have been delivering cutting-edge aesthetic treatments and have been trusted by
                  thousands of clients across Nigeria for exceptional results.
                </p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={200}>
              <div className="text-center h-full bg-card rounded-lg p-12">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Highly skilled Medical Team</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our team are not only fully trained in advanced aesthetic procedures but are also qualified in beauty
                  therapy and have extensive experience in the industry.
                </p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={300}>
              <div className="text-center h-full bg-card rounded-lg p-12">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Academy Trained</h3>
                <p className="text-muted-foreground leading-relaxed">
                  All MySkin and Dermal Therapists are qualified in Beauty Therapy, have completed advanced training and
                  are continually updating their skills.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Split Content Section with Age Selector */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollAnimation animation="fadeInLeft">
              <div className="space-y-8">
                <div>
                  {/* Age Selector */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Select Age Group</label>
                    <Select value={selectedAge} onValueChange={setSelectedAge}>
                      <SelectTrigger className="w-48 bg-card border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="20">20's</SelectItem>
                        <SelectItem value="30">30's</SelectItem>
                        <SelectItem value="40">40's</SelectItem>
                        <SelectItem value="50">50's</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <h2 className="text-4xl lg:text-5xl font-light text-foreground mb-6">
                    {ageContent[selectedAge].title.split(" ").slice(0, 3).join(" ")}
                    <span className="block text-6xl lg:text-7xl font-bold text-primary">{selectedAge}'s</span>
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                    {ageContent[selectedAge].description}
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-8">{ageContent[selectedAge].additionalText}</p>
                </div>

                <div className="flex gap-4">
                  <Link href="/treatments">
                    <Button className="bg-primary border hover:bg-primary/90 text-primary-foreground px-8">
                      VIEW TREATMENTS
                    </Button>
                  </Link>
                  <Link href="/booking">
                    <Button variant="outline" className="bg-transparent px-8">
                      BOOK NOW
                    </Button>
                  </Link>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="fadeInRight" delay={200}>
              <div className="relative">
                <Image
                  src={ageContent[selectedAge].image || "/placeholder.svg"}
                  alt={`Beautiful woman in her ${selectedAge}s with glowing skin`}
                  width={500}
                  height={800}
                  className="rounded-lg shadow-2xl object-cover h-[600px] w-full md:w-full"
                />
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Skin Concern Section - Full Width */}
      <section className="pb-5 pr-4 bg-card">
        <ScrollAnimation>
          <div className="relative w-full h-[80vh] min-h-[600px] overflow-hidden">
            <Image
              src="/images/skin-concern.png"
              alt="Skin Concern Analysis - Before and After Treatment Comparison"
              fill
              className="object-cover"
            />
          </div>
          {/* Content Overlay */}
          <div className="flex flex-col items-center justify-center md:flex-row md:justify-end md:items-end pt-3">
            <div className="px-4 gap-1 text-center md:text-left">
              <h2 className=" lg:text-2xl md:text-center text-xl font-light mb-8 text-primary-foregroun md:py-6  py-1 px-5 inline-block">
                Do you have a Skin Concern?
              </h2>
              <Link href="/contact">
                <Button
                  size="lg"
                  className="border-2 bg-card rounded-none text-primary hover:bg-background px-12 md:py-4 pt-0 text-lg font-medium tracking-wide mt-4"
                >
                  YES! PLEASE HELP
                </Button>
              </Link>
            </div>
          </div>
        </ScrollAnimation>
      </section>

      {/* Bio Remodelling Section - Full Width */}
      <section className="py-0 bg-card">
        <ScrollAnimation delay={200}>
          <div className="relative max-w-[66rem] lg:max-w-[70rem] mx-auto h-[80vh] min-h-[600px] overflow-hidden bg-black">
            <Image
              src="/images/bio-modelling.jpg"
              alt="Bio Remodelling Treatment - Beautiful Woman Portrait"
              fill
              className="object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent"></div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div className="text-white space-y-8 z-10">
                    <div className="space-y-6">
                      <h2 className="text-4xl lg:text-5xl font-light text-[#c19a88] leading-tight">
                        NEW Bio Remodelling
                      </h2>
                      <p className="text-lg leading-relaxed max-w-lg text-white/90">
                        Bio Remodelling is a revolutionary injectable treatment designed to stimulate collagen
                        production, firm saggy skin, reverse skin ageing and deeply hydrate the skin for a luminous,
                        youthful glow.
                      </p>
                    </div>

                    <Link href="/treatments">
                      <Button
                        variant="outline"
                        size="lg"
                        className="mt-6 bg-transparent border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-medium tracking-wide transition-all duration-300"
                      >
                        GO TO BIO REMODELLING →
                      </Button>
                    </Link>
                  </div>

                  {/* Right side is handled by the background image */}
                  <div></div>
                </div>
              </div>

              {/* Vertical Text */}
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2 rotate-90 z-10">
                <p className="text-white/80 text-sm tracking-widest font-light">NEW Treatment</p>
              </div>
            </div>
          </div>
        </ScrollAnimation>
      </section>

      {/* Treatment Showcase */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Microneedling */}
            <ScrollAnimation>
              <div className="space-y-6">
                <div className="relative h-96 rounded-lg overflow-hidden">
                  <Image
                    src="/images/microneedling.jpg"
                    alt="Microneedling Treatment"
                    fill
                    className="object-cover h-full"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-3">SkinPen Microneedling</h3>
                  <p className="text-muted-foreground mb-4">
                    Advanced collagen induction therapy that stimulates natural skin regeneration for improved texture
                    and reduced signs of aging.
                  </p>
                  <Link href="/treatments">
                    <Button variant="outline" className="bg-transparent">
                      LEARN MORE
                    </Button>
                  </Link>
                </div>
              </div>
            </ScrollAnimation>

            {/* Skin Analysis */}
            <ScrollAnimation delay={200}>
              <div className="space-y-6">
                <div className="relative h-96 rounded-lg overflow-hidden">
                  <Image
                    src="/images/skinanalysis.jpg"
                    alt="Skin Analysis"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-3">Advanced Skin Analysis</h3>
                  <p className="text-muted-foreground mb-4">
                    Comprehensive skin assessment using advanced technology to create personalized treatment plans for
                    optimal results.
                  </p>
                  <Link href="/booking">
                    <Button variant="outline" className="bg-transparent">
                      BOOK ANALYSIS
                    </Button>
                  </Link>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light text-foreground mb-4">Featured Products</h2>
              <p className="text-muted-foreground">Professional-grade skincare for home use</p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <ScrollAnimation key={product.id} delay={index * 100}>
                <Card className="h-full text-center hover:shadow-lg transition-all duration-300 bg-card border-border">
                  <CardContent className="p-6">
                    <div className="relative h-48 mb-4">
                      <Image
                        src={product.image_url || "/placeholder.svg?height=200&width=200&query=skincare product"}
                        alt={product.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <h3 className="font-medium text-foreground mb-2">{product.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{product.description}</p>
                    <p className="text-xl font-semibold text-primary mb-4">₦{product.price}</p>
                    <Link href={`/products/${product.id}`}>
                      <Button size="sm" className="bg-card border hover:bg-primary/90 text-primary-foreground">
                        VIEW PRODUCT
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </ScrollAnimation>
            ))}
          </div>

          <ScrollAnimation delay={500}>
            <div className="text-center mt-12">
              <Link href="/products">
                <Button variant="outline" size="lg" className="bg-card px-8">
                  VIEW ALL PRODUCTS
                </Button>
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Bottom CTA Sections */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Find Clinic */}
            <ScrollAnimation>
              <div className="text-center">
                <h2 className="text-3xl font-light text-foreground mb-6">Find your local MySkin Clinic</h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Locate the nearest MySkin clinic to you and book your consultation with our expert team.
                </p>
                <Link href="/contact">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                    FIND CLINIC
                  </Button>
                </Link>
              </div>
            </ScrollAnimation>

            {/* Book Appointment */}
            <ScrollAnimation delay={200}>
              <div className="text-center">
                <h2 className="text-3xl font-light text-foreground mb-6">Need an Appointment?</h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Ready to start your aesthetic journey? Book a consultation with our experienced professionals.
                </p>
                <Link href="/booking">
                  <Button size="lg" variant="outline" className="bg-transparent px-8">
                    BOOK NOW
                  </Button>
                </Link>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
