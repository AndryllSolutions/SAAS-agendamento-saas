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

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true)

      const response = await authService.login(data.email, data.password)
      const userData = response.data

      setAuth({
        id: userData.user.id,
        email: userData.user.email,
        full_name: userData.user.full_name,
        role: userData.user.role,
        saas_role: userData.user.saas_role,
        company_role: userData.user.company_role,
        company_id: userData.user.company_id,
      }, userData.access_token, userData.refresh_token)

      // Salvar credenciais se "lembrar de mim" estiver marcado
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', data.email)
        localStorage.setItem('rememberedPassword', data.password)
      } else {
        localStorage.removeItem('rememberedEmail')
        localStorage.removeItem('rememberedPassword')
      }

      toast.success('✅ Login realizado com sucesso!')

      // Redirecionar baseado no papel do usuário
      const role = userData.user.role?.toUpperCase() || ''
      const saasRole = userData.user.saas_role?.toUpperCase() || ''

      if (saasRole === 'SAAS_OWNER' || saasRole === 'SAAS_STAFF') {
        router.replace('/saas-admin')
      } else if (role === 'OWNER' || role === 'MANAGER' || role === 'SAAS_ADMIN' || role === 'ADMIN') {
        router.replace('/dashboard')
      } else if (role === 'PROFESSIONAL' || role === 'RECEPTIONIST') {
        router.replace('/appointments')
      } else {
        router.replace('/dashboard')
      }
    } catch (error: any) {
      console.error('Erro no login:', error)
      toast.error(error.response?.data?.detail || 'Email ou senha incorretos')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
            <Calendar className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Acessar sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Entre com suas credenciais para acessar o sistema
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className="appearance-none relative block w-full px-3 py-2 pl-10 pr-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="seu@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="appearance-none relative block w-full px-3 py-2 pl-10 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Lembrar de mim
              </label>
            </div>

            <div className="text-sm">
              <a href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Esqueceu a senha?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Cadastre-se
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
