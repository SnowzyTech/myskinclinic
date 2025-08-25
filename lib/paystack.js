export const initializePayment = async (email, amount, reference, metadata = {}) => {
  try {
    if (!email || !amount || !reference) {
      throw new Error("Missing required payment parameters")
    }

    const response = await fetch("/api/payments/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Ensure amount is in kobo and is integer
        reference,
        metadata,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.details || data.error || "Failed to initialize payment")
    }

    return data
  } catch (error) {
    console.error("Payment initialization error:", error)
    throw error
  }
}

export const verifyPayment = async (reference) => {
  try {
    if (!reference) {
      throw new Error("Payment reference is required")
    }

    const response = await fetch(`/api/payments/verify/${reference}`)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.details || data.error || "Failed to verify payment")
    }

    return data
  } catch (error) {
    console.error("Payment verification error:", error)
    throw error
  }
}
