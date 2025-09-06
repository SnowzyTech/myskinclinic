"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Copy, Building2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

const ManualCheckoutPage = () => {
  const [checkoutData, setCheckoutData] = useState(null)
  const [bankDetails, setBankDetails] = useState(null)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    address: "",
    state: "",
    city: "",
  })
  const [paymentForm, setPaymentForm] = useState({
    senderName: "",
    amountPaid: "",
    transferReference: "",
    bankName: "",
  })
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push(`/auth/signin?redirect=/checkout/manual`)
          return
        }

        setUser(user)
        setAuthLoading(false)

        const data = localStorage.getItem("manualCheckoutData")
        if (!data) {
          router.push("/cart")
          return
        }

        const parsedData = JSON.parse(data)
        parsedData.customerEmail = user.email
        setCheckoutData(parsedData)
        fetchBankDetails()
      } catch (error) {
        console.error("Auth error:", error)
        router.push(`/auth/signin?redirect=/checkout/manual`)
      }
    }

    checkAuth()
  }, [router])

  const fetchBankDetails = async () => {
    try {
      const response = await fetch("/api/bank-details")
      const data = await response.json()
      if (data.success) {
        setBankDetails(data.bankDetails)
      }
    } catch (error) {
      console.error("Error fetching bank details:", error)
    }
  }

  const handleCustomerFormChange = (field, value) => {
    setCustomerForm((prev) => ({ ...prev, [field]: value }))
  }

  const handlePaymentFormChange = (field, value) => {
    setPaymentForm((prev) => ({ ...prev, [field]: value }))
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Account details copied to clipboard.",
    })
  }

  const handleSubmitOrder = async () => {
    const requiredFields = ["name", "phone", "address", "state", "city"]
    const missingFields = requiredFields.filter((field) => !customerForm[field].trim())

    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required customer details.",
        variant: "destructive",
      })
      return
    }

    setShowPaymentForm(true)
  }

  const handleSubmitPayment = async () => {
    if (
      !paymentForm.senderName.trim() ||
      !paymentForm.amountPaid.trim() ||
      !paymentForm.transferReference.trim() ||
      !paymentForm.bankName.trim()
    ) {
      toast({
        title: "Missing Information",
        description: "Please provide sender name, amount paid, bank name, and transfer reference.",
        variant: "destructive",
      })
      return
    }

    const amountPaid = Number.parseFloat(paymentForm.amountPaid)
    if (isNaN(amountPaid) || amountPaid <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/orders/manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerDetails: {
            email: user.email,
            ...customerForm,
          },
          cartItems: checkoutData.items,
          totalAmount: checkoutData.totalAmount,
          paymentDetails: paymentForm,
        }),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.removeItem("manualCheckoutData")

        toast({
          title: "Order Submitted!",
          description: "Your order has been submitted for payment verification.",
        })

        router.push(`/checkout/manual/success?orderId=${data.orderId}`)
      } else {
        throw new Error(data.message || "Failed to submit order")
      }
    } catch (error) {
      console.error("Error submitting order:", error)
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="pt-16 min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!checkoutData) {
    return (
      <div className="pt-16 min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <Link href="/cart">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cart
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary">Manual Bank Transfer</h1>
            <p className="text-muted-foreground">Complete your order with bank transfer</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                  <Input value={user?.email || ""} disabled className="bg-muted" />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                    <Input
                      value={customerForm.name}
                      onChange={(e) => handleCustomerFormChange("name", e.target.value)}
                      placeholder="Enter your full name"
                      className="bg-card"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone Number *</label>
                    <Input
                      value={customerForm.phone}
                      onChange={(e) => handleCustomerFormChange("phone", e.target.value)}
                      placeholder="Enter your phone number"
                      className="bg-card"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Address *</label>
                  <Textarea
                    value={customerForm.address}
                    onChange={(e) => handleCustomerFormChange("address", e.target.value)}
                    placeholder="Enter your full address"
                    className="bg-card"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">State *</label>
                    <Input
                      value={customerForm.state}
                      onChange={(e) => handleCustomerFormChange("state", e.target.value)}
                      placeholder="Enter your state"
                      className="bg-card"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">City *</label>
                    <Input
                      value={customerForm.city}
                      onChange={(e) => handleCustomerFormChange("city", e.target.value)}
                      placeholder="Enter your city"
                      className="bg-card"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {bankDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Bank Transfer Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 p-4 bg-card rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Bank Name:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{bankDetails.bank_name}</span>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(bankDetails.bank_name)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Account Name:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{bankDetails.account_name}</span>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(bankDetails.account_name)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">{bankDetails.account_number}</span>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(bankDetails.account_number)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Amount to Transfer:</span>
                      <span className="font-bold text-lg text-primary">₦{checkoutData.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Instructions:</strong> Please transfer the exact amount to the account above and click "I
                      Have Paid" below to confirm your payment.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {showPaymentForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Payment Confirmation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Sender Name (Bank Account Name) *
                    </label>
                    <Input
                      value={paymentForm.senderName}
                      onChange={(e) => handlePaymentFormChange("senderName", e.target.value)}
                      placeholder="Name on the bank account used for transfer"
                      className="bg-card"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Bank Name *</label>
                    <Input
                      value={paymentForm.bankName}
                      onChange={(e) => handlePaymentFormChange("bankName", e.target.value)}
                      placeholder="Name of your bank (e.g., GTBank, Access Bank)"
                      className="bg-card"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Amount Paid *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={paymentForm.amountPaid}
                      onChange={(e) => handlePaymentFormChange("amountPaid", e.target.value)}
                      placeholder="Enter the amount you transferred"
                      className="bg-card"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Transfer Reference *</label>
                    <Input
                      value={paymentForm.transferReference}
                      onChange={(e) => handlePaymentFormChange("transferReference", e.target.value)}
                      placeholder="Transaction reference from your bank"
                      className="bg-card"
                    />
                  </div>

                  <Button
                    onClick={handleSubmitPayment}
                    disabled={loading}
                    className="w-full border bg-primary hover:bg-primary/90"
                  >
                    {loading ? "Submitting..." : "Submit Payment Confirmation"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-primary">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {checkoutData.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-card rounded-lg">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={item.image_url || "/placeholder.svg?height=48&width=48&query=skincare product"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">₦{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items ({checkoutData.totalItems})</span>
                    <span className="font-semibold">₦{checkoutData.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">₦{checkoutData.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {!showPaymentForm && (
                  <Button onClick={handleSubmitOrder} className="w-full mt-6 border bg-primary hover:bg-background">
                    I Have Paid
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManualCheckoutPage
