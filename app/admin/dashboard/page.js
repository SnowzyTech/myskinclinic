"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Calendar, Package, Briefcase, Stethoscope, PenTool, CreditCard } from "lucide-react"
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
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuthAndFetchData()
  }, [])

  const checkAuthAndFetchData = async () => {
    try {
      console.log("[v0] Dashboard: Checking authentication...")
      const response = await fetch("/api/verify-admin")

      if (!response.ok) {
        console.log("[v0] Dashboard: Not authenticated, redirecting to login...")
        router.push("/admin")
        return
      }

      const { authenticated } = await response.json()
      if (!authenticated) {
        console.log("[v0] Dashboard: Not authenticated, redirecting to login...")
        router.push("/admin")
        return
      }

      console.log("[v0] Dashboard: Authenticated, fetching data...")
      setAuthChecked(true)
      await fetchDashboardData()
    } catch (error) {
      console.error("[v0] Dashboard: Auth check failed:", error)
      router.push("/admin")
    }
  }

  const fetchDashboardData = async () => {
    try {
      console.log("[v0] Dashboard: Starting data fetch...")
      const { createBrowserClient } = await import("@supabase/ssr")
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      )

      console.log("[v0] Fetching dashboard data from Supabase...")

      const [applicationsResult, bookingsResult, ordersResult, productsResult, treatmentsResult, blogPostsResult] =
        await Promise.allSettled([
          supabase.from("job_applications").select("*", { count: "exact" }),
          supabase.from("bookings").select("*", { count: "exact" }),
          supabase.from("orders").select("*", { count: "exact" }),
          supabase.from("products").select("*", { count: "exact" }),
          supabase.from("treatments").select("*", { count: "exact" }),
          supabase.from("blog_posts").select("*", { count: "exact" }),
        ])

      const applications = applicationsResult.status === "fulfilled" ? applicationsResult.value : { data: [], count: 0 }
      const bookings = bookingsResult.status === "fulfilled" ? bookingsResult.value : { data: [], count: 0 }
      const orders = ordersResult.status === "fulfilled" ? ordersResult.value : { data: [], count: 0 }
      const products = productsResult.status === "fulfilled" ? productsResult.value : { data: [], count: 0 }
      const treatments = treatmentsResult.status === "fulfilled" ? treatmentsResult.value : { data: [], count: 0 }
      const blogPosts = blogPostsResult.status === "fulfilled" ? blogPostsResult.value : { data: [], count: 0 }

      console.log("[v0] Dashboard data fetched successfully")

      setStats({
        totalApplications: applications.count || 0,
        totalBookings: bookings.count || 0,
        totalOrders: orders.count || 0,
        totalProducts: products.count || 0,
        totalTreatments: treatments.count || 0,
        totalBlogPosts: blogPosts.count || 0,
        recentApplications: applications.data?.slice(0, 5) || [],
        recentBookings: bookings.data?.slice(0, 5) || [],
        recentOrders: orders.data?.slice(0, 5) || [],
        recentBlogPosts: blogPosts.data?.slice(0, 5) || [],
      })
    } catch (error) {
      console.error("[v0] Error fetching dashboard data:", error)
      setStats({
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
    } finally {
      setLoading(false)
    }
  }

  if (!authChecked || loading) {
    return (
      <>
        <AdminNavigation />
        <div className="pt-16 min-h-screen flex items-center justify-center bg-card">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              {!authChecked ? "Verifying access..." : "Loading dashboard..."}
            </p>
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

            <Link href="/admin/manual-payments">
              <Card className="hover:shadow-lg h-full transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <CreditCard className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary/30">Manage Payments</h3>
                      <p className="text-sm text-gray-600">View and manage payments</p>
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
