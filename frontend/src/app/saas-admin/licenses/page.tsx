'use client'

import React from 'react'
import DashboardLayout from '@/components/DashboardLayout'

export default function LicensesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Licenças
          </h1>
          <p className="text-gray-600 mt-1">Gerencie as licenças do sistema SaaS</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Módulo de Licenças
            </h2>
            <p className="text-gray-600 mb-8">
              Este módulo está em desenvolvimento. Em breve você poderá gerenciar licenças, 
              planos e assinaturas aqui.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                <strong>Em desenvolvimento:</strong> Gestão de licenças, planos, 
                renovações e upgrade/downgrade de assinaturas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}