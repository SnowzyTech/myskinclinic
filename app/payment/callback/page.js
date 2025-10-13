"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader } from "lucide-react"
import { verifyPayment } from "@/lib/paystack"
import { useCart } from "@/contexts/cart-context"

const PaymentCallbackPage = () => {
  const [status, setStatus] = useState("loading") // loading, success, failed
  const [paymentData, setPaymentData] = useState(null)
  const [error, setError] = useState(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clearCart } = useCart()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const reference = searchParams.get("reference")
    const trxref = searchParams.get("trxref")
    const paystackReference = searchParams.get("paystack_reference")

    const paymentReference = reference || trxref || paystackReference

    console.log("[v0] URL search params:", {
      reference,
      trxref,
      paystackReference,
      allParams: Object.fromEntries(searchParams.entries()),
    })

    if (paymentReference) {
      console.log("[v0] Verifying payment with reference:", paymentReference)
      verifyPaymentStatus(paymentReference)
    } else {
      console.log("[v0] No payment reference found in URL")
      setStatus("failed")
      setError("Transaction reference not found.")
    }
  }, [searchParams])

  const verifyPaymentStatus = async (reference) => {
    try {
      console.log("[v0] Starting payment verification...")
      const data = await verifyPayment(reference)

      console.log("[v0] Payment verification response:", data)

      if (data.status && data.data?.status === "success") {
        setStatus("success")
        setPaymentData(data.data)
        clearCart() // Clear cart on successful payment
        console.log("[v0] Payment verified successfully, cart cleared")
      } else {
        setStatus("failed")
        setError(data.message || "Payment was not successful")
        console.log("[v0] Payment verification failed:", data.message)
      }
    } catch (error) {
      console.error("[v0] Payment verification error:", error)
      setStatus("failed")
      setError(error.message || "Failed to verify payment")
    }
  }

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Loader className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-semibold text-primary mb-2">Verifying Payment</h2>
              <p className="text-gray-600">Please wait while we confirm your payment...</p>
            </CardContent>
          </Card>
        )

      case "success":
        return (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-primary mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">Thank you for your purchase. Your order has been confirmed.</p>
              {paymentData && (
                <div className="bg-card p-4 rounded-lg mb-6 text-left">
                  <p className="text-sm text-gray-600">
                    <strong>Reference:</strong> {paymentData.reference}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Amount:</strong> ₦{(paymentData.amount / 100).toFixed(2)}
                  </p>
                  {paymentData.customer?.email && (
                    <p className="text-sm text-gray-600">
                      <strong>Email:</strong> {paymentData.customer.email}
                    </p>
                  )}
                </div>
              )}
              <div className="space-y-3">
                <Link href="/products">
                  <Button className="w-full bg-primary hover:bg-primary/90">Continue Shopping</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full bg-transparent">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )

      case "failed":
        return (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-primary mb-2">Payment Failed</h2>
              <p className="text-gray-600 mb-4">Unfortunately, your payment could not be processed.</p>
              {error && <p className="text-sm text-red-600 mb-6 bg-red-50 p-3 rounded">{error}</p>}
              <div className="space-y-3">
                <Link href="/cart">
                  <Button className="w-full bg-primary hover:bg-primary/90">Try Again</Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" className="w-full bg-transparent">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full mx-4">{renderContent()}</div>
    </div>
  )
}

export default PaymentCallbackPage
