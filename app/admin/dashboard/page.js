"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Calendar, Package, Briefcase, Stethoscope, PenTool } from "lucide-react"
import { supabase } from "@/lib/supabase"
import AdminNavigation from "@/components/admin-navigation"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalApplications: 0,
    totalBookings: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalTreatments: 0,
    totalBlogPosts: 0,
    recentApplications: [],
    recentBookings: [],
    recentOrders: [],
    recentBlogPosts: [],
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchDashboardData()
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

  const fetchDashboardData = async () => {
    try {
      // Fetch applications count
      const { count: applicationsCount } = await supabase
        .from("job_applications")
        .select("*", { count: "exact", head: true })

      // Fetch bookings count
      const { count: bookingsCount } = await supabase.from("bookings").select("*", { count: "exact", head: true })

      // Fetch orders count
      const { count: ordersCount } = await supabase.from("orders").select("*", { count: "exact", head: true })

      // Fetch products count
      const { count: productsCount } = await supabase.from("products").select("*", { count: "exact", head: true })

      // Fetch treatments count
      const { count: treatmentsCount } = await supabase.from("treatments").select("*", { count: "exact", head: true })

      // Fetch blog posts count
      const { count: blogPostsCount } = await supabase.from("blog_posts").select("*", { count: "exact", head: true })

      // Fetch recent applications
      const { data: recentApplications } = await supabase
        .from("job_applications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      // Fetch recent bookings
      const { data: recentBookings } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      // Fetch recent orders
      const { data: recentOrders } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      // Fetch recent blog posts
      const { data: recentBlogPosts } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      setStats({
        totalApplications: applicationsCount || 0,
        totalBookings: bookingsCount || 0,
        totalOrders: ordersCount || 0,
        totalProducts: productsCount || 0,
        totalTreatments: treatmentsCount || 0,
        totalBlogPosts: blogPostsCount || 0,
        recentApplications: recentApplications || [],
        recentBookings: recentBookings || [],
        recentOrders: recentOrders || [],
        recentBlogPosts: recentBlogPosts || [],
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <AdminNavigation />
        <div className="pt-16 min-h-screen flex items-center justify-center bg-card">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary/10">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Job Applications</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground">Total applications received</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                <p className="text-xs text-muted-foreground">Total appointments booked</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">Total product orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">Products in catalog</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Treatments</CardTitle>
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTreatments}</div>
                <p className="text-xs text-muted-foreground">Available treatments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
                <PenTool className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBlogPosts}</div>
                <p className="text-xs text-muted-foreground">Published blog posts</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
            <Link href="/admin/applications">
              <Card className="hover:shadow-lg h-full transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 lg:p-2 xl:p-1 bg-blue-100 rounded-lg">
                      <Briefcase className="xl:w-5 xl:h-5 h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary/30">Manage Applications</h3>
                      <p className="text-sm text-gray-600">View job applications & openings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/bookings">
              <Card className="hover:shadow-lg h-full transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary/30">Manage Bookings</h3>
                      <p className="text-sm text-gray-600">View and manage appointments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/orders">
              <Card className="hover:shadow-lg h-full transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <ShoppingBag className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary/30">Manage Orders</h3>
                      <p className="text-sm text-gray-600">View and manage customer orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/products">
              <Card className="hover:shadow-lg h-full transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Package className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary/30">Manage Products</h3>
                      <p className="text-sm text-gray-600">Add and edit products</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/treatments">
              <Card className="hover:shadow-lg h-full transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Stethoscope className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary/30">Manage Treatments</h3>
                      <p className="text-sm text-gray-600">Add and edit treatments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/blog">
              <Card className="hover:shadow-lg h-full transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <PenTool className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary/30">Manage Blog</h3>
                      <p className="text-sm text-gray-600">Create and edit blog posts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-primary">Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentApplications.length > 0 ? (
                    stats.recentApplications.map((application) => (
                      <div key={application.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{application.full_name}</p>
                          <p className="text-sm text-gray-600">{application.position}</p>
                        </div>
                        <Badge variant="outline">{new Date(application.created_at).toLocaleDateString()}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No recent applications</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-primary">Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentBookings.length > 0 ? (
                    stats.recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{booking.full_name}</p>
                          <p className="text-sm text-gray-600">{booking.service}</p>
                        </div>
                        <Badge variant="outline">{new Date(booking.preferred_date).toLocaleDateString()}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No recent bookings</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-primary">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-600">₦{order.total_amount}</p>
                        </div>
                        <Badge variant={order.status === "completed" ? "default" : "secondary"}>{order.status}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No recent orders</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Blog Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-primary">Recent Blog Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentBlogPosts.length > 0 ? (
                    stats.recentBlogPosts.map((post) => (
                      <div key={post.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{post.title}</p>
                          <p className="text-sm text-gray-600">{post.is_published ? "Published" : "Draft"}</p>
                        </div>
                        <Badge variant="outline">{new Date(post.created_at).toLocaleDateString()}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No recent blog posts</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminDashboard
