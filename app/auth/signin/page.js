"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Mail, Lock, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

const SignInPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast({
        title: "Welcome back!",
        description: "You have been successfully signed in.",
      })

      // Check if user is admin and redirect accordingly
      if (data.user && data.user.email === "admin@skinclinic.com") {
        router.push("/admin/dashboard")
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Sign in error:", error)
      toast({
        title: "Sign In Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-card flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-background border rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-primary">Welcome Back</CardTitle>
            <p className="text-gray-600">Sign in to your SkinClinic account</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="email" className="flex items-center gap-1  text-gray-600 pb-2 pt-3">
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

              <div>
                <Label htmlFor="password" className="flex items-center gap-1 text-gray-600 pb-2 pt-3">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                 className="bg-card"
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Button type="submit" size="lg" className="w-full border bg-background hover:bg-background/100" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="text-center">
              <p className="text-primary">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-primary border p-2 rounded-sm hover:text-gray-600 font-medium">
                  Sign up here
                </Link>
              </p>
            </div>

          
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SignInPage
