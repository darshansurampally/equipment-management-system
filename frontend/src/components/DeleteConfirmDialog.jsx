import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { equipmentApi } from '@/services/api'
import { useToast } from '@/components/ui/toast'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2, AlertTriangle } from 'lucide-react'

export default function DeleteConfirmDialog({ open, onOpenChange, equipment }) {
  const queryClient  = useQueryClient()
  const { addToast } = useToast()

  const deleteMutation = useMutation({
    mutationFn: () => equipmentApi.delete(equipment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      addToast({
        type: 'success',
        title: 'Equipment deleted',
        message: `${equipment?.name} has been removed from the system.`,
      })
      onOpenChange(false)
    },
    onError: () => {
      addToast({
        type: 'error',
        title: 'Delete failed',
        message: 'Could not delete this equipment. It may be referenced elsewhere.',
      })
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-danger" />
            </div>
            <DialogTitle className="font-display">Delete Equipment</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-text-primary">{equipment?.name}</span>?
            This will also remove all associated maintenance history. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Deleting…</>
            ) : (
              <><Trash2 className="h-4 w-4" /> Delete</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
