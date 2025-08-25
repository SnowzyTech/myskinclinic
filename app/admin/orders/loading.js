export default function Loading() {
  return (
    <div className="pt-16 min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading orders...</p>
      </div>
    </div>
  )
}
