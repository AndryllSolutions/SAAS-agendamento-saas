'use client'

import { useState, useEffect } from 'react'
import { appointmentService } from '@/services/api'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState([])
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')

  useEffect(() => {
    loadAppointments()
  }, [currentDate])

  const loadAppointments = async () => {
    try {
      const response = await appointmentService.list()
      setAppointments(response.data)
    } catch (error) {
      toast.error('Erro ao carregar agendamentos')
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getAppointmentsForDay = (day: number) => {
    return appointments.filter((apt: any) => {
      const aptDate = new Date(apt.start_time)
      return (
        aptDate.getDate() === day &&
        aptDate.getMonth() === currentDate.getMonth() &&
        aptDate.getFullYear() === currentDate.getFullYear()
      )
    })
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <CalendarIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Agenda</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* View Selector */}
            <div className="flex bg-white rounded-lg shadow">
              <button
                onClick={() => setView('day')}
                className={`px-4 py-2 rounded-l-lg ${view === 'day' ? 'bg-primary text-white' : 'text-gray-600'}`}
              >
                Dia
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-4 py-2 ${view === 'week' ? 'bg-primary text-white' : 'text-gray-600'}`}
              >
                Semana
              </button>
              <button
                onClick={() => setView('month')}
                className={`px-4 py-2 rounded-r-lg ${view === 'month' ? 'bg-primary text-white' : 'text-gray-600'}`}
              >
                Mês
              </button>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center gap-2 bg-white rounded-lg shadow px-4 py-2">
              <button onClick={previousMonth} className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-semibold min-w-[150px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              Hoje
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Day Names */}
          <div className="grid grid-cols-7 border-b">
            {dayNames.map((day) => (
              <div key={day} className="p-4 text-center font-semibold text-gray-600 border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="min-h-[120px] p-2 border-r border-b bg-gray-50" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1
              const dayAppointments = getAppointmentsForDay(day)
              const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear()

              return (
                <div
                  key={day}
                  className={`min-h-[120px] p-2 border-r border-b hover:bg-gray-50 cursor-pointer ${
                    isToday ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-primary' : 'text-gray-700'}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map((apt: any) => (
                      <div
                        key={apt.id}
                        className="text-xs p-1 bg-primary/10 text-primary rounded truncate"
                        title={apt.service?.name}
                      >
                        {new Date(apt.start_time).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}{' '}
                        - {apt.service?.name}
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-gray-500 font-semibold">
                        +{dayAppointments.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border-2 border-primary rounded"></div>
            <span>Dia Atual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary/10 rounded"></div>
            <span>Agendamento</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
