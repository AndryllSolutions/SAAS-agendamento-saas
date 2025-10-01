'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Calendar, Lock, Mail } from 'lucide-react'

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
  
    try {
      const response = await authService.login(data.email, data.password)
      const { access_token, refresh_token } = response.data
  
      // SALVAR TOKEN PRIMEIRO!
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
  
      // Agora buscar usuário
      const userResponse = await authService.getCurrentUser()
      const user = userResponse.data
  
      setAuth(user, access_token, refresh_token)
      
      toast.success('Login realizado com sucesso!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Agendamento SaaS
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Faça login para continuar
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="seu@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('password')}
                  type="password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <a href="/forgot-password" className="hover:text-primary">
              Esqueceu sua senha?
            </a>
            <span className="mx-2">•</span>
            <a href="/register" className="hover:text-primary">
              Criar conta
            </a>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              🎭 Usuários Demo
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Clique para preencher automaticamente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Admin */}
            <button
              type="button"
              onClick={() => {
                const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement
                const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement
                if (emailInput && passwordInput) {
                  emailInput.value = 'admin@demo.com'
                  passwordInput.value = 'demo123'
                  emailInput.dispatchEvent(new Event('input', { bubbles: true }))
                  passwordInput.dispatchEvent(new Event('input', { bubbles: true }))
                }
              }}
              className="p-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg text-left transition-colors border-2 border-transparent hover:border-red-500"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🔴</span>
                <span className="font-bold text-red-700 dark:text-red-400">Admin</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">admin@demo.com</p>
              <p className="text-xs text-gray-500">Acesso total ao sistema</p>
            </button>

            {/* Gerente */}
            <button
              type="button"
              onClick={() => {
                const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement
                const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement
                if (emailInput && passwordInput) {
                  emailInput.value = 'gerente@demo.com'
                  passwordInput.value = 'demo123'
                  emailInput.dispatchEvent(new Event('input', { bubbles: true }))
                  passwordInput.dispatchEvent(new Event('input', { bubbles: true }))
                }
              }}
              className="p-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg text-left transition-colors border-2 border-transparent hover:border-blue-500"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🔵</span>
                <span className="font-bold text-blue-700 dark:text-blue-400">Gerente</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">gerente@demo.com</p>
              <p className="text-xs text-gray-500">Gestão e relatórios</p>
            </button>

            {/* Profissional */}
            <button
              type="button"
              onClick={() => {
                const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement
                const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement
                if (emailInput && passwordInput) {
                  emailInput.value = 'profissional@demo.com'
                  passwordInput.value = 'demo123'
                  emailInput.dispatchEvent(new Event('input', { bubbles: true }))
                  passwordInput.dispatchEvent(new Event('input', { bubbles: true }))
                }
              }}
              className="p-3 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded-lg text-left transition-colors border-2 border-transparent hover:border-green-500"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🟢</span>
                <span className="font-bold text-green-700 dark:text-green-400">Profissional</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">profissional@demo.com</p>
              <p className="text-xs text-gray-500">Agenda e atendimentos</p>
            </button>

            {/* Cliente */}
            <button
              type="button"
              onClick={() => {
                const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement
                const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement
                if (emailInput && passwordInput) {
                  emailInput.value = 'cliente@demo.com'
                  passwordInput.value = 'demo123'
                  emailInput.dispatchEvent(new Event('input', { bubbles: true }))
                  passwordInput.dispatchEvent(new Event('input', { bubbles: true }))
                }
              }}
              className="p-3 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 rounded-lg text-left transition-colors border-2 border-transparent hover:border-purple-500"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🟣</span>
                <span className="font-bold text-purple-700 dark:text-purple-400">Cliente</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">cliente@demo.com</p>
              <p className="text-xs text-gray-500">Fazer agendamentos</p>
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              🔑 Senha para todos: <span className="font-mono font-bold">demo123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
