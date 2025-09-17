// import { createClient } from "@supabase/supabase-js"
// import { NextResponse } from "next/server"

// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// export async function POST(request) {
//   try {
//     const { email, password } = await request.json()

//     console.log("[v0] Server-side auth attempt for:", email)

//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     })

//     if (error) {
//       console.log("[v0] Auth error:", error)
//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
//     }

//     if (data.user) {
//       console.log("[v0] Login successful for:", email)
//       return NextResponse.json({
//         success: true,
//         user: data.user,
//         session: data.session,
//       })
//     }

//     return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
//   } catch (error) {
//     console.error("[v0] Server auth error:", error)
//     return NextResponse.json({ error: "Database error checking email" }, { status: 500 })
//   }
// }
