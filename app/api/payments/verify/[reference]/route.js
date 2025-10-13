import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request, { params }) {
  try {
    const { reference } = params

    if (!reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 })
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Paystack verification error:", data)
      throw new Error(data.message || "Payment verification failed")
    }

    if (data.status && data.data.status === "success") {
      console.log(`Payment verified successfully for reference: ${reference}`)

      try {
        // Check if order already exists to prevent duplicates
        const { data: existingOrder } = await supabase
          .from("orders")
          .select("id")
          .eq("paystack_reference", reference)
          .single()

        if (!existingOrder) {
          // Extract cart items and customer info from payment metadata
          const cartItems = data.data.metadata?.cart_items || []
          const customerInfo = data.data.metadata?.customer_info || {}
          const userEmail = data.data.customer.email

          const { data: newOrder, error: orderError } = await supabase
            .from("orders")
            .insert({
              user_email: userEmail,
              total_amount: (data.data.amount / 100).toFixed(2), // Convert from kobo to naira
              status: "completed",
              paystack_reference: reference,
              shipping_address: {
                name: customerInfo.name || "",
                phone: customerInfo.phone || "",
                address: customerInfo.address || "",
                city: customerInfo.city || "",
                state: customerInfo.state || "",
                email: customerInfo.email || userEmail,
              },
              created_at: new Date().toISOString(),
            })
            .select()
            .single()

          if (orderError) {
            console.error("Error creating order:", orderError)
          } else {
            console.log("Order created successfully:", newOrder.id)

            // Create order items
            if (cartItems.length > 0 && newOrder) {
              const orderItems = cartItems.map((item) => ({
                order_id: newOrder.id,
                product_id: item.id,
                quantity: item.quantity,
                price: item.price,
              }))

              const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

              if (itemsError) {
                console.error("Error creating order items:", itemsError)
              } else {
                console.log("Order items created successfully")
              }
            }
          }
        } else {
          console.log("Order already exists for reference:", reference)
        }
      } catch (dbError) {
        console.error("Database error during order creation:", dbError)
        // Don't fail the payment verification if database update fails
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      {
        error: "Payment verification failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
