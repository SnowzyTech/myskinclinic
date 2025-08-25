"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Calendar, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import ScrollAnimation from "@/components/scroll-animation"
const BlogPage = () => {
  const [posts, setPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [posts, searchTerm])

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setPosts(data)
    }
    setLoading(false)
  }

  const filterPosts = () => {
    if (!searchTerm) {
      setFilteredPosts(posts)
    } else {
      const filtered = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredPosts(filtered)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-card">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-background">
      {/* Hero Header with Background Image */}
      <section
        className="relative bg-card py-24 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/images/blog2.webp')`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <ScrollAnimation>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">Skincare Blog & Tips</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Expert advice, skincare tips, and the latest trends from our professional aestheticians
            </p>
          </ScrollAnimation>
        </div>

        {/* Decorative overlay pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50/20"></div>
      </section>

      {/* Search Section with subtle background */}
      <section className="py-12 bg-card backdrop-blur-sm border-b relative">
        <div
          
        ></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-md mx-auto bg-background">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search blog posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="py-16 bg-background relative">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-background rounded-2xl p-12 shadow-sm">
                <p className="text-gray-600 text-lg">
                  {searchTerm ? "No blog posts found matching your search." : "No blog posts available."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             

             
              {filteredPosts.map((post, index) => (
                <ScrollAnimation key={post.id} delay={index * 50}>
                <Card
                  key={post.id}
                  className="overflow-hidden h-full hover:shadow-xl transition-all duration-300 bg-card backdrop-blur-sm border-0 shadow-lg"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.image_url || "/placeholder.svg?height=200&width=400&query=skincare blog post"}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(post.created_at)}
                    </div>

                    <h3 className="text-xl font-semibold text-primary mb-3 line-clamp-2">{post.title}</h3>

                    <p className="text-primary mb-4 line-clamp-3">{post.excerpt}</p>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-primary hover:text-primary/90 font-medium transition-colors"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </CardContent>
                </Card>
                </ScrollAnimation>
              ))}
              
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup with Background */}
      <section
        className="py-20 relative bg-primary/100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <ScrollAnimation>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Stay Updated with Skincare Tips</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest skincare advice, treatment updates, and exclusive offers
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <Input
              placeholder="Enter your email"
              className="bg-background backdrop-blur-sm border-white/20 text-gray-900 placeholder:text-gray-500"
            />
            <button className="bg-background border text-primary px-8 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
          </ScrollAnimation>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      </section>
    </div>
  )
}

export default BlogPage
