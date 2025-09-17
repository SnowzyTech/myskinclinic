import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("[v0] Bookings API: Fetching all bookings...")

    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Bookings API: Error fetching bookings:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Bookings API: Successfully fetched", data?.length || 0, "bookings")
    return NextResponse.json({ data, error: null })
  } catch (error) {
    console.error("[v0] Bookings API: Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    console.log("[v0] Bookings API: Creating new booking:", body)

    const { data, error } = await supabase.from("bookings").insert([body]).select()

    if (error) {
      console.error("[v0] Bookings API: Error creating booking:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Bookings API: Successfully created booking:", data[0])
    return NextResponse.json({ data: data[0], error: null })
  } catch (error) {
    console.error("[v0] Bookings API: Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
