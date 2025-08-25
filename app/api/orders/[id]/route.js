import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    // First delete order items
    const { error: itemsError } = await supabase.from("order_items").delete().eq("order_id", id)

    if (itemsError) {
      console.error("Error deleting order items:", itemsError)
      return NextResponse.json({ error: "Failed to delete order items" }, { status: 500 })
    }

    // Then delete the order
    const { error: orderError } = await supabase.from("orders").delete().eq("id", id)

    if (orderError) {
      console.error("Error deleting order:", orderError)
      return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
