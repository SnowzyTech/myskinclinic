"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Lock, User } from "lucide-react"

const AdminLoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const authChecked = useRef(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authChecked.current && !isRedirecting) {
      authChecked.current = true
      checkAuth()
    }
  }, [isRedirecting])

  const checkAuth = async () => {
    try {
      console.log("[v0] Admin page: Checking authentication...")
      const response = await fetch("/api/verify-admin")
      console.log("[v0] Admin page: Auth response status:", response.status)

      if (response.ok) {
        const { authenticated } = await response.json()
        console.log("[v0] Admin page: Authenticated:", authenticated)

        if (authenticated && !isRedirecting) {
          console.log("[v0] Admin page: Redirecting to dashboard...")
          setIsRedirecting(true)
          router.replace("/admin/dashboard")
          return
        }
      }
    } catch (error) {
      console.log("[v0] Auth check failed:", error)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("[v0] Attempting secure auth login with email:", email)

      const response = await fetch("/api/custom-admin-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      })

      const result = await response.json()
      console.log("[v0] Secure auth response:", result)

      if (!response.ok) {
        throw new Error(result.error || "Authentication failed")
      }

      if (result.success && result.user.email === "info@myskinaestheticsclinic.com") {
        toast({
          title: "Login Successful",
          description: "Welcome to the admin dashboard.",
        })

        console.log("[v0] Login successful, redirecting to dashboard...")
        setIsRedirecting(true)
        router.replace("/admin/dashboard")
      } else {
        throw new Error("Access denied. Admin privileges required.")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (isRedirecting) {
    return (
      <div className="pt-16 min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-background border rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-primary">Admin Login</CardTitle>
            <p className="text-gray-600">Access the SkinClinic admin dashboard</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@myskinaestheticsclinic.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Button type="submit" size="lg" className="w-full border bg-background hover:bg-card" disabled={loading}>
                <User className="w-5 h-5 mr-2" />
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminLoginPage
