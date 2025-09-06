"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Package, Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const OrderStatusPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [orderData, setOrderData] = useState(null)
  const [paymentData, setPaymentData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter an order ID or email address.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setSearched(true)

    try {
      const response = await fetch(`/api/orders/status?query=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (data.success) {
        setOrderData(data.order)
        setPaymentData(data.payment)
      } else {
        setOrderData(null)
        setPaymentData(null)
        toast({
          title: "Order Not Found",
          description: "No order found with the provided information.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error searching order:", error)
      toast({
        title: "Search Error",
        description: "Failed to search for order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "completed":
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "shipped":
        return <Package className="w-5 h-5 text-blue-500" />
      case "cancelled":
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "completed":
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary">Order Status</h1>
            <p className="text-muted-foreground">Check the status of your order and payment</p>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-primary">Find Your Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter order ID or email address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="bg-card"
                />
              </div>
              <Button onClick={handleSearch} disabled={loading} className="bg-primary hover:bg-primary/90">
                <Search className="w-4 h-4 mr-2" />
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Order Results */}
        {searched && !orderData && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">No Order Found</h3>
              <p className="text-muted-foreground">
                We couldn't find an order with the provided information. Please check your order ID or email address and
                try again.
              </p>
            </CardContent>
          </Card>
        )}

        {orderData && (
          <div className="space-y-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-primary">Order #{orderData.id.slice(-8)}</CardTitle>
                    <p className="text-muted-foreground">Placed on {formatDate(orderData.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(orderData.status)}
                    <Badge className={getStatusColor(orderData.status)}>{orderData.status.toUpperCase()}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Customer Details</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">Email:</span> {orderData.user_email}
                      </p>
                      {orderData.customer_name && (
                        <p>
                          <span className="text-muted-foreground">Name:</span> {orderData.customer_name}
                        </p>
                      )}
                      {orderData.customer_phone && (
                        <p>
                          <span className="text-muted-foreground">Phone:</span> {orderData.customer_phone}
                        </p>
                      )}
                      {orderData.customer_address && (
                        <p>
                          <span className="text-muted-foreground">Address:</span> {orderData.customer_address}
                        </p>
                      )}
                      {orderData.customer_city && orderData.customer_state && (
                        <p>
                          <span className="text-muted-foreground">Location:</span> {orderData.customer_city},{" "}
                          {orderData.customer_state}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Amount:</span>
                        <span className="font-semibold">₦{orderData.total_amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Method:</span>
                        <span className="capitalize">{orderData.payment_method}</span>
                      </div>
                      {orderData.paystack_reference && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment Reference:</span>
                          <span className="text-xs">{orderData.paystack_reference}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Manual Payment Status */}
            {orderData.payment_method === "manual" && paymentData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Manual Payment Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-card rounded-lg">
                      <div>
                        <p className="font-medium">Payment Verification</p>
                        <p className="text-sm text-muted-foreground">
                          Submitted on {formatDate(paymentData.submitted_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(paymentData.payment_status)}
                        <Badge className={getStatusColor(paymentData.payment_status)}>
                          {paymentData.payment_status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Sender Name:</p>
                        <p className="font-medium">{paymentData.sender_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Amount Paid:</p>
                        <p className="font-medium">₦{paymentData.amount_paid}</p>
                      </div>
                      {paymentData.transfer_reference && (
                        <div>
                          <p className="text-sm text-muted-foreground">Transfer Reference:</p>
                          <p className="font-medium">{paymentData.transfer_reference}</p>
                        </div>
                      )}
                      {paymentData.reviewed_at && (
                        <div>
                          <p className="text-sm text-muted-foreground">Reviewed On:</p>
                          <p className="font-medium">{formatDate(paymentData.reviewed_at)}</p>
                        </div>
                      )}
                    </div>

                    {paymentData.admin_notes && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 mb-1">Admin Notes:</p>
                        <p className="text-sm text-blue-700">{paymentData.admin_notes}</p>
                      </div>
                    )}

                    {paymentData.payment_status === "pending" && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Your payment is being verified.</strong> Our team will review your bank transfer and
                          update the status within 1-2 business days. You'll receive an email notification once the
                          verification is complete.
                        </p>
                      </div>
                    )}

                    {paymentData.payment_status === "approved" && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Payment Approved!</strong> Your payment has been verified and your order is now being
                          processed for delivery.
                        </p>
                      </div>
                    )}

                    {paymentData.payment_status === "rejected" && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Payment Rejected.</strong> There was an issue with your payment verification. Please
                          contact our support team for assistance or try submitting your payment again.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            {orderData.order_items && orderData.order_items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orderData.order_items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-card rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{item.products?.name || "Product"}</p>
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₦{(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">₦{item.price} each</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="font-bold text-lg text-primary">₦{orderData.total_amount}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderStatusPage
