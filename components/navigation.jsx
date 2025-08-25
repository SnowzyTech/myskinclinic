'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, ShoppingCart, User, LogOut } from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
import { ThemeToggle } from '@/components/theme-toggle'
import { supabase } from '@/lib/supabase'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { items } = useCart()
  const pathname = usePathname()

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/treatments', label: 'Treatments' },
    { href: '/products', label: 'Products' },
    { href: '/booking', label: 'Book' },
    { href: '/contact', label: 'Contact' },
  ]

  const isActiveLink = (href) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-background backdrop-blur-md border-b border-border shadow-sm' 
        : 'bg-background backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src="/images/logo2.jpg"
                alt="MySkin Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
             <div className="flex flex-col pt-2">
                <span className="text-xs text-muted-foreground">AESTHETIC CLINICS</span>
                <span className="text-[7px] text-gray-400">Healthy skin more confident you are</span>
              </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 md:space-x-1 lg:space-x-5">
            {navLinks.map((link) => (
              <div key={link.href} className="relative">
                <Link
                  href={link.href}
                  className={`px-3 py-2 rounded-md font-medium transition-all duration-200 block ${
                    isActiveLink(link.href) 
                      ? 'text-[#c19a88] bg-[#3a3a3a] dark:bg-[#3a3a3a] light:bg-[#d4c4b0] light:text-[#8b4513]' 
                      : 'text-foreground hover:text-[#c19a88] hover:bg-[#2a2a2a] dark:hover:bg-[#2a2a2a] light:hover:bg-[#e6d7c8] light:hover:text-[#8b4513]'
                  }`}
                >
                  {link.label}
                </Link>
                {/* Active indicator underline */}
                {isActiveLink(link.href) && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c19a88] light:bg-[#8b4513] rounded-full" />
                )}
              </div>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <ThemeToggle />
            
            {/* User Authentication */}
            {loading ? (
              <div className="w-5 h-5 animate-pulse bg-muted rounded-full" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-foreground hover:text-[#c19a88] hover:bg-[#2a2a2a] dark:hover:bg-[#2a2a2a] light:hover:bg-[#e6d7c8] light:hover:text-[#8b4513] p-2 rounded-md transition-all duration-200">
                  <User className="h-5 w-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-medium text-foreground border-b border-border">
                    {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {user.email === "admin@skinclinic.com" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/auth/signin"
                className="text-foreground hover:text-[#c19a88] hover:bg-[#2a2a2a] dark:hover:bg-[#2a2a2a] light:hover:bg-[#e6d7c8] light:hover:text-[#8b4513] px-3 py-2 rounded-md transition-all duration-200"
              >
                Sign In
              </Link>
            )}

            <Link
              href="/cart"
              className="relative text-foreground hover:text-[#c19a88] hover:bg-[#2a2a2a] dark:hover:bg-[#2a2a2a] light:hover:bg-[#e6d7c8] light:hover:text-[#8b4513] p-2 rounded-md transition-all duration-200"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#c19a88] light:bg-[#8b4513] text-[#0a0a0a] light:text-[#f5f1eb] text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Link
              href="/cart"
              className="relative text-foreground hover:text-[#c19a88] light:hover:text-[#8b4513] transition-colors duration-200"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#c19a88] light:bg-[#8b4513] text-[#0a0a0a] light:text-[#f5f1eb] text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-[#c19a88] hover:bg-[#2a2a2a] dark:hover:bg-[#2a2a2a] light:hover:bg-[#e6d7c8] light:hover:text-[#8b4513] p-1 rounded-md transition-all duration-200"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-4 pb-3 space-y-5 bg-background/95 backdrop-blur-md border-t border-border h-[90vh]">
              {navLinks.map((link) => (
                <div key={link.href} className="relative">
                  <Link
                    href={link.href}
                    className={`block px-3 py-2 rounded-md transition-colors duration-200 ${
                      isActiveLink(link.href) 
                        ? 'text-[#c19a88] bg-[#3a3a3a] dark:bg-[#3a3a3a] light:bg-[#d4c4b0] light:text-[#8b4513] font-medium' 
                        : 'text-foreground hover:text-[#c19a88] hover:bg-[#2a2a2a] dark:hover:bg-[#2a2a2a] light:hover:bg-[#e6d7c8] light:hover:text-[#8b4513]'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                  {/* Mobile active indicator */}
                  {isActiveLink(link.href) && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#c19a88] light:bg-[#8b4513] rounded-r-full" />
                  )}
                </div>
              ))}
              
              {/* Mobile User Menu */}
              {loading ? (
                <div className="px-3 py-2">
                  <div className="w-20 h-4 animate-pulse bg-muted rounded" />
                </div>
              ) : user ? (
                <>
                  <div className="px-3 py-2 text-foreground font-medium border-t border-border">
                    {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                  </div>
                  
                  {user.email === "admin@skinclinic.com" && (
                    <Link
                      href="/admin/dashboard"
                      className="block px-3 py-2 text-foreground hover:text-[#c19a88] hover:bg-[#2a2a2a] dark:hover:bg-[#2a2a2a] light:hover:bg-[#e6d7c8] light:hover:text-[#8b4513] rounded-md transition-colors duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="block px-3 py-2 text-foreground hover:text-[#c19a88] hover:bg-[#2a2a2a] dark:hover:bg-[#2a2a2a] light:hover:bg-[#e6d7c8] light:hover:text-[#8b4513] rounded-md transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
