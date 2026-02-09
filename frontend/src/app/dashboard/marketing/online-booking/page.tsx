'use client'

import { useEffect, useMemo, useState } from 'react'
import { Copy, ExternalLink, Phone, SunMedium, MoonStar, Loader2, Check } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { Button } from '@/components/ui/Button'
import PhoneFrame from '@/components/online-booking/PhoneFrame'
import { onlineBookingService, OnlineBookingConfig } from '@/services/onlineBookingService'
import { Input } from '@/components/ui/Input'
import { toast } from 'sonner'

export default function DashboardMarketingOnlineBookingPage() {
  const [config, setConfig] = useState<OnlineBookingConfig | null>(null)
  const [slugDraft, setSlugDraft] = useState('')
  const [savingSlug, setSavingSlug] = useState(false)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [darkPreview, setDarkPreview] = useState(true)
  const [appOrigin, setAppOrigin] = useState<string>(process.env.NEXT_PUBLIC_APP_URL || '')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAppOrigin(window.location.origin)
    }
  }, [])

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true)
        const data = await onlineBookingService.getConfig()
        setConfig(data)
        setSlugDraft(data.public_slug || '')
      } catch (error: any) {
        console.error('Erro ao carregar configuração de agendamento público:', error)
        toast.error('Não foi possível carregar as configurações do agendamento público')
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  const slug = config?.public_slug || slugDraft || ''

  const publicUrl = useMemo(() => {
    const origin = appOrigin?.replace(/\/$/, '') || ''
    return origin ? `${origin}/online-booking/${slug}` : `/online-booking/${slug}`
  }, [appOrigin, slug])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (error) {
      console.error('Erro ao copiar link público:', error)
    }
  }

  const previewUrl = slug ? `/online-booking/${slug}?preview=1` : ''

  const handleSaveSlug = async () => {
    if (!slugDraft.trim()) {
      toast.error('Informe um slug para disponibilizar o link público')
      return
    }

    setSavingSlug(true)
    try {
      const updated = await onlineBookingService.updateConfig({ public_slug: slugDraft.trim() })
      setConfig((prev) => ({ ...prev, ...updated }))
      toast.success('Slug público atualizado com sucesso')
    } catch (error: any) {
      console.error('Erro ao atualizar slug público:', error)
      toast.error(error?.response?.data?.detail || 'Não foi possível atualizar o slug público')
    } finally {
      setSavingSlug(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">Marketing</p>
          <h1 className="text-3xl font-bold text-gray-900">Agendamento público</h1>
          <p className="mt-2 text-gray-600">
            Configure o link público do seu agendamento e veja exatamente como os clientes enxergam no celular.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          <section className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-gray-500">Slug público</p>
              <Input
                value={slugDraft}
                onChange={(event) => setSlugDraft(event.target.value.replace(/[^a-z0-9-]/gi, '').toLowerCase())}
                placeholder="ex: imperio-capelli"
                className="mt-3"
              />
              <div className="mt-4 flex items-center gap-2">
                <Button onClick={handleSaveSlug} isLoading={savingSlug} disabled={savingSlug || !slugDraft.trim()}>
                  Salvar slug
                </Button>
                {config?.public_slug && !savingSlug && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <Check className="h-3.5 w-3.5" /> Publicado
                  </span>
                )}
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Esse slug identifica sua empresa no link público. Use letras minúsculas, números e hifens.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Link público</p>
                  <p className="text-xs text-gray-400">Compartilhe com seus clientes</p>
                </div>
                <Button variant="secondary" size="sm" onClick={handleCopy} disabled={!slug || copied}>
                  <Copy className="mr-2 h-4 w-4" />
                  {copied ? 'Copiado' : 'Copiar'}
                </Button>
              </div>
              <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                {slug ? publicUrl : 'Defina o slug para gerar o link público'}
              </div>
              <a
                href={slug ? publicUrl : '#'}
                target="_blank"
                rel="noreferrer"
                className={`mt-4 inline-flex items-center text-sm font-semibold ${
                  slug ? 'text-indigo-600 hover:text-indigo-800' : 'text-gray-400 cursor-not-allowed'
                }`}
                aria-disabled={!slug}
              >
                Abrir página pública
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-gray-500">Aparência do preview</p>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Phone className="h-4 w-4" />
                  <span>Simulador mobile</span>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setDarkPreview((prev) => !prev)}
                  className="gap-2"
                >
                  {darkPreview ? (
                    <>
                      <SunMedium className="h-4 w-4" />
                      Claro
                    </>
                  ) : (
                    <>
                      <MoonStar className="h-4 w-4" />
                      Escuro
                    </>
                  )}
                </Button>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                Alterne o tema do mockup para apresentar em apresentações ou material comercial.
              </p>
            </div>
          </section>

          <section className="rounded-[36px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl">
            <div className="mb-4 flex items-center justify-between text-white/80">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Preview em tempo real</p>
                <h2 className="text-xl font-semibold text-white">Experiência do cliente</h2>
              </div>
              <span className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-white">
                Beta
              </span>
            </div>

            {loading ? (
              <div className="flex h-[820px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            ) : slug ? (
              <PhoneFrame dark={darkPreview}>
                <iframe
                  key={`${slug}-${darkPreview}`}
                  src={previewUrl}
                  title="Preview do agendamento"
                  className="h-[760px] w-full border-0"
                  allow="clipboard-write; encrypted-media; accelerometer; payment"
                />
              </PhoneFrame>
            ) : (
              <div className="flex h-[820px] flex-col items-center justify-center gap-4 text-center text-white/70">
                <Phone className="h-14 w-14" />
                <p className="max-w-xs text-sm">
                  Defina o slug público para ativar o preview do simulador.
                </p>
              </div>
            )}

            <p className="mt-6 text-center text-xs text-white/60">
              O simulador replica exatamente o fluxo público. Tudo que você vê aqui é o que seu cliente vê no celular.
            </p>
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}
