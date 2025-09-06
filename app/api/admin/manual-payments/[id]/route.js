

import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { sendPaymentApprovalEmail, sendPaymentRejectionEmail } from "../../../../../lib/email-notification"



// import { sendPaymentApprovalEmail, sendPaymentRejectionEmail } from "@/lib/email-notifications"

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

    console.log("[v0] Payment data retrieved:", {
      hasOrder: !!paymentData.orders,
      customerEmail: paymentData.orders?.user_email,
      customerName: paymentData.orders?.customer_name,
    })

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
      const customerEmail = paymentData.orders?.user_email

      if (!customerEmail || typeof customerEmail !== "string") {
        console.error("[v0] Invalid email address:", customerEmail)
        throw new Error("Customer email not found or invalid")
      }

      console.log("[v0] Sending email to:", customerEmail)

      if (status === "approved") {
        const result = await sendPaymentApprovalEmail(paymentData.orders, paymentData)
        console.log("[v0] Approval email result:", result)
      } else if (status === "rejected") {
        const result = await sendPaymentRejectionEmail(paymentData.orders, paymentData, notes)
        console.log("[v0] Rejection email result:", result)
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
