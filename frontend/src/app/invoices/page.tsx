'use client'

import { FileText } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import UpsellModal from '@/components/UpsellModal'

export default function InvoicesPage() {
  const hasAccess = useFeatureFlag('invoices')

  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <UpsellModal
            feature="invoices"
            featureName="Notas Fiscais"
            description="Sistema completo de emissão de notas fiscais"
            onClose={() => window.history.back()}
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Notas Fiscais</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-primary" />
            <h2 className="text-xl font-bold">Emissão de Notas Fiscais</h2>
          </div>
          <p className="text-gray-600">
            Gerencie a emissão de notas fiscais eletrônicas.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

