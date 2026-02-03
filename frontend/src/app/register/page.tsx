'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Calendar, Lock, Mail, User, Phone, Building2, Globe2, Users, Tag } from 'lucide-react'
import { authService } from '@/services/api'

const registerSchema = z.object({
  // Dados do usuário (já existentes)
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  full_name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  phone: z.string().optional(),

  // Dados da empresa
  company_name: z.string().min(3, 'Nome da empresa deve ter no mínimo 3 caracteres'),
  business_type: z.enum(['barbearia', 'salao_de_beleza', 'clinica_estetica', 'clinica_saude', 'spa', 'outros'], {
    errorMap: () => ({ message: 'Selecione o tipo de negócio' }),
  }),
  timezone: z.string().default('America/Sao_Paulo'),
  currency: z.string().default('BRL'),
  team_size: z.enum(['1', '2-5', '6-10', '10+'], {
    errorMap: () => ({ message: 'Selecione o tamanho da equipe' }),
  }),
  slug: z.string().min(3, 'Slug deve ter no mínimo 3 caracteres'),

  // Controle de plano / trial
  plan_type: z.enum(['FREE', 'TRIAL']).default('FREE'),
  referral_code: z.string().optional(),
  coupon_code: z.string().optional(),
})

type RegisterForm = z.infer<typeof registerSchema>

// Helper simples para gerar slug no frontend (baseado no backend slugify)
const slugify = (text: string) => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[-\s]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [companyDomainPreview, setCompanyDomainPreview] = useState<string>('')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const watchedCompanyName = watch('company_name')
  const watchedSlug = watch('slug')
  const watchedPlanType = watch('plan_type')

  // Atualiza slug automaticamente ao digitar o nome da empresa (se usuário não editar manualmente)
  useEffect(() => {
    if (!watchedCompanyName) {
      setValue('slug', '')
      setCompanyDomainPreview('')
      return
    }

    const autoSlug = slugify(watchedCompanyName)
    // Só sobrescrever slug se o usuário ainda não alterou manualmente para algo totalmente diferente
    if (!watchedSlug || watchedSlug === slugify(watchedSlug)) {
      setValue('slug', autoSlug)
    }

    setCompanyDomainPreview(autoSlug ? `${autoSlug}.saas.com` : '')
  }, [watchedCompanyName, watchedSlug, setValue])

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      // Monta payload exatamente como o backend espera
      const payload = {
        name: data.full_name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        company_name: data.company_name,
        business_type: data.business_type,
        timezone: data.timezone || 'America/Sao_Paulo',
        currency: data.currency || 'BRL',
        team_size: data.team_size,
        slug: data.slug,
        plan_type: data.plan_type,
        // trial_end_date é calculada no backend (NOW() + 14 dias)
        trial_end_date: null,
        referral_code: data.referral_code || null,
        coupon_code: data.coupon_code || null,
      }

      await authService.register(payload)
      toast.success('Empresa criada com sucesso. Vamos configurar profissionais, serviços e agenda.')
      router.push('/onboarding')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Criar Conta</h1>
            <p className="text-gray-600 mt-2">Cadastre sua empresa para começar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* DADOS DO USUÁRIO - CAMPOS EXISTENTES */}
            <div>
              <label className="block text-sm font-medium mb-2">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input {...register('full_name')} type="text" className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary" placeholder="Seu nome" />
              </div>
              {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input {...register('email')} type="email" className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary" placeholder="seu@email.com" />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input {...register('phone')} type="tel" className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary" placeholder="(11) 99999-9999" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input {...register('password')} type="password" className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary" placeholder="••••••••" />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            {/* DADOS DA EMPRESA */}
            <div className="pt-4 border-t border-gray-200">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Dados da Empresa
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Empresa</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('company_name')}
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="Ex.: Minha Empresa"
                    />
                  </div>
                  {errors.company_name && <p className="mt-1 text-sm text-red-600">{errors.company_name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Negócio</label>
                  <select
                    {...register('business_type')}
                    className="w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary bg-white"
                    defaultValue=""
                  >
                    <option value="" disabled>Selecione...</option>
                    <option value="barbearia">Barbearia</option>
                    <option value="salao_de_beleza">Salão de beleza</option>
                    <option value="clinica_estetica">Clínica de estética</option>
                    <option value="clinica_saude">Clínica de saúde</option>
                    <option value="spa">Spa</option>
                    <option value="outros">Outros</option>
                  </select>
                  {errors.business_type && <p className="mt-1 text-sm text-red-600">{errors.business_type.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Slug da Empresa</label>
                  <div className="flex gap-2 items-center">
                    <input
                      {...register('slug')}
                      type="text"
                      className="w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="minhaempresa"
                    />
                  </div>
                  {companyDomainPreview && (
                    <p className="mt-1 text-xs text-gray-500">
                      Domínio sugerido: <span className="font-mono">{companyDomainPreview}</span>
                    </p>
                  )}
                  {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Fuso Horário</label>
                    <div className="relative">
                      <Globe2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        {...register('timezone')}
                        defaultValue="America/Sao_Paulo"
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary bg-white"
                      >
                        <option value="America/Sao_Paulo">America/Sao_Paulo (Brasil)</option>
                        <option value="America/Buenos_Aires">America/Buenos_Aires</option>
                        <option value="America/Mexico_City">America/Mexico_City</option>
                        <option value="Europe/Lisbon">Europe/Lisbon</option>
                      </select>
                    </div>
                    {errors.timezone && <p className="mt-1 text-sm text-red-600">{errors.timezone.message as string}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Moeda</label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        {...register('currency')}
                        defaultValue="BRL"
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary bg-white"
                      >
                        <option value="BRL">BRL - Real Brasileiro</option>
                        <option value="USD">USD - Dólar</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                    </div>
                    {errors.currency && <p className="mt-1 text-sm text-red-600">{errors.currency.message as string}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tamanho da Equipe</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      {...register('team_size')}
                      defaultValue=""
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary bg-white"
                    >
                      <option value="" disabled>Selecione...</option>
                      <option value="1">Somente eu</option>
                      <option value="2-5">2–5 pessoas</option>
                      <option value="6-10">6–10 pessoas</option>
                      <option value="10+">10+ pessoas</option>
                    </select>
                  </div>
                  {errors.team_size && <p className="mt-1 text-sm text-red-600">{errors.team_size.message}</p>}
                </div>
              </div>
            </div>

            {/* PLANO / TRIAL */}
            <div className="pt-4 border-t border-gray-200">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Plano e Teste Grátis
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className={`border rounded-lg p-3 cursor-pointer transition-all ${watchedPlanType === 'FREE' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/60'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="radio"
                        value="FREE"
                        {...register('plan_type')}
                        className="text-primary"
                      />
                      <span className="font-semibold">Plano FREE</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Ideal para começar sem compromisso, com recursos básicos de agenda.
                    </p>
                  </label>

                  <label className={`border rounded-lg p-3 cursor-pointer transition-all ${watchedPlanType === 'TRIAL' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/60'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="radio"
                        value="TRIAL"
                        {...register('plan_type')}
                        className="text-primary"
                      />
                      <span className="font-semibold">Trial 14 dias</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Teste todos os recursos PRO por 14 dias, sem cartão de crédito.
                    </p>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Código de Indicação / Afiliado (opcional)</label>
                    <input
                      {...register('referral_code')}
                      type="text"
                      className="w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="Ex.: PARCEIRO123"
                    />
                    {errors.referral_code && <p className="mt-1 text-sm text-red-600">{errors.referral_code.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cupom Promocional (opcional)</label>
                    <input
                      {...register('coupon_code')}
                      type="text"
                      className="w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="Ex.: PROMO2025"
                    />
                    {errors.coupon_code && <p className="mt-1 text-sm text-red-600">{errors.coupon_code.message}</p>}
                  </div>
                </div>

                {/* Resumo do plano e trial */}
                <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 p-4 text-sm text-gray-700">
                  <p className="font-semibold mb-1">Resumo da assinatura</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Plano selecionado: <span className="font-medium">
                        {watchedPlanType === 'TRIAL' ? 'Trial 14 dias (Plano PRO)' : 'FREE (recursos básicos)'}
                      </span>
                    </li>
                    <li>Período de teste grátis: 14 dias a partir da criação da conta.</li>
                    <li>Você poderá alterar de plano a qualquer momento nas configurações da empresa.</li>
                  </ul>
                </div>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg disabled:opacity-50">
              {isLoading ? 'Criando...' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Já tem conta? <a href="/login" className="text-primary hover:underline font-semibold">Fazer login</a>
          </div>
        </div>
      </div>
    </div>
  )
}
