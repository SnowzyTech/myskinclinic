import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export async function GET() {
  try {
    console.log("[v0] Verify-admin API called")
    const cookieStore = await cookies()
    const token = cookieStore.get("admin-token")

    console.log("[v0] Token found:", !!token)

    if (!token) {
      console.log("[v0] No admin-token cookie found")
      return Response.json({ authenticated: false }, { status: 401 })
    }

    console.log("[v0] Verifying JWT token...")
    // Verify JWT token
    const decoded = jwt.verify(token.value, JWT_SECRET)
    console.log("[v0] Token verified successfully for user:", decoded.email)

    return Response.json({
      authenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
    })
  } catch (error) {
    console.error("[v0] Token verification failed:", error.message)
    return Response.json({ authenticated: false }, { status: 401 })
  }
}
