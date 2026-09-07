import { Bot } from "lucide-react"

export function ChatEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4 pt-20 text-center opacity-50">
      <Bot className="h-16 w-16 text-muted-foreground/50" />
      <div className="space-y-1">
        <p className="text-lg font-medium">No messages yet</p>
        <p className="text-sm text-muted-foreground">
          Start a conversation to see the magic happen.
        </p>
      </div>
    </div>
  )
}
