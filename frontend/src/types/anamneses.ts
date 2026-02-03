export type AnamneseStatusUi = 'Aberto' | 'Fechado'

export type AnamneseStatusApi = 'open' | 'closed'

export interface Anamnese {
  id: number
  clientId: number
  clientName: string
  clientPhone: string
  templateId: number
  templateName: string
  date: string
  status: AnamneseStatusUi
  signature?: {
    name?: string | null
    imageUrl?: string | null
    signedAt?: string | null
  }
  publicLink?: string
  isSigned?: boolean
}

export interface Template {
  id: number
  name: string
  isActive: boolean
}

export interface ListAnamnesesParams {
  search?: string
  status?: AnamneseStatusUi | 'Todos'
  page?: number
  pageSize?: number
}

export interface CreateAnamnesePayload {
  companyId: number
  clientId: number
  templateId: number
  date: string
  status: AnamneseStatusUi
}

export interface UpdateAnamnesePayload {
  clientId: number
  templateId: number
  date: string
  status: AnamneseStatusUi
}

export const mapStatusUiToApi = (status: AnamneseStatusUi): AnamneseStatusApi => {
  return status === 'Fechado' ? 'closed' : 'open'
}

export const mapStatusApiToUi = (status: string | null | undefined): AnamneseStatusUi => {
  return status === 'closed' ? 'Fechado' : 'Aberto'
}
