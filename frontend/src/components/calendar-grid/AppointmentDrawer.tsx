"use client"

import React, { useState } from 'react'
import { CalendarAppointment } from '@/types/calendar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ClientSidebar } from './ClientSidebar'
import AppointmentForm from '@/components/AppointmentForm'

interface AppointmentDrawerProps {
  appointment: CalendarAppointment
  onClose: () => void
  onSuccess?: () => void
}

export function AppointmentDrawer({
  appointment,
  onClose,
  onSuccess,
}: AppointmentDrawerProps) {
  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-5xl p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Left: Client Sidebar */}
          {appointment.client && (
            <div className="w-80 border-r bg-gray-50 overflow-y-auto">
              <ClientSidebar clientId={appointment.client.id} />
            </div>
          )}

          {/* Right: Appointment Form */}
          <div className="flex-1 overflow-y-auto">
            <SheetHeader className="px-6 py-4 border-b">
              <SheetTitle>Detalhes do Agendamento</SheetTitle>
            </SheetHeader>
            <div className="p-6">
              <AppointmentForm
                appointment={{
                  id: appointment.id,
                  start_time: appointment.start_time,
                  end_time: appointment.end_time,
                  status: appointment.status as any,
                  client_id: appointment.client?.id,
                  professional_id: appointment.professional_id,
                  service_id: appointment.items[0]?.service_id,
                  client_notes: appointment.notes,
                }}
                onClose={onClose}
                onSuccess={() => {
                  onSuccess?.()
                  onClose()
                }}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
