import ClientLayout from "./clientLayout"

export const metadata = {
  title: "MySkin Aesthetics",
  description: "Professional skincare and aesthetic treatments",
  generator: "MySkin Aesthetics",
}

export default function RootLayout({ children }) {
  return <ClientLayout>{children}</ClientLayout>
}
