import React, { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { equipmentApi } from '@/services/api'
import EquipmentForm       from '@/components/EquipmentForm'
import MaintenanceModal    from '@/components/MaintenanceModal'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input  } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  PlusCircle, Search, Wrench, Pencil, Trash2,
  ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown,
  Activity, AlertCircle, Settings2, Loader2, ServerCrash
} from 'lucide-react'

const STATUS_FILTERS = ['All', 'Active', 'Inactive', 'Under Maintenance']

function StatusBadge({ status }) {
  const cls = {
    'Active':           'status-active',
    'Inactive':         'status-inactive',
    'Under Maintenance':'status-maintenance',
  }[status] || 'status-inactive'

  const dot = {
    'Active':           'bg-success',
    'Inactive':         'bg-text-muted',
    'Under Maintenance':'bg-warning',
  }[status] || 'bg-text-muted'

  return (
    <span className={`status-badge ${cls}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  )
}

function SortIcon({ field, sortBy, sortDir }) {
  if (sortBy !== field) return <ChevronsUpDown className="h-3.5 w-3.5 text-text-muted" />
  return sortDir === 'asc'
    ? <ChevronUp   className="h-3.5 w-3.5 text-accent" />
    : <ChevronDown className="h-3.5 w-3.5 text-accent" />
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="glass-card p-4 flex items-center gap-4">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-text-primary">{value}</p>
        <p className="text-xs text-text-secondary">{label}</p>
      </div>
    </div>
  )
}

export default function EquipmentPage() {
  // ── Filters & pagination state ──────────────────────────
  const [search,  setSearch]  = useState('')
  const [status,  setStatus]  = useState('All')
  const [page,    setPage]    = useState(0)
  const [sortBy,  setSortBy]  = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')

  // ── Modal state ──────────────────────────────────────────
  const [addOpen,     setAddOpen]     = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)
  const [maintTarget, setMaintTarget] = useState(null)
  const [deleteTarget,setDeleteTarget]= useState(null)

  // ── Data fetching ────────────────────────────────────────
  const queryParams = {
    search:  search  || undefined,
    status:  status !== 'All' ? status : undefined,
    page,
    size: 10,
    sortBy,
    sortDir,
  }

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['equipment', queryParams],
    queryFn:  () => equipmentApi.getAll(queryParams),
    keepPreviousData: true,
  })

  const equipment    = data?.content      || []
  const totalPages   = data?.totalPages   || 0
  const totalElements= data?.totalElements|| 0

  // ── Sort toggle ──────────────────────────────────────────
  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
    setPage(0)
  }, [sortBy])

  // ── Stats (computed from current full result) ────────────
  const activeCount  = equipment.filter(e => e.status === 'Active').length
  const maintCount   = equipment.filter(e => e.status === 'Under Maintenance').length
  const inactiveCount= equipment.filter(e => e.status === 'Inactive').length

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* ── Header ──────────────────────────────────────── */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center shadow-glow">
              <Settings2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-text-primary tracking-tight">
              EquipTrack
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isFetching && !isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
            )}
            <Button onClick={() => setAddOpen(true)} size="sm">
              <PlusCircle className="h-4 w-4" />
              Add Equipment
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* ── Page title ──────────────────────────────── */}
        <div className="animate-fade-in">
          <h1 className="font-display text-3xl font-bold text-text-primary">
            Equipment Management
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            Track, maintain, and manage all your equipment in one place.
          </p>
        </div>

        {/* ── Stats row ───────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
          <StatCard icon={Activity}   label="Total Equipment"  value={totalElements} color="bg-accent/10 text-accent" />
          <StatCard icon={Activity}   label="Active"           value={activeCount}   color="bg-success/10 text-success" />
          <StatCard icon={Wrench}     label="Under Maintenance"value={maintCount}    color="bg-warning/10 text-warning" />
          <StatCard icon={AlertCircle}label="Inactive"         value={inactiveCount} color="bg-text-muted/10 text-text-secondary" />
        </div>

        {/* ── Filters ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 animate-slide-up">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
            <Input
              placeholder="Search equipment…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onValueChange={v => { setStatus(v); setPage(0) }}
          >
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map(s => (
                <SelectItem key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ── Table ───────────────────────────────────── */}
        <div className="glass-card overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {[
                    { label: 'Name',       field: 'name'           },
                    { label: 'Type',       field: 'typeName'       },
                    { label: 'Status',     field: 'status'         },
                    { label: 'Last Cleaned',field:'lastCleanedDate'},
                  ].map(col => (
                    <th
                      key={col.field}
                      onClick={() => handleSort(col.field)}
                      className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-widest cursor-pointer select-none hover:text-text-primary transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        {col.label}
                        <SortIcon field={col.field} sortBy={sortBy} sortDir={sortDir} />
                      </span>
                    </th>
                  ))}
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-3" />
                      <p className="text-sm text-text-secondary">Loading equipment…</p>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={5} className="text-center py-20">
                      <ServerCrash className="h-10 w-10 text-danger mx-auto mb-3" />
                      <p className="text-sm text-text-secondary">Could not connect to the server.</p>
                      <p className="text-xs text-text-muted mt-1">Make sure the backend is running on port 8080.</p>
                    </td>
                  </tr>
                ) : equipment.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-20">
                      <Settings2 className="h-10 w-10 text-text-muted mx-auto mb-3" />
                      <p className="text-sm text-text-secondary">No equipment found.</p>
                      <button
                        onClick={() => setAddOpen(true)}
                        className="text-xs text-accent hover:underline mt-1"
                      >
                        Add your first equipment →
                      </button>
                    </td>
                  </tr>
                ) : (
                  equipment.map((eq, i) => (
                    <tr
                      key={eq.id}
                      className="border-b border-border/60 hover:bg-muted/30 transition-colors duration-150 animate-fade-in group"
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <td className="px-5 py-4">
                        <span className="font-medium text-text-primary text-sm">{eq.name}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-text-secondary font-mono text-xs bg-muted px-2 py-0.5 rounded">
                          {eq.typeName}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={eq.status} />
                      </td>
                      <td className="px-5 py-4">
                        {eq.lastCleanedDate ? (
                          <span className="text-sm text-text-secondary font-mono">
                            {eq.lastCleanedDate}
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted italic">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Log / View Maintenance"
                            onClick={() => setMaintTarget(eq)}
                          >
                            <Wrench className="h-4 w-4 text-warning" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit"
                            onClick={() => setEditTarget(eq)}
                          >
                            <Pencil className="h-4 w-4 text-accent" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete"
                            onClick={() => setDeleteTarget(eq)}
                          >
                            <Trash2 className="h-4 w-4 text-danger" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-border">
              <p className="text-xs text-text-secondary">
                Showing <span className="font-semibold text-text-primary">{equipment.length}</span> of{' '}
                <span className="font-semibold text-text-primary">{totalElements}</span> results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-text-secondary font-mono px-1">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Modals ──────────────────────────────────────── */}
      <EquipmentForm
        open={addOpen}
        onOpenChange={setAddOpen}
        initialData={null}
      />
      <EquipmentForm
        open={Boolean(editTarget)}
        onOpenChange={open => { if (!open) setEditTarget(null) }}
        initialData={editTarget}
      />
      <MaintenanceModal
        open={Boolean(maintTarget)}
        onOpenChange={open => { if (!open) setMaintTarget(null) }}
        equipment={maintTarget}
      />
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={open => { if (!open) setDeleteTarget(null) }}
        equipment={deleteTarget}
      />
    </div>
  )
}
