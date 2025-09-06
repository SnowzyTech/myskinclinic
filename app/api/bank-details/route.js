import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase.from("bank_details").select("*").eq("is_active", true).single()

    if (error) {
      console.error("Error fetching bank details:", error)
      return NextResponse.json({ success: false, message: "Failed to fetch bank details" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      bankDetails: data,
    })
  } catch (error) {
    console.error("Bank details API error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
