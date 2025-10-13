import ClientLayout from "./clientLayout"

export const metadata = {
  title: "MySkin Aesthetics",
  description: "Professional skincare and aesthetic treatments",
  generator: "MySkin Aesthetics",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://myskinaestheticsclinic.com"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.jpg", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.jpg", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.jpg", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "MySkin Aesthetics",
    description: "Professional skincare and aesthetic treatments",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://myskinaestheticsclinic.com",
    siteName: "MySkin Aesthetics",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MySkin Aesthetics",
    description: "Professional skincare and aesthetic treatments",
  },
}

export default function RootLayout({ children }) {
  return <ClientLayout>{children}</ClientLayout>
}
