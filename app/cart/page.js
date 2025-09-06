"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, Building2 } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { initializePayment } from "@/lib/paystack"
import { useToast } from "@/hooks/use-toast"

const CartPage = () => {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems } = useCart()
  const [customerEmail, setCustomerEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("paystack")
  const { toast } = useToast()

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity)
  }

  const handleRemoveItem = (productId) => {
    removeItem(productId)
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart.",
    })
  }

  const handleCheckout = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!customerEmail || !emailRegex.test(customerEmail)) {
      toast({
        title: "Valid email required",
        description: "Please enter a valid email address to proceed.",
        variant: "destructive",
      })
      return
    }

    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some products to your cart before checking out.",
        variant: "destructive",
      })
      return
    }

    if (paymentMethod === "manual") {
      localStorage.setItem(
        "manualCheckoutData",
        JSON.stringify({
          items,
          customerEmail,
          totalAmount: getTotalPrice(),
          totalItems: getTotalItems(),
        }),
      )

      window.location.href = "/checkout/manual"
      return
    }

    setLoading(true)

    try {
      const reference = `myskin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const totalAmount = getTotalPrice()

      console.log("[v0] Initializing payment with:", {
        email: customerEmail,
        amount: totalAmount,
        reference,
        itemCount: items.length,
      })

      const paymentData = await initializePayment(customerEmail, totalAmount, reference, {
        cart_items: items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        customer_email: customerEmail,
        total_items: getTotalItems(),
      })

      console.log("[v0] Payment initialization response:", paymentData)

      if (paymentData.status && paymentData.data?.authorization_url) {
        toast({
          title: "Redirecting to payment",
          description: "You will be redirected to complete your payment.",
        })

        setTimeout(() => {
          window.location.href = paymentData.data.authorization_url
        }, 1000)
      } else {
        throw new Error(paymentData.message || "Failed to initialize payment")
      }
    } catch (error) {
      console.error("[v0] Payment initialization error:", error)
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="pt-16 min-h-screen bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-primary mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added any products to your cart yet.</p>
            <Link href="/products">
              <Button size="lg" className="bg-background border hover:bg-card">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-background overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-primary mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3">
                    <div className="relative w-full h-32 md:w-20 md:h-20 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={item.image_url || "/placeholder.svg?height=80&width=80&query=skincare product"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-sm md:text-lg font-semibold text-primary">{item.name}</h3>
                      <p className="text-gray-600 text-xs md:text-sm line-clamp-2">{item.description}</p>
                      <p className="text-primary font-semibold mt-1">₦{item.price}</p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end md:space-x-4">
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="px-3 py-1 text-center min-w-[3rem] text-primary">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-primary hover:text-primary/100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-primary mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({getTotalItems()})</span>
                    <span className="font-semibold">₦{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">₦{getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      className="bg-card"
                      placeholder="your@email.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method *</label>
                    <div className="space-y-2">
                      {/* <div
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === "paystack"
                            ? "border-primary bg-primary/5"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        onClick={() => setPaymentMethod("paystack")}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="paystack"
                            checked={paymentMethod === "paystack"}
                            onChange={() => setPaymentMethod("paystack")}
                            className="text-primary"
                          />
                          <CreditCard className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium text-primary">Online Payment</p>
                            <p className="text-sm text-gray-600">Pay with card, bank transfer, or USSD</p>
                          </div>
                        </div>
                      </div> */}

                      <div
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === "manual"
                            ? "border-primary bg-primary/5"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        onClick={() => setPaymentMethod("manual")}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="manual"
                            checked={paymentMethod === "manual"}
                            onChange={() => setPaymentMethod("manual")}
                            className="text-primary"
                          />
                          <Building2 className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium text-primary">Bank Transfer</p>
                            <p className="text-sm text-primary-foreground">Manual bank transfer with confirmation</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-background hover:bg-card border"
                    onClick={handleCheckout}
                    disabled={loading}
                  >
                    {loading
                      ? "Processing..."
                      : paymentMethod === "manual"
                        ? "Continue to Bank Transfer"
                        : "Proceed to Checkout"}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full  text-primary bg-transparent"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                </div>

                <div className="mt-6 text-center">
                  <Link href="/products" className="text-primary hover:text-primary/10 text-sm">
                    ← Continue Shopping
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
