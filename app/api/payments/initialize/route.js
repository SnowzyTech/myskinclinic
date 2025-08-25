import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { email, amount, reference, metadata } = await request.json()

    if (!email || !amount || !reference) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const enhancedMetadata = {
      ...metadata,
      // Ensure cart_items is included for order creation
      cart_items: metadata?.cart_items || [],
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount), // Ensure amount is an integer
        reference,
        metadata: enhancedMetadata,
        callback_url: `${baseUrl}/payment/callback`,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Paystack API error:", data)
      throw new Error(data.message || "Payment initialization failed")
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json(
      {
        error: "Payment initialization failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
