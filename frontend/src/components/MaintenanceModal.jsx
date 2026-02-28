import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { maintenanceApi } from '@/services/api'
import { useToast } from '@/components/ui/toast'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Loader2, Wrench, ClipboardList, Calendar, User, FileText,
  ChevronRight, History
} from 'lucide-react'

const EMPTY_LOG = { maintenanceDate: '', performedBy: '', notes: '' }

export default function MaintenanceModal({ open, onOpenChange, equipment }) {
  const queryClient   = useQueryClient()
  const { addToast }  = useToast()
  const [tab, setTab] = useState('log')   // 'log' | 'history'
  const [form, setForm]     = useState(EMPTY_LOG)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')

  React.useEffect(() => {
    if (open) {
      setForm(EMPTY_LOG)
      setErrors({})
      setApiError('')
      setTab('log')
    }
  }, [open])

  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ['maintenance', equipment?.id],
    queryFn: () => maintenanceApi.getHistory(equipment.id),
    enabled: open && Boolean(equipment?.id) && tab === 'history',
  })

  const logMutation = useMutation({
    mutationFn: (data) => maintenanceApi.log(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      queryClient.invalidateQueries({ queryKey: ['maintenance', equipment.id] })
      addToast({
        type: 'success',
        title: 'Maintenance logged',
        message: `Maintenance recorded for ${equipment?.name}. Status updated to Active.`,
      })
      setForm(EMPTY_LOG)
      setTab('history')
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'Failed to log maintenance.'
      setApiError(msg)
    },
  })

  const validate = () => {
    const e = {}
    if (!form.maintenanceDate) e.maintenanceDate = 'Date is required'
    if (!form.performedBy.trim()) e.performedBy   = 'Performed by is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setApiError('')
    if (!validate()) return
    logMutation.mutate({
      equipmentId:     equipment.id,
      maintenanceDate: form.maintenanceDate,
      notes:           form.notes || null,
      performedBy:     form.performedBy.trim(),
    })
  }

  const field = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
    setApiError('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Wrench className="h-5 w-5 text-accent" />
            Maintenance — {equipment?.name}
          </DialogTitle>
          <DialogDescription>
            Log a maintenance event or view the full history.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface rounded-lg p-1 mb-5">
          {[
            { key: 'log',     label: 'Log Maintenance', icon: Wrench },
            { key: 'history', label: 'History',         icon: History },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                tab === key
                  ? 'bg-accent text-white shadow-glow'
                  : 'text-text-secondary hover:text-text-primary hover:bg-muted'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Log Form */}
        {tab === 'log' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {apiError && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm leading-relaxed">
                {apiError}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="m-date">Maintenance Date</Label>
              <Input
                id="m-date"
                type="date"
                value={form.maintenanceDate}
                onChange={e => field('maintenanceDate', e.target.value)}
              />
              {errors.maintenanceDate && (
                <p className="text-xs text-danger">{errors.maintenanceDate}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="m-by">Performed By</Label>
              <Input
                id="m-by"
                placeholder="e.g. John Smith / Team A"
                value={form.performedBy}
                onChange={e => field('performedBy', e.target.value)}
              />
              {errors.performedBy && (
                <p className="text-xs text-danger">{errors.performedBy}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="m-notes">
                Notes
                <span className="ml-1 text-text-muted normal-case tracking-normal font-normal">(optional)</span>
              </Label>
              <Textarea
                id="m-notes"
                placeholder="Describe what was done…"
                value={form.notes}
                onChange={e => field('notes', e.target.value)}
              />
            </div>

            <div className="p-3 rounded-lg bg-success/5 border border-success/20 text-xs text-success flex gap-2">
              <span className="mt-0.5">ℹ</span>
              <span>Logging maintenance will automatically set this equipment's status to <strong>Active</strong> and update the Last Cleaned Date.</span>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={logMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={logMutation.isPending}>
                {logMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                ) : (
                  <><ClipboardList className="h-4 w-4" /> Log Maintenance</>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* History Tab */}
        {tab === 'history' && (
          <div className="flex flex-col gap-3">
            {historyLoading ? (
              <div className="flex items-center justify-center py-10 gap-3 text-text-secondary">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading history…</span>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-10 w-10 text-text-muted mx-auto mb-3" />
                <p className="text-sm text-text-secondary">No maintenance records yet.</p>
                <button
                  onClick={() => setTab('log')}
                  className="text-xs text-accent hover:underline mt-1"
                >
                  Log the first one →
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
                {history.map((entry, i) => (
                  <div
                    key={entry.id}
                    className="relative pl-5 animate-fade-in"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    {/* Timeline line */}
                    {i < history.length - 1 && (
                      <div className="absolute left-[7px] top-6 bottom-0 w-px bg-border" />
                    )}
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-2 h-3.5 w-3.5 rounded-full bg-accent/20 border-2 border-accent" />

                    <div className="glass-card p-4 ml-2">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <Calendar className="h-3 w-3" />
                          <span className="font-mono">{entry.maintenanceDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-accent">
                          <User className="h-3 w-3" />
                          <span>{entry.performedBy}</span>
                        </div>
                      </div>
                      {entry.notes && (
                        <div className="flex gap-2 text-sm text-text-secondary">
                          <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5 text-text-muted" />
                          <p className="leading-relaxed">{entry.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
