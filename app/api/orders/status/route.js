import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json({ success: false, message: "Search query is required" }, { status: 400 })
    }

    // Search by order ID (partial match) or email
    let orderQuery = supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          products (
            name,
            image_url
          )
        )
      `,
      )
      .order("created_at", { ascending: false })

    // Check if query looks like an email or order ID
    if (query.includes("@")) {
      // Search by email
      orderQuery = orderQuery.eq("user_email", query)
    } else {
      // Search by order ID (partial match)
      orderQuery = orderQuery.ilike("id", `%${query}%`)
    }

    const { data: orders, error: orderError } = await orderQuery

    if (orderError) {
      console.error("Error fetching order:", orderError)
      return NextResponse.json({ success: false, message: "Failed to fetch order" }, { status: 500 })
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    // Get the most recent order if multiple found
    const order = orders[0]

    // If it's a manual payment, get payment details
    let paymentData = null
    if (order.payment_method === "manual") {
      const { data: payment, error: paymentError } = await supabase
        .from("manual_payments")
        .select("*")
        .eq("order_id", order.id)
        .single()

      if (!paymentError && payment) {
        paymentData = payment
      }
    }

    return NextResponse.json({
      success: true,
      order,
      payment: paymentData,
    })
  } catch (error) {
    console.error("Order status API error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
