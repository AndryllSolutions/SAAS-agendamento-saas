"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/Button'
import { BookingFormValues } from './types'

interface BookingFormProps {
  onSubmit: (values: BookingFormValues) => Promise<void>
  loading?: boolean
  disabled?: boolean
}

export function BookingForm({ onSubmit, loading, disabled }: BookingFormProps) {
  const [values, setValues] = useState<BookingFormValues>({ name: '', phone: '', email: '', notes: '' })

  const handleChange = (field: keyof BookingFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    await onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <Input
          id="customer-name"
          label="Nome completo"
          placeholder="Digite seu nome"
          required
          value={values.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
        <Input
          id="customer-phone"
          label="WhatsApp"
          placeholder="(99) 99999-9999"
          required
          value={values.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
        />
        <Input
          id="customer-email"
          label="Email (opcional)"
          type="email"
          placeholder="voce@email.com"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
        />
        <Textarea
          id="customer-notes"
          placeholder="Observações ou preferências"
          value={values.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          className="min-h-[120px]"
        />
      </div>
      <Button
        type="submit"
        className="w-full rounded-2xl bg-black py-4 text-lg font-semibold text-white"
        isLoading={loading}
        disabled={disabled}
      >
        Agendar agora
      </Button>
    </form>
  )
}
