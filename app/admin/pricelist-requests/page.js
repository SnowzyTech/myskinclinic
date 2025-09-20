"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FileText, Search, Download, Mail, Phone, MapPin, Calendar } from "lucide-react"
import AdminNavigation from "@/components/admin-navigation"

const PricelistRequestsPage = () => {
  const [requests, setRequests] = useState([])
  const [filteredRequests, setFilteredRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    checkAuthAndFetchData()
  }, [])

  useEffect(() => {
    // Filter requests based on search term
    if (searchTerm.trim() === "") {
      setFilteredRequests(requests)
    } else {
      const filtered = requests.filter(
        (request) =>
          request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.address.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredRequests(filtered)
    }
  }, [searchTerm, requests])

  const checkAuthAndFetchData = async () => {
    try {
      console.log("[v0] Pricelist Requests: Checking authentication...")
      const response = await fetch("/api/verify-admin")

      if (!response.ok) {
        console.log("[v0] Pricelist Requests: Not authenticated, redirecting to login...")
        router.push("/admin")
        return
      }

      const { authenticated } = await response.json()
      if (!authenticated) {
        console.log("[v0] Pricelist Requests: Not authenticated, redirecting to login...")
        router.push("/admin")
        return
      }

      console.log("[v0] Pricelist Requests: Authenticated, fetching data...")
      setAuthChecked(true)
      await fetchPricelistRequests()
    } catch (error) {
      console.error("[v0] Pricelist Requests: Auth check failed:", error)
      router.push("/admin")
    }
  }

  const fetchPricelistRequests = async () => {
    try {
      console.log("[v0] Fetching pricelist requests from Supabase...")
      const { createBrowserClient } = await import("@supabase/ssr")
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      )

      const { data, error } = await supabase
        .from("pricelist_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Error fetching pricelist requests:", error)
        setRequests([])
      } else {
        console.log("[v0] Pricelist requests fetched successfully:", data?.length || 0)
        setRequests(data || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching pricelist requests:", error)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (filteredRequests.length === 0) return

    const headers = ["Name", "Email", "Phone", "Address", "Date Requested"]
    const csvContent = [
      headers.join(","),
      ...filteredRequests.map((request) =>
        [
          `"${request.name}"`,
          `"${request.email}"`,
          `"${request.phone}"`,
          `"${request.address}"`,
          `"${new Date(request.created_at).toLocaleString()}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `pricelist-requests-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!authChecked || loading) {
    return (
      <>
        <AdminNavigation />
        <div className="pt-16 min-h-screen flex items-center justify-center bg-card">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              {!authChecked ? "Verifying access..." : "Loading pricelist requests..."}
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-primary/10 flex items-center gap-3">
                  <FileText className="h-8 w-8" />
                  Pricelist Requests
                </h1>
                <p className="text-gray-600 mt-2">View and manage customers who have requested your pricelist</p>
              </div>
              <div className="flex gap-4 border rounded-sm">
                <Button onClick={exportToCSV} disabled={filteredRequests.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{requests.length}</div>
                <p className="text-xs text-muted-foreground">All time pricelist requests</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    requests.filter(
                      (request) =>
                        new Date(request.created_at).getMonth() === new Date().getMonth() &&
                        new Date(request.created_at).getFullYear() === new Date().getFullYear(),
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">Requests this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    requests.filter((request) => {
                      const requestDate = new Date(request.created_at)
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return requestDate >= weekAgo
                    }).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">Requests this week</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, phone, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <h3 className="font-semibold text-lg text-primary">{request.name}</h3>
                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">{request.email}</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-primary">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{request.phone}</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-primary">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{request.address}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(request.created_at).toLocaleDateString()}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? "No matching requests found" : "No pricelist requests yet"}
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "When customers request your pricelist, they'll appear here"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default PricelistRequestsPage
