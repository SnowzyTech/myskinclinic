import { createServerClient } from "@/lib/supabase"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// Helper to get Supabase client with service role key for server-side operations
const getSupabaseServiceRoleClient = () => {
  const cookieStore = cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
      set: (name, value, options) => cookieStore.set(name, value, options),
      remove: (name, options) => cookieStore.set(name, "", options),
    },
  })
}

export async function GET(request) {
  try {
    const supabase = getSupabaseServiceRoleClient() // Use service role client for GET as well for admin view
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get("includeInactive") === "true" // For admin to see all

    let query = supabase.from("job_listings").select("*")

    if (!includeInactive) {
      query = query.eq("is_active", true)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Database fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ jobListings: data }, { status: 200 })
  } catch (error) {
    console.error("Error fetching job listings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = getSupabaseServiceRoleClient() // Use service role client for POST

    const { title, type, location, requirements, is_active } = await request.json()

    if (!title || !type || !location || !requirements) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("job_listings")
      .insert([{ title, type, location, requirements, is_active }])
      .select()

    if (error) {
      console.error("Database insert error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Job listing created successfully", data: data[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating job listing:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const supabase = getSupabaseServiceRoleClient()
    const { id, title, type, location, requirements, is_active } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Job listing ID is required" }, { status: 400 })
    }

    if (!title || !type || !location || !requirements) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("job_listings")
      .update({ title, type, location, requirements, is_active })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Database update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Job listing not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Job listing updated successfully", data: data[0] }, { status: 200 })
  } catch (error) {
    console.error("Error updating job listing:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const supabase = getSupabaseServiceRoleClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Job listing ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase.from("job_listings").delete().eq("id", id).select()

    if (error) {
      console.error("Database delete error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Job listing not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Job listing deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting job listing:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
