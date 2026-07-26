export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen grid place-items-center bg-surface">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-10 w-10 rounded-full border-4 border-hairline/20 border-t-coral animate-spin" aria-hidden="true" />
        <p className="text-sm text-muted">{message}</p>
      </div>
    </div>
  )
}
