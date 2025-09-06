"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  Menu,
  X,
  LogOut,
  Home,
  Package,
  Calendar,
  FileText,
  Users,
  Stethoscope,
  PenTool,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

const AdminNavigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/admin")
        return
      }
      setUser(user)
    }
    checkUser()
  }, [router])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
      router.push("/admin")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const adminNavItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <Home className="w-4 h-4" /> },
    { name: "Products", href: "/admin/products", icon: <Package className="w-4 h-4" /> },
    { name: "Bookings", href: "/admin/bookings", icon: <Calendar className="w-4 h-4" /> },
    { name: "Applications", href: "/admin/applications", icon: <Users className="w-4 h-4" /> },
    { name: "Treatments", href: "/admin/treatments", icon: <Stethoscope className="w-4 h-4" /> },
    { name: "Orders", href: "/admin/orders", icon: <FileText className="w-4 h-4" /> },
    { name: "Manual Payments", href: "/admin/manual-payments", icon: <CreditCard className="w-4 h-4" /> },
    { name: "Blog", href: "/admin/blog", icon: <PenTool className="w-4 h-4" /> },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center space-x-3">
            <div className="relative w-10 h-10">
              <Image src="/images/logo2.jpg" alt="MySkin Admin" fill className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="lg:text-[10px] text-[12px] md:text-[9px] text-muted-foreground">MANAGEMENT PANEL</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-0 lg:space-x-0">
            {adminNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-1 text-[10px] font-medium transition-all duration-200 hover:bg-primary/10 px-3 py-2 rounded-md ${
                  pathname === item.href ? "text-primary bg-primary/10" : "text-foreground"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden lg:flex items-center lg:items-end space-x-4 lg:space-x-1">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                View Site
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-foreground hover:text-primary transition-colors">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden bg-card border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {adminNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 text-base font-medium transition-all duration-200 hover:bg-primary/10 rounded-md ${
                    pathname === item.href ? "text-primary bg-primary/10" : "text-foreground"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}

              <div className="px-3 py-2 space-y-2 border-t border-border mt-2">
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Button variant="outline" size="sm" onClick={handleLogout} className="w-full bg-transparent">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Home className="w-4 h-4 mr-2" />
                    View Site
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default AdminNavigation
