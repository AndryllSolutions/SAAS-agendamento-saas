import { redirect } from 'next/navigation'
import BookingClient from './BookingClient'
import type { CompanyProfile } from '@/components/online-booking/types'

interface PageProps {
  params: {
    slug: string
  }
}

export default async function OnlineBookingPage({ params }: PageProps) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL não foi configurada. Defina a variável de ambiente para carregar o agendamento público.')
  }

  const response = await fetch(`${baseUrl}/api/public/companies/${params.slug}`, {
    next: { revalidate: 60 }
  })

  if (response.status === 404) {
    redirect('/404')
  }

  if (!response.ok) {
    throw new Error('Não foi possível carregar os dados da empresa para o agendamento público.')
  }

  const company: CompanyProfile = await response.json()

  return <BookingClient company={company} slug={params.slug} apiBaseUrl={baseUrl} />
}
