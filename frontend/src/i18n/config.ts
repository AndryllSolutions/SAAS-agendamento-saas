export const locales = ['pt-BR', 'es'] as const

export type AppLocale = (typeof locales)[number]

export const defaultLocale: AppLocale = 'pt-BR'
