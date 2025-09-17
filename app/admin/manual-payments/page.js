"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Search, CreditCard, CheckCircle, XCircle, Clock, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AdminNavigation from "@/components/admin-navigation"
import { createClient } from "@supabase/supabase-js"

const AdminManualPaymentsPage = () => {
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [processingPaymentId, setProcessingPaymentId] = useState(null)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [adminNotes, setAdminNotes] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  useEffect(() => {
    checkAuth()
    fetchPayments()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, searchTerm, statusFilter])

  const checkAuth = async () => {
    try {
      console.log("[v0] Manual Payments: Checking JWT authentication...")
      const response = await fetch("/api/verify-admin")

      if (!response.ok) {
        console.log("[v0] Manual Payments: Not authenticated, redirecting to login...")
        router.push("/admin")
        return
      }

      const { authenticated } = await response.json()
      if (!authenticated) {
        console.log("[v0] Manual Payments: Not authenticated, redirecting to login...")
        router.push("/admin")
        return
      }

      console.log("[v0] Manual Payments: Authenticated successfully")
    } catch (error) {
      console.error("[v0] Manual Payments: Auth check failed:", error)
      router.push("/admin")
    }
  }

  const fetchPayments = async () => {
    try {
      console.log("[v0] Manual Payments: Fetching payments...")
      const { data, error } = await supabase
        .from("manual_payments")
        .select(`
          *,
          orders (
            id,
            user_email,
            customer_name,
            customer_phone,
            customer_address,
            customer_city,
            customer_state,
            total_amount
          )
        `)
        .order("submitted_at", { ascending: false })

      if (error) {
        console.error("[v0] Manual Payments: Error fetching payments:", error)
        setLoading(false)
        return
      }

      console.log("[v0] Manual Payments: Fetched", data?.length || 0, "payments")
      setPayments(data || [])
    } catch (error) {
      console.error("[v0] Manual Payments: Fetch error:", error)
      setPayments([])
    }
    setLoading(false)
  }

  const filterPayments = () => {
    let filtered = payments

    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.orders?.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.orders?.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.transfer_reference?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((payment) => payment.payment_status === statusFilter)
    }

    setFilteredPayments(filtered)
  }

  const updatePaymentStatus = async (paymentId, newStatus, notes = "") => {
    setProcessingPaymentId(paymentId)

    try {
      const response = await fetch(`/api/admin/manual-payments/${paymentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          notes: notes,
          reviewedBy: "admin",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update payment status")
      }

      const result = await response.json()
      console.log("[v0] Payment update result:", result)

      toast({
        title: "Payment Updated",
        description: result.message || `Payment has been ${newStatus}.`,
      })

      // Refresh the payments list
      fetchPayments()
      setSelectedPayment(null)
      setAdminNotes("")
    } catch (error) {
      console.error("Update payment error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update payment status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingPaymentId(null)
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <>
        <AdminNavigation />
        <div className="pt-16 min-h-screen flex items-center justify-center bg-card">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading manual payments...</p>
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
                <h1 className="text-3xl font-bold text-foreground">Manual Payments</h1>
                <p className="text-muted-foreground">Review and manage manual bank transfer payments</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {payments.filter((p) => p.payment_status === "pending").length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold text-green-600">
                      {payments.filter((p) => p.payment_status === "approved").length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">
                      {payments.filter((p) => p.payment_status === "rejected").length}
                    </p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold text-primary">{payments.length}</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search payments..."
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payments List */}
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <Card key={payment.id} className="bg-background border-border">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Payment Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground">Payment #{payment.id.slice(-8)}</h3>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payment.payment_status)}
                          <Badge className={getStatusColor(payment.payment_status)}>
                            {payment.payment_status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-muted-foreground">Sender Name:</p>
                            <p className="font-medium">{payment.sender_name}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Amount Paid:</p>
                            <p className="font-medium">₦{payment.amount_paid}</p>
                          </div>
                        </div>

                        {payment.transfer_reference && (
                          <div>
                            <p className="text-muted-foreground">Transfer Reference:</p>
                            <p className="font-medium">{payment.transfer_reference}</p>
                          </div>
                        )}

                        {payment.bank_name && (
                          <div>
                            <p className="text-muted-foreground">Bank Name:</p>
                            <p className="font-medium">{payment.bank_name}</p>
                          </div>
                        )}

                        <div>
                          <p className="text-muted-foreground">Submitted:</p>
                          <p className="font-medium">{formatDate(payment.submitted_at)}</p>
                        </div>

                        {payment.reviewed_at && (
                          <div>
                            <p className="text-muted-foreground">Reviewed:</p>
                            <p className="font-medium">{formatDate(payment.reviewed_at)}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Info */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Order Details</h4>
                      {payment.orders && (
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="text-sm text-muted-foreground">Order ID:</p>
                            <p className="font-medium">#{payment.orders.id.slice(-8)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Customer:</p>
                            <p className="font-medium">{payment.orders.customer_name || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Email:</p>
                            <p className="font-medium text-xs">{payment.orders.user_email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Phone:</p>
                            <p className="font-medium">{payment.orders.customer_phone || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Address:</p>
                            <p className="font-medium">{payment.orders.customer_address || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">City, State:</p>
                            <p className="font-medium">
                              {payment.orders.customer_city && payment.orders.customer_state
                                ? `${payment.orders.customer_city}, ${payment.orders.customer_state}`
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Order Total:</p>
                            <p className="font-medium">₦{payment.orders.total_amount}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-transparent"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Payment Details</DialogTitle>
                          </DialogHeader>
                          {selectedPayment && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Payment ID:</p>
                                  <p className="font-medium">#{selectedPayment.id.slice(-8)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Status:</p>
                                  <Badge className={getStatusColor(selectedPayment.payment_status)}>
                                    {selectedPayment.payment_status.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Customer Name:</p>
                                  <p className="font-medium">{selectedPayment.orders?.customer_name || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Phone:</p>
                                  <p className="font-medium">{selectedPayment.orders?.customer_phone || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Email:</p>
                                  <p className="font-medium text-xs">{selectedPayment.orders?.user_email || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Bank Name:</p>
                                  <p className="font-medium">{selectedPayment.bank_name || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Address:</p>
                                  <p className="font-medium">{selectedPayment.orders?.customer_address || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">City:</p>
                                  <p className="font-medium">{selectedPayment.orders?.customer_city || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">State:</p>
                                  <p className="font-medium">{selectedPayment.orders?.customer_state || "N/A"}</p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Admin Notes:</p>
                                <Textarea
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  placeholder="Add notes about this payment verification..."
                                  className="bg-card"
                                  rows={3}
                                />
                              </div>

                              {selectedPayment.payment_status === "pending" && (
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => updatePaymentStatus(selectedPayment.id, "approved", adminNotes)}
                                    disabled={processingPaymentId === selectedPayment.id}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve Payment
                                  </Button>
                                  <Button
                                    onClick={() => updatePaymentStatus(selectedPayment.id, "rejected", adminNotes)}
                                    disabled={processingPaymentId === selectedPayment.id}
                                    variant="destructive"
                                    className="flex-1"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject Payment
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {payment.payment_status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updatePaymentStatus(payment.id, "approved")}
                            disabled={processingPaymentId === payment.id}
                            className="w-full bg-green-500 hover:bg-green-600 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {processingPaymentId === payment.id ? "Processing..." : "Approve"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updatePaymentStatus(payment.id, "rejected")}
                            disabled={processingPaymentId === payment.id}
                            className="w-full"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {processingPaymentId === payment.id ? "Processing..." : "Reject"}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                {searchTerm || statusFilter !== "all"
                  ? "No payments found matching your criteria."
                  : "No manual payments yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default AdminManualPaymentsPage
