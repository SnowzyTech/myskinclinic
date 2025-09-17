import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = cookies()

    // Clear the admin token cookie
    cookieStore.set("admin-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // Expire immediately
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return Response.json({ error: "Logout failed" }, { status: 500 })
  }
}
