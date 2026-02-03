import { anamnesisService, clientService } from '@/services/api'
import type { Anamnese, AnamneseStatusUi, CreateAnamnesePayload, ListAnamnesesParams, Template, UpdateAnamnesePayload } from '@/types/anamneses'
import { mapStatusApiToUi, mapStatusUiToApi } from '@/types/anamneses'

const toYyyyMmDd = (dateIso: string) => {
  if (!dateIso) return ''
  const d = new Date(dateIso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

const getMetaDate = (item: any): string => {
  const metaDate = item?.responses?._meta_date
  if (typeof metaDate === 'string' && metaDate) return metaDate
  if (typeof item?.created_at === 'string' && item.created_at) return item.created_at
  return new Date().toISOString()
}

const getClientPhone = (client: any): string => {
  return client?.cellphone || client?.phone || client?.whatsapp || ''
}

export const listTemplates = async (): Promise<Template[]> => {
  const res = await anamnesisService.listModels()
  const items = Array.isArray(res.data) ? res.data : []
  return items.map((m: any) => ({
    id: m.id,
    name: m.name,
    isActive: true,
  }))
}

export const listClientsForSelect = async (): Promise<Array<{ id: number; name: string; phone: string }>> => {
  const res = await clientService.list()
  const items = Array.isArray(res.data) ? res.data : []
  return items.map((c: any) => ({
    id: c.id,
    name: c.full_name || c.name || `Cliente ${c.id}`,
    phone: getClientPhone(c),
  }))
}

export const listAnamneses = async (params?: ListAnamnesesParams): Promise<{ items: Anamnese[]; total: number }> => {
  const [anamRes, templates, clients] = await Promise.all([
    anamnesisService.list({ skip: 0, limit: 1000 }),
    listTemplates(),
    listClientsForSelect(),
  ])

  const raw = Array.isArray(anamRes.data) ? anamRes.data : []

  const templatesById = new Map<number, Template>()
  templates.forEach((t) => templatesById.set(t.id, t))

  const clientsById = new Map<number, { id: number; name: string; phone: string }>()
  clients.forEach((c) => clientsById.set(c.id, c))

  const mapped: Anamnese[] = raw.map((a: any) => {
    const client = clientsById.get(a.client_id)
    const template = templatesById.get(a.model_id)

    const date = getMetaDate(a)

    const publicBase = (process.env.PUBLIC_URL || '').replace(/\/+$/, '')
    const publicLink = publicBase ? `${publicBase}/public/anamnese/${a.id}` : undefined

    return {
      id: a.id,
      clientId: a.client_id,
      clientName: client?.name || `Cliente ${a.client_id}`,
      clientPhone: client?.phone || '',
      templateId: a.model_id,
      templateName: template?.name || `Modelo ${a.model_id}`,
      date,
      status: mapStatusApiToUi(a.status),
      signature: {
        name: a.signature_name,
        imageUrl: a.signature_image_url,
        signedAt: a.signature_date,
      },
      publicLink,
      isSigned: !!a.is_signed,
    }
  })

  const search = (params?.search || '').trim().toLowerCase()
  const status = params?.status

  const filtered = mapped.filter((i) => {
    const matchSearch = !search || i.clientName.toLowerCase().includes(search) || i.templateName.toLowerCase().includes(search)
    const matchStatus = !status || status === 'Todos' || i.status === status
    return matchSearch && matchStatus
  })

  return { items: filtered, total: filtered.length }
}

export const getAnamnese = async (id: number) => {
  const res = await anamnesisService.get(id)
  return res.data
}

export const createAnamnese = async (payload: CreateAnamnesePayload): Promise<Anamnese> => {
  const createRes = await anamnesisService.create({
    company_id: payload.companyId,
    client_id: payload.clientId,
    model_id: payload.templateId,
    professional_id: null,
    responses: {
      _meta_date: payload.date,
    },
  })

  const created = createRes.data

  if (payload.status === 'Fechado') {
    await anamnesisService.update(created.id, {
      status: mapStatusUiToApi(payload.status),
    })
  }

  const full = await getAnamnese(created.id)

  return {
    id: full.id,
    clientId: full.client_id,
    clientName: `Cliente ${full.client_id}`,
    clientPhone: '',
    templateId: full.model_id,
    templateName: `Modelo ${full.model_id}`,
    date: getMetaDate(full),
    status: mapStatusApiToUi(full.status),
    signature: {
      name: full.signature_name,
      imageUrl: full.signature_image_url,
      signedAt: full.signature_date,
    },
    isSigned: !!full.is_signed,
    publicLink: undefined,
  }
}

export const updateAnamnese = async (id: number, payload: UpdateAnamnesePayload): Promise<void> => {
  const existing = await getAnamnese(id)
  const existingResponses = (existing?.responses && typeof existing.responses === 'object') ? existing.responses : {}

  await anamnesisService.update(id, {
    status: mapStatusUiToApi(payload.status),
    responses: {
      ...existingResponses,
      _meta_date: payload.date,
    },
  })
}

export const deleteAnamnese = async (id: number): Promise<void> => {
  await anamnesisService.delete(id)
}

export const signAnamnese = async (id: number, data: { signatureName: string; signatureImageBase64?: string | null }): Promise<void> => {
  await anamnesisService.sign(id, {
    signature_name: data.signatureName,
    signature_image_url: data.signatureImageBase64 || null,
  })
}

export const getDateInputValue = (dateIso: string) => toYyyyMmDd(dateIso)
