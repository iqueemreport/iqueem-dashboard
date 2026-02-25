import { Component, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-6 bg-background">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground text-center max-w-md">
            Bir hata oluştu. Sayfayı yenilemeyi deneyin.
          </p>
          {import.meta.env.DEV && (
            <p className="text-xs text-muted-foreground text-center max-w-lg font-mono break-all">
              {this.state.error.message}
            </p>
          )}
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Sayfayı Yenile
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
