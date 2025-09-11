import { NextResponse } from "next/server"
import { sendContactFormEmail } from "@/lib/email-notification" // Import the email function

export async function POST(request) {
  try {
    const { name, email, phone, subject, message } = await request.json()

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const emailResult = await sendContactFormEmail({
      name,
      email,
      phone,
      subject,
      message,
    })

    if (!emailResult.success) {
      console.error("Failed to send contact email:", emailResult.message)
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully!",
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
