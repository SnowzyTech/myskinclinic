"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Package, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import AdminNavigation from "@/components/admin-navigation"

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [deletingOrderId, setDeletingOrderId] = useState(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/admin")
      return
    }
  }

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`*
        order_items (
          *,
          products (
            name,
            image_url
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setOrders(data)
    }
    setLoading(false)
  }

  const filterOrders = () => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.paystack_reference?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

      if (error) throw error

      toast({
        title: "Status Updated",
        description: `Order status has been updated to ${newStatus}.`,
      })

      fetchOrders()
    } catch (error) {
      console.error("Update status error:", error)
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteOrder = async (orderId) => {
    if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      return
    }

    setDeletingOrderId(orderId)

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete order")
      }

      toast({
        title: "Order Deleted",
        description: "The order has been successfully deleted.",
      })

      // Remove the deleted order from the state
      setOrders(orders.filter((order) => order.id !== orderId))
    } catch (error) {
      console.error("Delete order error:", error)
      toast({
        title: "Error",
        description: "Failed to delete order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingOrderId(null)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <>
        <AdminNavigation />
        <div className="pt-16 min-h-screen flex items-center justify-center bg-card">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <AdminNavigation />
      <div className="pt-16 min-h-screen bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex flex-col items-start gap-4">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Manage Orders</h1>
                <p className="text-muted-foreground">View and manage customer orders</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-card border-border">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders List */}
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="bg-background border-border">
                <CardHeader>
                  <div className="flex justify-between items-start ">
                    <div>
                      <CardTitle className="text-lg text-foreground">Order #{order.id.slice(-8)}</CardTitle>
                      <p className="text-muted-foreground text-[12px] md:text-lg text-start truncate">{order.user_email}</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          order.status === "completed"
                            ? "default"
                            : order.status === "pending"
                              ? "secondary"
                              : order.status === "shipped"
                                ? "default"
                                : "destructive"
                        }
                      >
                        {order.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Items */}
                    <div className="lg:col-span-2">
                      <h4 className="font-semibold text-foreground mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {order.order_items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-3 bg-background rounded-lg"
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                <Package className="w-6 h-6 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">
                                  {item.products?.name || "Product"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Quantity: {item.quantity} × ₦{item.price}
                                </p>
                              </div>
                            </div>
                            <div className="text-right sm:text-right">
                              <p className="font-semibold text-foreground">
                                ₦{(item.quantity * item.price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Order Summary</h4>
                      <div className="space-y-2 p-4 bg-background rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Amount:</span>
                          <span className="font-semibold text-foreground">₦{order.total_amount}</span>
                        </div>
                        {order.paystack_reference && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Reference:</span>
                            <span className="text-sm text-foreground truncate max-w-[120px] sm:max-w-none">
                              {order.paystack_reference}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant="outline">{order.status}</Badge>
                        </div>
                      </div>

                      {/* Status Update Buttons */}
                      <div className="mt-4 space-y-2">
                        {order.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, "completed")}
                            className="w-full bg-green-500 hover:bg-green-600 text-white"
                          >
                            Mark as Completed
                          </Button>
                        )}
                        {order.status === "completed" && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, "shipped")}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            Mark as Shipped
                          </Button>
                        )}
                        {(order.status === "pending" || order.status === "completed") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOrderStatus(order.id, "cancelled")}
                            className="w-full text-red-500 hover:text-red-700"
                          >
                            Cancel Order
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteOrder(order.id)}
                          disabled={deletingOrderId === order.id}
                          className="w-full border"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {deletingOrderId === order.id ? "Deleting..." : "Delete Order"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {searchTerm || statusFilter !== "all" ? "No orders found matching your criteria." : "No orders yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default AdminOrdersPage
