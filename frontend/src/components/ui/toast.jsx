import * as React from 'react'
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastContext = React.createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([])

  const addToast = React.useCallback((toast) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, ...toast }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border shadow-card animate-slide-up',
              toast.type === 'success' && 'bg-card border-success/30',
              toast.type === 'error'   && 'bg-card border-danger/30',
              toast.type === 'warning' && 'bg-card border-warning/30',
            )}
          >
            {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />}
            {toast.type === 'error'   && <XCircle     className="h-5 w-5 text-danger  shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
              {toast.title && <p className="text-sm font-semibold text-text-primary">{toast.title}</p>}
              {toast.message && <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{toast.message}</p>}
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-text-muted hover:text-text-primary shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
