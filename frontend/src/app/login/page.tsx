'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Calendar, Lock, Mail, Eye, EyeOff } from 'lucide-react'

import { authService } from '@/services/api'
import { useAuthStore } from '@/store/authStore'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Verificar se há credenciais salvas e marcar checkbox
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('rememberedEmail')
      const savedPassword = localStorage.getItem('rememberedPassword')
      if (savedEmail && savedPassword) {
        setRememberMe(true)
      }
    }
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  })

  // Carregar credenciais salvas
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('rememberedEmail')
      const savedPassword = localStorage.getItem('rememberedPassword')
      if (savedEmail && savedPassword) {
        setValue('email', savedEmail)
        setValue('password', savedPassword)
      }
    }
  }, [setValue])

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
  
    try {
      console.log('🔐 Iniciando login...', data.email);
      const response = await authService.login(data.email, data.password)
      console.log('✅ Login response recebida:', response.status);
      
      const { access_token, refresh_token, user: userData } = response.data
      
      // SALVAR TOKEN NO LOCALSTORAGE (para compatibilidade com interceptor)
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      // Usar dados do usuário retornados pelo login (inclui company_id)
      let user = userData;
      
      // Se não vier user na resposta, buscar do endpoint /me
      if (!user) {
        try {
          const userResponse = await authService.getCurrentUser()
          user = userResponse.data
          console.log('✅ Dados do usuário carregados via /me:', user);
        } catch (userError: any) {
          console.warn('⚠️ Erro ao buscar dados do usuário:', userError);
          throw new Error('Não foi possível obter os dados do usuário')
        }
      } else {
        console.log('✅ Dados do usuário recebidos no login:', user);
      }
  
      // Salvar credenciais se lembrar-me estiver marcado
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', data.email)
        localStorage.setItem('rememberedPassword', data.password)
      } else {
        localStorage.removeItem('rememberedEmail')
        localStorage.removeItem('rememberedPassword')
      }
      
      // Salvar no authStore
      setAuth(user, access_token, refresh_token)
      
      console.log('✅ Login completo! Redirecionando...');
      toast.success('Login realizado com sucesso!')
      
      // Redirecionar baseado em saas_role primeiro, depois role
      const saasRole = user?.saas_role?.toUpperCase() || ''
      const role = user?.role?.toUpperCase() || ''
      
      if (saasRole === 'SAAS_OWNER' || saasRole === 'SAAS_STAFF') {
        console.log('🔴 Redirecionando para /saas-admin (SaaS Admin)');
        router.push('/saas-admin')
      } else if (role === 'OWNER' || role === 'MANAGER' || role === 'ADMIN') {
        console.log('🟢 Redirecionando para /dashboard (Company Admin)');
        router.push('/dashboard')
      } else if (role === 'PROFESSIONAL' || role === 'RECEPTIONIST') {
        console.log('🟡 Redirecionando para /appointments (Professional)');
        router.push('/appointments')
      } else {
        console.log('⚪ Redirecionando para /dashboard (Default)');
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
      toast.error(error.response?.data?.detail || error.message || 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <Calendar className="w-10 h-10 text-white" />
            <span className="text-3xl font-bold text-white">Atendo</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
            Gerencie seus agendamentos com facilidade
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Plataforma completa para gestão de salões, clínicas e estabelecimentos de beleza.
          </p>
          
          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Agenda inteligente e intuitiva</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Gestão completa de clientes e serviços</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Relatórios financeiros detalhados</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Notificações automáticas via SMS e Email</span>
            </div>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="relative z-10">
          <p className="text-white/80 italic">
            "A melhor ferramenta para transformar sua gestão de agendamentos"
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calendar className="w-8 h-8 text-indigo-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">Atendo</span>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Bem-vindo de volta!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Entre com suas credenciais para acessar o sistema
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 dark:bg-gray-700 dark:text-white transition-all duration-200"
                    placeholder="seu@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Senha
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-11 pr-12 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 dark:bg-gray-700 dark:text-white transition-all duration-200"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
                  />
                  <span className="text-gray-700 dark:text-gray-300">Lembrar-me</span>
                </label>
                <a href="/forgot-password" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Esqueceu a senha?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Não tem uma conta?{' '}
                <a href="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  Criar conta grátis
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
