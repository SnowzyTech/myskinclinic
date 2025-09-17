import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    console.log("[v0] Custom auth attempt for:", email)

    // Query our custom admin table
    const { data: adminUser, error } = await supabase.from("admin_users").select("*").eq("email", email).single()

    if (error || !adminUser) {
      console.log("[v0] Admin user not found:", error)
      return Response.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password (for now, just check if it's "admin@123")
    const isValidPassword = password === "admin@123"

    if (!isValidPassword) {
      console.log("[v0] Invalid password")
      return Response.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("[v0] Authentication successful")

    const token = jwt.sign(
      {
        userId: adminUser.id,
        email: adminUser.email,
        role: "admin",
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    const cookieStore = await cookies()
    cookieStore.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    // Return success with user info
    return Response.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
      },
    })
  } catch (error) {
    console.error("[v0] Auth error:", error)
    return Response.json({ error: "Authentication failed" }, { status: 500 })
  }
}
