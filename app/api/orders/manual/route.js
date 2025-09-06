import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request) {
  try {
    const { customerDetails, cartItems, totalAmount, paymentDetails } = await request.json()

    console.log("[v0] Payment details received:", paymentDetails)
    console.log("[v0] Bank name from request:", paymentDetails.bankName)

    // Validate required fields
    if (!customerDetails || !cartItems || !totalAmount || !paymentDetails) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Create the order
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_email: customerDetails.email,
        customer_name: customerDetails.name,
        customer_phone: customerDetails.phone,
        customer_address: customerDetails.address,
        customer_state: customerDetails.state,
        customer_city: customerDetails.city,
        total_amount: totalAmount.toFixed(2),
        payment_method: "manual",
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 })
    }

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: newOrder.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Error creating order items:", itemsError)
      // Don't fail the entire request, just log the error
    }

    // Create manual payment record
    const manualPaymentData = {
      order_id: newOrder.id,
      sender_name: paymentDetails.senderName,
      amount_paid: Number.parseFloat(paymentDetails.amountPaid),
      transfer_reference: paymentDetails.transferReference || null,
      bank_name: paymentDetails.bankName || null,
      payment_status: "pending",
      submitted_at: new Date().toISOString(),
    }

    console.log("[v0] Manual payment data to insert:", manualPaymentData)

    const { error: paymentError } = await supabase.from("manual_payments").insert(manualPaymentData)

    if (paymentError) {
      console.error("Error creating manual payment record:", paymentError)
      // Don't fail the entire request, just log the error
    } else {
      console.log("[v0] Manual payment record created successfully")
    }

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      message: "Order submitted successfully",
    })
  } catch (error) {
    console.error("Manual order creation error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
