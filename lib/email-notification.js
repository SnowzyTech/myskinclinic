import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendPaymentApprovalEmail = async (orderData, paymentData) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "MySkin Aesthetics <onboarding@resend.dev>",
      reply_to: "myskinaestheticsclinic@gmail.com",
      to: [orderData.user_email],
      subject: "Payment Approved - Order Confirmed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Payment Approved!</h2>
          <p>Dear ${orderData.customer_name || "Customer"},</p>
          
          <p>Great news! Your payment has been verified and approved. Your order is now being processed.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> #${orderData.id.slice(-8)}</p>
            <p><strong>Total Amount:</strong> ₦${orderData.total_amount}</p>
            <p><strong>Payment Method:</strong> Bank Transfer</p>
            <p><strong>Status:</strong> Confirmed</p>
          </div>
          
          <p>Your order will be processed and shipped within 2-3 business days.</p>
          
          <p>Thank you for choosing MySkin Aesthetics!</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message from MySkin Aesthetics. Please reply to myskinaestheticsclinic@gmail.com for any questions.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      return { success: false, message: "Failed to send email" }
    }

    return { success: true, message: "Email sent successfully", data }
  } catch (error) {
    console.error("Email sending error:", error)
    return { success: false, message: "Failed to send email" }
  }
}

export const sendPaymentRejectionEmail = async (orderData, paymentData, reason = "") => {
  try {
    const { data, error } = await resend.emails.send({
      from: "MySkin Aesthetics <onboarding@resend.dev>",
      reply_to: "myskinaestheticsclinic@gmail.com",
      to: [orderData.user_email],
      subject: "Payment Verification Issue - Action Required",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Payment Verification Issue</h2>
          <p>Dear ${orderData.customer_name || "Customer"},</p>
          
          <p>We were unable to verify your bank transfer payment for the following order:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> #${orderData.id.slice(-8)}</p>
            <p><strong>Total Amount:</strong> ₦${orderData.total_amount}</p>
            <p><strong>Payment Method:</strong> Bank Transfer</p>
          </div>
          
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          
          <p>Please contact our customer support team or try submitting your payment details again. Make sure to:</p>
          <ul>
            <li>Transfer the exact amount shown</li>
            <li>Use the correct bank account details</li>
            <li>Provide the correct sender name and reference</li>
          </ul>
          
          <p>We apologize for any inconvenience and are here to help resolve this quickly.</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message from MySkin Aesthetics. Please reply to myskinaestheticsclinic@gmail.com for assistance.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      return { success: false, message: "Failed to send email" }
    }

    return { success: true, message: "Email sent successfully", data }
  } catch (error) {
    console.error("Email sending error:", error)
    return { success: false, message: "Failed to send email" }
  }
}

export const sendOrderStatusUpdateEmail = async (orderData, newStatus) => {
  try {
    const statusMessages = {
      completed: "Your order has been confirmed and is being prepared for shipment.",
      shipped: "Your order has been shipped and is on its way to you!",
      cancelled: "Your order has been cancelled. If you have any questions, please contact our support team.",
    }

    const { data, error } = await resend.emails.send({
      from: "MySkin Aesthetics <onboarding@resend.dev>",
      reply_to: "myskinaestheticsclinic@gmail.com",
      to: [orderData.user_email],
      subject: `Order Update - ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Order Status Update</h2>
          <p>Dear ${orderData.customer_name || "Customer"},</p>
          
          <p>${statusMessages[newStatus] || `Your order status has been updated to ${newStatus}.`}</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> #${orderData.id.slice(-8)}</p>
            <p><strong>Status:</strong> ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</p>
            <p><strong>Total Amount:</strong> ₦${orderData.total_amount}</p>
          </div>
          
          <p>Thank you for choosing MySkin Aesthetics!</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message from MySkin Aesthetics. Please reply to myskinaestheticsclinic@gmail.com for any questions.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      return { success: false, message: "Failed to send email" }
    }

    return { success: true, message: "Email sent successfully", data }
  } catch (error) {
    console.error("Email sending error:", error)
    return { success: false, message: "Failed to send email" }
  }
}
