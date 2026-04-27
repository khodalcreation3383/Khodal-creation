export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-10 h-10' }
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div
        className={`${sizes[size]} border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin`}
      />
      {text && <p className="text-sm text-gray-400">{text}</p>}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" text="Loading…" />
    </div>
  )
}
