import AdminNavigation from "@/components/admin-navigation"

export default function Loading() {
  return (
    <>
      <AdminNavigation />
      <div className="pt-16 min-h-screen flex items-center justify-center bg-card">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading pricelist requests...</p>
        </div>
      </div>
    </>
  )
}
