'use client'

import DashboardLayout from '@/components/DashboardLayout'
import * as Tabs from '@radix-ui/react-tabs'
import Link from 'next/link'

export default function AnamnesesModelosPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Modelo de anamneses</h1>
            <p className="text-gray-600">Estrutura base pronta. Editor será implementado aqui.</p>
          </div>
          <Link href="/anamneses" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Voltar
          </Link>
        </div>

        <Tabs.Root value="templates" className="space-y-6">
          <Tabs.List className="flex border-b border-gray-200">
            <Tabs.Trigger
              value="templates"
              className="px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              Modelos
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="templates" className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-sm text-gray-600">Tabela/Editor em desenvolvimento.</div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </DashboardLayout>
  )
}
