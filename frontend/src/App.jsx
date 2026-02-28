import React from 'react'
import { ToastProvider } from '@/components/ui/toast'
import EquipmentPage from '@/pages/EquipmentPage'

export default function App() {
  return (
    <ToastProvider>
      <EquipmentPage />
    </ToastProvider>
  )
}
