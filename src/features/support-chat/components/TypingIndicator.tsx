export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" />
      </div>
      <span className="text-sm text-sky-600">El asistente está escribiendo...</span>
    </div>
  )
}
