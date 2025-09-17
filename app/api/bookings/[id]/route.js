import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request, { params }) {
  try {
    const { id } = params
    console.log("[v0] Bookings API: Fetching booking with ID:", id)

    const { data, error } = await supabase.from("bookings").select("*").eq("id", id).single()

    if (error) {
      console.error("[v0] Bookings API: Error fetching booking:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, error: null })
  } catch (error) {
    console.error("[v0] Bookings API: Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    console.log("[v0] Bookings API: Updating booking", id, "with:", body)

    const { data, error } = await supabase.from("bookings").update(body).eq("id", id).select()

    if (error) {
      console.error("[v0] Bookings API: Error updating booking:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Bookings API: Successfully updated booking:", data[0])
    return NextResponse.json({ data: data[0], error: null })
  } catch (error) {
    console.error("[v0] Bookings API: Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    console.log("[v0] Bookings API: Deleting booking with ID:", id)

    const { error } = await supabase.from("bookings").delete().eq("id", id)

    if (error) {
      console.error("[v0] Bookings API: Error deleting booking:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Bookings API: Successfully deleted booking:", id)
    return NextResponse.json({ message: "Booking deleted successfully" })
  } catch (error) {
    console.error("[v0] Bookings API: Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
