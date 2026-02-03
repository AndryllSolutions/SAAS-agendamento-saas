'use client'

import { NextIntlClientProvider } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { defaultLocale, type AppLocale } from './config'
import ptBrMessages from './messages/pt-BR.json'
import esMessages from './messages/es.json'

const messagesMap: Record<AppLocale, Record<string, any>> = {
  'pt-BR': ptBrMessages,
  es: esMessages
}

const normalizeLocale = (value?: string | null): AppLocale => {
  if (!value) return defaultLocale

  const normalized = value.replace('_', '-').toLowerCase()

  if (normalized.startsWith('es')) return 'es'
  if (normalized.startsWith('pt')) return 'pt-BR'

  return defaultLocale
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<AppLocale>(defaultLocale)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('interface_language') : null
    const documentLang = typeof document !== 'undefined' ? document.documentElement.lang : null
    const browserLang = typeof navigator !== 'undefined' ? navigator.language : null

    setLocale(normalizeLocale(stored || documentLang || browserLang))
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return

    const target = document.documentElement

    const observer = new MutationObserver(() => {
      const updatedLang = target.lang
      if (updatedLang) {
        setLocale(normalizeLocale(updatedLang))
      }
    })

    observer.observe(target, { attributes: true, attributeFilter: ['lang'] })

    return () => observer.disconnect()
  }, [])

  const messages = useMemo(() => messagesMap[locale] ?? messagesMap[defaultLocale], [locale])

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
