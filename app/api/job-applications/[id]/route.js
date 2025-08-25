import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function PATCH(request, { params }) {
  try {
    const supabase = createServerClient()
    const { status } = await request.json()
    const { id } = params

    const { data, error } = await supabase
      .from("job_applications")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error updating application:", error)
      return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
    }

    return NextResponse.json({ message: "Application updated successfully", data }, { status: 200 })
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
