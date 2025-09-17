"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Package, Trash2, CreditCard, Building2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AdminNavigation from "@/components/admin-navigation"

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all")
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
  }, [orders, searchTerm, statusFilter, paymentMethodFilter])

  const checkAuth = async () => {
    try {
      console.log("[v0] Orders: Checking JWT authentication...")
      const response = await fetch("/api/verify-admin")

      if (!response.ok) {
        console.log("[v0] Orders: Not authenticated, redirecting to login...")
        router.push("/admin")
        return
      }

      const { authenticated } = await response.json()
      if (!authenticated) {
        console.log("[v0] Orders: Not authenticated, redirecting to login...")
        router.push("/admin")
        return
      }

      console.log("[v0] Orders: Authenticated successfully")
    } catch (error) {
      console.error("[v0] Orders: Auth check failed:", error)
      router.push("/admin")
    }
  }

  const fetchOrders = async () => {
    try {
      console.log("[v0] Orders: Fetching orders...")
      console.log("[v0] Orders: Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log("[v0] Orders: Supabase Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

      const { createClient } = await import("@supabase/supabase-js")
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

      console.log("[v0] Orders: Testing database connection...")
      const { count, error: countError } = await supabase.from("orders").select("*", { count: "exact", head: true })

      if (countError) {
        console.error("[v0] Orders: Count query error:", countError)
      } else {
        console.log("[v0] Orders: Total orders in database:", count)
      }

      const timestamp = new Date().getTime()
      console.log("[v0] Orders: Fetching with timestamp:", timestamp)

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products (name, image_url)
          ),
          manual_payments (*)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Orders: Error fetching orders:", error)
        console.error("[v0] Orders: Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        setLoading(false)
        return
      }

      console.log("[v0] Orders: Fetched", data?.length || 0, "orders")
      console.log("[v0] Orders: Raw data:", data)

      data?.forEach((order, index) => {
        console.log(`[v0] Order ${index + 1}:`, {
          id: order.id,
          status: order.status,
          payment_method: order.payment_method,
          user_email: order.user_email,
          total_amount: order.total_amount,
          created_at: order.created_at,
          manual_payments: order.manual_payments,
          order_items: order.order_items,
        })
      })

      setOrders(data || [])
    } catch (error) {
      console.error("[v0] Orders: Fetch error:", error)
      console.error("[v0] Orders: Error stack:", error.stack)
      setOrders([])
    }
    setLoading(false)
  }

  const filterOrders = () => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.paystack_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    if (paymentMethodFilter !== "all") {
      filtered = filtered.filter((order) => order.payment_method === paymentMethodFilter)
    }

    setFilteredOrders(filtered)
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { createClient } = await import("@supabase/supabase-js")
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) {
        throw new Error(error.message)
      }

      toast({
        title: "Status Updated",
        description: `Order status has been updated to ${newStatus}.`,
      })

      await fetchOrders()
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
      const { createClient } = await import("@supabase/supabase-js")
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

      const { error } = await supabase.from("orders").delete().eq("id", orderId)

      if (error) {
        throw new Error(error.message)
      }

      toast({
        title: "Order Deleted",
        description: "The order has been successfully deleted.",
      })

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

  const getPaymentMethodIcon = (paymentMethod) => {
    return paymentMethod === "manual" ? <Building2 className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />
  }

  const needsPaymentAttention = (order) => {
    if (order.payment_method === "manual" && order.manual_payments?.length > 0) {
      const payment = order.manual_payments[0]
      return payment.payment_status === "pending" && order.status === "pending"
    }
    return false
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
          <div className="mb-6 sm:mb-8">
            <div className="mb-4 flex justify-between items-center">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLoading(true)
                  fetchOrders()
                }}
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh Orders"}
              </Button>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Manage Orders</h1>
              <p className="text-sm sm:text-base text-muted-foreground">View and manage customer orders</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 mb-6 sm:mb-8 sm:flex-row sm:gap-4">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 bg-card border-border text-sm"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-card border-border">
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

            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-card border-border">
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="paystack">Online Payment</SelectItem>
                <SelectItem value="manual">Manual Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders List */}
          <div className="space-y-4 sm:space-y-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="bg-background border-border">
                <CardHeader className="pb-3 sm:pb-6">
                  <div className="space-y-3 sm:space-y-0 sm:flex sm:justify-between sm:items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base sm:text-lg text-foreground">
                          Order #{order.id.slice(-8)}
                        </CardTitle>
                        {needsPaymentAttention(order) && (
                          <AlertCircle
                            className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0"
                            title="Payment verification needed"
                          />
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground break-all sm:break-normal">
                        {order.user_email}
                      </p>
                      {order.customer_name && (
                        <p className="text-xs sm:text-sm text-muted-foreground">{order.customer_name}</p>
                      )}
                    </div>
                    <div className="flex flex-col sm:items-end space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
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
                          className="text-xs"
                        >
                          {order.status}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                          {getPaymentMethodIcon(order.payment_method)}
                          <span className="capitalize">{order.payment_method}</span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
                    {/* Order Items */}
                    <div className="lg:col-span-2">
                      <h4 className="font-semibold text-sm sm:text-base text-foreground mb-3">Order Items</h4>
                      <div className="space-y-2 sm:space-y-3">
                        {order.order_items?.map((item) => (
                          <div key={item.id} className="flex items-start space-x-3 p-2 sm:p-3 bg-muted/50 rounded-lg">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package className="w-4 h-4 sm:w-6 sm:h-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <p className="font-medium text-sm sm:text-base text-foreground truncate">
                                {item.products?.name || "Product"}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  Qty: {item.quantity} × ₦{item.price}
                                </p>
                                <p className="font-semibold text-sm sm:text-base text-foreground">
                                  ₦{(item.quantity * item.price).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Manual Payment Info */}
                      {order.payment_method === "manual" && order.manual_payments?.length > 0 && (
                        <div className="mt-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h5 className="font-medium text-sm sm:text-base text-yellow-800 mb-2 flex items-center gap-2">
                            <Building2 className="w-4 h-4 flex-shrink-0" />
                            Manual Payment Details
                          </h5>
                          <div className="text-xs sm:text-sm text-yellow-700 space-y-1">
                            <p className="break-words">
                              <strong>Sender:</strong> {order.manual_payments[0].sender_name}
                            </p>
                            <p>
                              <strong>Amount Paid:</strong> ₦{order.manual_payments[0].amount_paid}
                            </p>
                            {order.manual_payments[0].transfer_reference && (
                              <p className="break-all">
                                <strong>Reference:</strong> {order.manual_payments[0].transfer_reference}
                              </p>
                            )}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <strong>Status:</strong>
                              <Badge
                                className="self-start"
                                variant={
                                  order.manual_payments[0].payment_status === "approved"
                                    ? "default"
                                    : order.manual_payments[0].payment_status === "pending"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {order.manual_payments[0].payment_status}
                              </Badge>
                            </div>
                          </div>
                          {order.manual_payments[0].payment_status === "pending" && (
                            <div className="mt-3">
                              <Link href="/admin/manual-payments">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-yellow-800 border-yellow-300 bg-transparent text-xs sm:text-sm"
                                >
                                  Review Payment
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Customer Details */}
                    {(order.customer_phone ||
                      order.customer_address ||
                      order.customer_city ||
                      order.customer_state) && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-sm sm:text-base text-foreground mb-3">Customer Details</h4>
                        <div className="space-y-2 p-3 sm:p-4 bg-muted/50 rounded-lg">
                          {order.customer_phone && (
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">Phone:</span>
                              <span className="text-xs sm:text-sm text-foreground text-right">
                                {order.customer_phone}
                              </span>
                            </div>
                          )}
                          {order.customer_address && (
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">Address:</span>
                              <span className="text-xs sm:text-sm text-foreground text-right break-words">
                                {order.customer_address}
                              </span>
                            </div>
                          )}
                          {(order.customer_city || order.customer_state) && (
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">Location:</span>
                              <span className="text-xs sm:text-sm text-foreground text-right">
                                {[order.customer_city, order.customer_state].filter(Boolean).join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Order Summary */}
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base text-foreground mb-3">Order Summary</h4>
                      <div className="space-y-2 p-3 sm:p-4 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">Total Amount:</span>
                          <span className="font-semibold text-sm sm:text-base text-foreground">
                            ₦{order.total_amount}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">Payment Method:</span>
                          <div className="flex items-center gap-1">
                            {getPaymentMethodIcon(order.payment_method)}
                            <span className="capitalize text-xs sm:text-sm">{order.payment_method}</span>
                          </div>
                        </div>
                        {order.paystack_reference && (
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">Reference:</span>
                            <span className="text-xs sm:text-sm text-foreground break-all text-right">
                              {order.paystack_reference}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">Status:</span>
                          <Badge variant="outline" className="text-xs">
                            {order.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Status Update Buttons */}
                      <div className="mt-4 space-y-2">
                        {((order.payment_method === "manual" &&
                          order.manual_payments?.[0]?.payment_status === "approved") ||
                          order.payment_method === "paystack") && (
                          <>
                            {order.status === "pending" && (
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, "completed")}
                                className="w-full bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm"
                              >
                                Mark as Completed
                              </Button>
                            )}
                            {order.status === "completed" && (
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, "shipped")}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm"
                              >
                                Mark as Shipped
                              </Button>
                            )}
                            {(order.status === "pending" || order.status === "completed") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateOrderStatus(order.id, "cancelled")}
                                className="w-full text-red-500 hover:text-red-700 text-xs sm:text-sm"
                              >
                                Cancel Order
                              </Button>
                            )}
                          </>
                        )}

                        {order.payment_method === "manual" &&
                          order.manual_payments?.[0]?.payment_status === "pending" && (
                            <div className="p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-xs sm:text-sm text-yellow-800">
                                Payment verification required before order can be processed.
                              </p>
                            </div>
                          )}

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteOrder(order.id)}
                          disabled={deletingOrderId === order.id}
                          className="w-full border text-xs sm:text-sm"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
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
                {searchTerm || statusFilter !== "all" || paymentMethodFilter !== "all"
                  ? "No orders found matching your criteria."
                  : "No orders yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default AdminOrdersPage
