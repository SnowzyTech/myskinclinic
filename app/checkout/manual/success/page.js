"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Clock, Home, Package } from "lucide-react"

const ManualPaymentSuccessPage = () => {
  const [orderData, setOrderData] = useState(null)
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  useEffect(() => {
    if (orderId) {
      fetchOrderData(orderId)
    }
  }, [orderId])

  const fetchOrderData = async (id) => {
    try {
      const response = await fetch(`/api/orders/${id}`)
      const data = await response.json()
      if (data.success) {
        setOrderData(data.order)
      }
    } catch (error) {
      console.error("Error fetching order data:", error)
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-primary mb-2">Order Submitted Successfully!</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for your order. We have received your payment details and will verify your transfer shortly.
            </p>

            {orderData && (
              <div className="bg-card p-4 rounded-lg mb-6 text-left">
                <p className="text-sm text-muted-foreground">
                  <strong>Order ID:</strong> #{orderData.id.slice(-8)}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Total Amount:</strong> ₦{orderData.total_amount}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Status:</strong> Pending Verification
                </p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <p className="font-medium text-yellow-800">What happens next?</p>
              </div>
              <ul className="text-sm text-yellow-700 text-left space-y-1">
                <li>• Our team will verify your bank transfer</li>
                <li>• You'll receive an email confirmation once approved</li>
                <li>• Your order will then be processed for delivery</li>
                
              </ul>
            </div>

            <div className="space-y-3">
              <Link href="/products">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  <Package className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full bg-transparent">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ManualPaymentSuccessPage
