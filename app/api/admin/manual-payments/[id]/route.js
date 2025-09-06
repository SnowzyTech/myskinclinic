import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { sendPaymentApprovalEmail, sendPaymentRejectionEmail } from "../../../../../lib/email-notification"

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const { status, notes, reviewedBy } = await request.json()

    console.log("[v0] Processing payment update for ID:", id, "Status:", status)

    // Update payment status in database
    const { error: paymentError } = await supabase
      .from("manual_payments")
      .update({
        payment_status: status,
        admin_notes: notes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewedBy || "admin",
      })
      .eq("id", id)

    if (paymentError) {
      console.error("[v0] Payment update error:", paymentError)
      throw paymentError
    }

    // Get payment details with order information for email
    const { data: paymentData, error: fetchError } = await supabase
      .from("manual_payments")
      .select(`
        *,
        orders (
          id,
          user_email,
          customer_name,
          customer_phone,
          customer_address,
          total_amount,
          order_items (
            quantity,
            price,
            products (name)
          )
        )
      `)
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("[v0] Fetch error:", fetchError)
      throw fetchError
    }

    // If approved, update order status to completed
    if (status === "approved" && paymentData.orders) {
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", paymentData.orders.id)

      if (orderError) {
        console.error("[v0] Order update error:", orderError)
        throw orderError
      }
    }

    // Send email notification
    try {
      const customerEmail = paymentData.customer_email || paymentData.orders?.user_email
      const customerName = paymentData.customer_name || paymentData.orders?.customer_name
      let orderData = paymentData.orders

      if (!orderData && customerEmail) {
        orderData = {
          id: paymentData.order_id,
          user_email: customerEmail,
          customer_name: customerName,
          total_amount: paymentData.amount_paid,
          order_items: [],
        }
      }

      if (!customerEmail) {
        console.log("[v0] No customer email found, skipping email notification")
        return NextResponse.json({
          success: true,
          message: `Payment ${status} successfully (email notification skipped - no customer email)`,
        })
      }

      if (status === "approved") {
        await sendPaymentApprovalEmail(orderData, paymentData)
      } else if (status === "rejected") {
        await sendPaymentRejectionEmail(orderData, paymentData, notes)
      }
    } catch (emailError) {
      console.error("[v0] Email sending failed:", emailError)
      // Don't fail the entire request if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Payment ${status} successfully and email sent`,
    })
  } catch (error) {
    console.error("[v0] Payment update error:", error)
    return NextResponse.json({ error: "Failed to update payment status" }, { status: 500 })
  }
}
