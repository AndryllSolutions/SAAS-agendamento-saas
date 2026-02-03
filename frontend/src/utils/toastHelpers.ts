import { toast } from 'sonner'

interface AppointmentToastData {
  date: string | Date
  time: string
  professionalName?: string
  serviceName?: string
}

/**
 * Formata data para exibição no toast
 */
const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Formata hora para exibição no toast
 */
const formatTime = (time: string): string => {
  // Se já está no formato HH:mm, retorna direto
  if (time.includes(':')) {
    return time
  }
  // Se é um timestamp, converte
  const date = new Date(time)
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Mostra toast de sucesso para novo agendamento
 */
export const showAppointmentToast = (data: AppointmentToastData) => {
  const formattedDate = formatDate(data.date)
  const formattedTime = formatTime(data.time)
  
  let message = `Novo agendamento para o dia ${formattedDate} às ${formattedTime}`
  
  if (data.professionalName) {
    message += ` com ${data.professionalName}`
  }
  
  if (data.serviceName) {
    message += `.`
  } else {
    message += '.'
  }

  toast.success('Novo Agendamento', {
    description: message,
    duration: 5000, // 5 segundos
    style: {
      background: '#10b981', // Verde claro
      color: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
  })
}

/**
 * Mostra toast de sucesso para agendamento atualizado
 */
export const showAppointmentUpdatedToast = (data: AppointmentToastData) => {
  const formattedDate = formatDate(data.date)
  const formattedTime = formatTime(data.time)
  
  let message = `Agendamento atualizado para o dia ${formattedDate} às ${formattedTime}`
  
  if (data.professionalName) {
    message += ` com ${data.professionalName}`
  }
  
  message += '.'

  toast.success('Agendamento Atualizado', {
    description: message,
    duration: 5000,
    style: {
      background: '#10b981',
      color: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
  })
}

/**
 * Mostra toast de sucesso para agendamento confirmado
 */
export const showAppointmentConfirmedToast = (data: AppointmentToastData) => {
  const formattedDate = formatDate(data.date)
  const formattedTime = formatTime(data.time)
  
  let message = `Agendamento confirmado para o dia ${formattedDate} às ${formattedTime}`
  
  if (data.professionalName) {
    message += ` com ${data.professionalName}`
  }
  
  message += '.'

  toast.success('Agendamento Confirmado', {
    description: message,
    duration: 5000,
    style: {
      background: '#10b981',
      color: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
  })
}

