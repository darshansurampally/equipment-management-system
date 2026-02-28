import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { equipmentApi, typesApi } from '@/services/api'
import { useToast } from '@/components/ui/toast'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Loader2, Save, PlusCircle } from 'lucide-react'

const STATUS_OPTIONS = ['Active', 'Inactive', 'Under Maintenance']

const EMPTY_FORM = {
  name: '',
  typeId: '',
  status: '',
  lastCleanedDate: '',
}

export default function EquipmentForm({ open, onOpenChange, initialData }) {
  const isEdit = Boolean(initialData)
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [form, setForm]     = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')

  // Reset form whenever dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          name:             initialData.name || '',
          typeId:           String(initialData.typeId || ''),
          status:           initialData.status || '',
          lastCleanedDate:  initialData.lastCleanedDate || '',
        })
      } else {
        setForm(EMPTY_FORM)
      }
      setErrors({})
      setApiError('')
    }
  }, [open, initialData])

  const { data: types = [], isLoading: typesLoading } = useQuery({
    queryKey: ['equipment-types'],
    queryFn: typesApi.getAll,
  })

  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? equipmentApi.update(initialData.id, data)
        : equipmentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      addToast({
        type: 'success',
        title: isEdit ? 'Equipment updated' : 'Equipment added',
        message: isEdit
          ? `${form.name} has been updated successfully.`
          : `${form.name} has been added to the system.`,
      })
      onOpenChange(false)
    },
    onError: (err) => {
      console.error('Equipment save error:', err)
      console.error('Response data:', err?.response?.data)
      
      // Handle validation errors
      if (err?.response?.data?.fieldErrors) {
        const fieldErrors = err.response.data.fieldErrors
        setErrors(fieldErrors)
        setApiError('Please fix the validation errors below.')
        return
      }
      
      // Handle general errors
      const msg = err?.response?.data?.message || 'Something went wrong. Please try again.'
      setApiError(msg)
    },
  })

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name    = 'Equipment name is required'
    if (!form.typeId)         e.typeId  = 'Please select a type'
    if (!form.status)         e.status  = 'Please select a status'
    
    console.log('Form validation:', { form, errors: e })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setApiError('')
    
    console.log('Form submit triggered:', form)
    
    if (!validate()) {
      console.log('Validation failed')
      return
    }
    
    const payload = {
      name:             form.name.trim(),
      typeId:           Number(form.typeId),
      status:           form.status,
      lastCleanedDate:  form.lastCleanedDate || null,
    }
    
    console.log('Submitting payload:', payload)
    saveMutation.mutate(payload)
  }

  const field = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
    setApiError('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? 'Edit Equipment' : 'Add New Equipment'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details for this equipment record.'
              : 'Fill in the details to register new equipment.'}
          </DialogDescription>
        </DialogHeader>

        {/* API / Business Rule Error */}
        {apiError && (
          <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm leading-relaxed">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="eq-name">Equipment Name</Label>
            <Input
              id="eq-name"
              placeholder="e.g. Air Handler Unit 3"
              value={form.name}
              onChange={e => field('name', e.target.value)}
            />
            {errors.name && <p className="text-xs text-danger">{errors.name}</p>}
          </div>

          {/* Type */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="eq-type">Type</Label>
            <Select
              value={form.typeId}
              onValueChange={v => field('typeId', v)}
              disabled={typesLoading}
            >
              <SelectTrigger id="eq-type">
                <SelectValue placeholder={typesLoading ? 'Loading types…' : 'Select a type'} />
              </SelectTrigger>
              <SelectContent>
                {types.map(t => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.typeId && <p className="text-xs text-danger">{errors.typeId}</p>}
          </div>

          {/* Status */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="eq-status">Status</Label>
            <Select value={form.status} onValueChange={v => field('status', v)}>
              <SelectTrigger id="eq-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && <p className="text-xs text-danger">{errors.status}</p>}
          </div>

          {/* Last Cleaned Date */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="eq-date">
              Last Cleaned Date
              <span className="ml-1 text-text-muted normal-case tracking-normal font-normal">(optional)</span>
            </Label>
            <Input
              id="eq-date"
              type="date"
              value={form.lastCleanedDate}
              onChange={e => field('lastCleanedDate', e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
              ) : isEdit ? (
                <><Save className="h-4 w-4" /> Update</>
              ) : (
                <><PlusCircle className="h-4 w-4" /> Add Equipment</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
