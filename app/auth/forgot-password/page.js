"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let baseUrl = process.env.NEXT_PUBLIC_BASE_URL

      if (!baseUrl) {
        if (typeof window !== "undefined") {
          // In browser, use window.location.origin but replace localhost with production URL
          baseUrl = window.location.origin.includes("localhost")
            ? "https://myskinaestheticsclinic.com" // Replace with your actual domain
            : window.location.origin
        } else {
          // On server, use Vercel URL or fallback
          baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://myskinaestheticsclinic.com"
        }
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/auth/reset-password`,
      })

      if (error) throw error

      setSent(true)
      toast({
        title: "Reset Link Sent!",
        description: "Please check your email for the password reset link.",
      })
    } catch (error) {
      console.error("Reset password error:", error)
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="pt-16 min-h-screen bg-card flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-background border rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-primary">Check Your Email</CardTitle>
              <p className="text-gray-400">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">Didn't receive the email? Check your spam folder or try again.</p>
                <Button variant="outline" onClick={() => setSent(false)} className="w-full">
                  Try Again
                </Button>
                <Link href="/auth/signin" className="block">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-card flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-background border rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-primary">Reset Password</CardTitle>
            <p className="text-gray-400">Enter your email address and we'll send you a link to reset your password.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="email" className="flex items-center gap-1 text-gray-600 pb-2 pt-3">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  className="bg-card"
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full border bg-background hover:bg-background/100"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            <div className="text-center mt-6">
              <Link href="/auth/signin" className="text-sm text-primary hover:text-gray-600">
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
