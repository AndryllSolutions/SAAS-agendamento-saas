"use client"

import React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import { CalendarAppointment, CalendarProfessional } from '@/types/calendar'

interface MoveConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  appointment: CalendarAppointment | null
  newStartTime: string
  newProfessional: CalendarProfessional | null
  loading?: boolean
}

export function MoveConfirmModal({
  open,
  onClose,
  onConfirm,
  appointment,
  newStartTime,
  newProfessional,
  loading = false,
}: MoveConfirmModalProps) {
  if (!appointment) return null

  const formattedNewTime = format(parseISO(newStartTime), "dd/MM/yyyy 'às' HH:mm", {
    locale: ptBR,
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar movimentação de agendamento?</DialogTitle>
          <DialogDescription>
            Você está movendo o agendamento para um novo horário/profissional.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Cliente:</p>
            <p className="text-base">{appointment.client?.full_name || 'N/A'}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">Novo horário:</p>
            <p className="text-base">{formattedNewTime}</p>
          </div>

          {newProfessional && (
            <div>
              <p className="text-sm font-medium text-gray-700">Novo profissional:</p>
              <p className="text-base">{newProfessional.full_name}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-700">Serviços:</p>
            <p className="text-base">
              {appointment.items.map((item) => item.service_name).join(', ') || 'N/A'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={loading}>
            {loading ? 'Movendo...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
