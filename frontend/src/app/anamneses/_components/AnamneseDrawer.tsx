'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { formatApiError } from '@/utils/errorHandler'
import type { Anamnese, Template } from '@/types/anamneses'
import type { AnamneseStep } from './AnamneseStepper'
import AnamneseStepper from './AnamneseStepper'
import AnamneseFormDados, { type AnamneseFormDadosValue } from './AnamneseFormDados'
import AnamneseSignaturePad from './AnamneseSignaturePad'
import AnamneseLinkShare from './AnamneseLinkShare'
import {
  createAnamnese,
  getDateInputValue,
  listClientsForSelect,
  listTemplates,
  signAnamnese,
  updateAnamnese,
} from '@/services/anamneses'

export default function AnamneseDrawer({
  open,
  onClose,
  initial,
}: {
  open: boolean
  onClose: () => void
  initial?: Anamnese | null
}) {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const isEdit = !!initial
  const isSigned = !!initial?.isSigned

  const [step, setStep] = useState<AnamneseStep>('dados')

  const [dados, setDados] = useState<AnamneseFormDadosValue>({
    templateId: initial?.templateId ? String(initial.templateId) : '',
    clientId: initial?.clientId ? String(initial.clientId) : '',
    date: initial?.date ? getDateInputValue(initial.date) : '',
    status: initial?.status || 'Aberto',
  })

  const [signatureLocal, setSignatureLocal] = useState<{ signatureName: string; signatureImageBase64: string } | null>(null)

  useEffect(() => {
    if (!open) return
    setStep('dados')
    setSignatureLocal(null)
    setDados({
      templateId: initial?.templateId ? String(initial.templateId) : '',
      clientId: initial?.clientId ? String(initial.clientId) : '',
      date: initial?.date ? getDateInputValue(initial.date) : '',
      status: initial?.status || 'Aberto',
    })
  }, [open, initial?.id])

  const templatesQuery = useQuery({
    queryKey: ['anamneses', 'templates'],
    queryFn: listTemplates,
    enabled: open,
  })

  const clientsQuery = useQuery({
    queryKey: ['anamneses', 'clients'],
    queryFn: listClientsForSelect,
    enabled: open,
  })

  const templates: Template[] = templatesQuery.data || []
  const clients = clientsQuery.data || []

  const link = useMemo(() => {
    return initial?.publicLink
  }, [initial?.publicLink])

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user?.company_id) {
        throw new Error('company_id não encontrado no usuário logado')
      }

      return createAnamnese({
        companyId: user.company_id,
        clientId: Number(dados.clientId),
        templateId: Number(dados.templateId),
        date: dados.date,
        status: dados.status,
      })
    },
    onSuccess: async (created) => {
      if (signatureLocal) {
        await signAnamnese(created.id, {
          signatureName: signatureLocal.signatureName,
          signatureImageBase64: signatureLocal.signatureImageBase64,
        })
      }
      toast.success('Salvo com sucesso')
      await queryClient.invalidateQueries({ queryKey: ['anamneses', 'list'] })
      onClose()
    },
    onError: (e: any) => {
      toast.error(formatApiError(e))
    },
  })

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!initial) throw new Error('Anamnese inválida')
      await updateAnamnese(initial.id, {
        clientId: Number(dados.clientId),
        templateId: Number(dados.templateId),
        date: dados.date,
        status: dados.status,
      })

      if (signatureLocal && !initial.isSigned) {
        await signAnamnese(initial.id, {
          signatureName: signatureLocal.signatureName,
          signatureImageBase64: signatureLocal.signatureImageBase64,
        })
      }
    },
    onSuccess: async () => {
      toast.success('Salvo com sucesso')
      await queryClient.invalidateQueries({ queryKey: ['anamneses', 'list'] })
      onClose()
    },
    onError: (e: any) => {
      toast.error(formatApiError(e))
    },
  })

  const signingMutation = useMutation({
    mutationFn: async (data: { signatureName: string; signatureImageBase64: string }) => {
      if (!initial?.id) throw new Error('Salve a anamnese antes de assinar')
      await signAnamnese(initial.id, {
        signatureName: data.signatureName,
        signatureImageBase64: data.signatureImageBase64,
      })
    },
    onSuccess: async () => {
      toast.success('Assinatura salva')
      await queryClient.invalidateQueries({ queryKey: ['anamneses', 'list'] })
      onClose()
    },
    onError: (e: any) => {
      toast.error(formatApiError(e))
    },
  })

  const isLoading = createMutation.isPending || updateMutation.isPending

  const validate = (): boolean => {
    if (!dados.templateId) {
      toast.error('Selecione um modelo de anamnese')
      setStep('dados')
      return false
    }
    if (!dados.clientId) {
      toast.error('Selecione um cliente')
      setStep('dados')
      return false
    }
    if (!dados.date) {
      toast.error('Selecione uma data')
      setStep('dados')
      return false
    }
    if (!dados.status) {
      toast.error('Selecione um status')
      setStep('dados')
      return false
    }
    return true
  }

  const onSave = async () => {
    if (!validate()) return

    if (isEdit) {
      await updateMutation.mutateAsync()
    } else {
      await createMutation.mutateAsync()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={() => !isLoading && onClose()} />

      <div className="absolute inset-y-0 right-0 w-full max-w-3xl bg-white shadow-xl flex flex-col">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-gray-900">Anamnese</div>
            {isSigned && <div className="text-sm text-gray-500">Anamnese assinada (somente leitura)</div>}
          </div>
          <button
            type="button"
            onClick={() => !isLoading && onClose()}
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-6 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
            <div>
              <AnamneseStepper value={step} onChange={setStep} disabled={isLoading} />
            </div>

            <div className="min-w-0">
              {step === 'dados' && (
                <AnamneseFormDados
                  value={dados}
                  onChange={setDados}
                  templates={templates}
                  clients={clients}
                  lockClient={isEdit}
                  lockTemplate={isEdit}
                  disabled={isLoading || isSigned}
                />
              )}

              {step === 'assinatura' && (
                <AnamneseSignaturePad
                  initialImage={initial?.signature?.imageUrl || null}
                  disabled={isLoading || isSigned}
                  canSign={!!initial?.id && !isSigned}
                  onSaveLocal={(data) => setSignatureLocal(data)}
                  onSign={async (data) => {
                    await signingMutation.mutateAsync(data)
                  }}
                />
              )}

              {step === 'link' && <AnamneseLinkShare link={link} />}
            </div>
          </div>
        </div>

        <div className="border-t p-4 bg-white">
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => !isLoading && onClose()}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60"
            >
              Cancelar
            </button>
            {!isSigned && (
              <button
                type="button"
                onClick={onSave}
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-60"
              >
                {isLoading ? 'Salvando...' : 'Salvar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
