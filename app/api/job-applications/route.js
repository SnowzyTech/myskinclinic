import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const supabase = createServerClient()
    const formData = await request.formData()

    // Extract form data using the correct keys from the client-side FormData
    const position = formData.get("position")
    const positionType = formData.get("position_type") // Corrected key
    const location = formData.get("location")
    const fullName = formData.get("full_name") // Corrected key
    const email = formData.get("email")
    const phone = formData.get("phone")
    const coverLetter = formData.get("cover_letter") // Corrected key
    const cvFile = formData.get("cv") // Corrected key

    let cvUrl = null

    // Upload CV file to Supabase Storage if provided
    if (cvFile && cvFile.size > 0) {
      const fileName = `${Date.now()}-${cvFile.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("job-applications")
        .upload(`cvs/${fileName}`, cvFile, {
          contentType: cvFile.type,
          upsert: false,
        })

      if (uploadError) {
        console.error("Error uploading CV:", uploadError)
        return NextResponse.json({ error: "Failed to upload CV file" }, { status: 500 })
      }

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage.from("job-applications").getPublicUrl(uploadData.path)

      cvUrl = urlData.publicUrl
    }

    // Insert application data into database
    const { data, error } = await supabase
      .from("job_applications")
      .insert([
        {
          position,
          position_type: positionType,
          location,
          full_name: fullName,
          email,
          phone,
          cover_letter: coverLetter,
          cv_url: cvUrl,
          status: "pending",
          applied_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Error inserting application:", error)
      return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
    }

    return NextResponse.json({ message: "Application submitted successfully", data }, { status: 200 })
  } catch (error) {
    console.error("Error processing application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .order("applied_at", { ascending: false })

    if (error) {
      console.error("Error fetching applications:", error)
      return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
    }

    return NextResponse.json({ applications: data }, { status: 200 })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
