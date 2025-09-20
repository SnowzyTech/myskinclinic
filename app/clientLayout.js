"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { CartProvider } from "@/contexts/cart-context"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({ children }) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith("/admin")

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="prefetch" href="/about" />
        <link rel="prefetch" href="/treatments" />
        <link rel="prefetch" href="/products" />
        <link rel="prefetch" href="/booking" />
        <link rel="prefetch" href="/contact" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
          <CartProvider>
            {!isAdminPage && <Navigation />}
            <main className={isAdminPage ? "min-h-screen" : "min-h-screen"}>{children}</main>
            {!isAdminPage && <Footer />}
            <Toaster />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
