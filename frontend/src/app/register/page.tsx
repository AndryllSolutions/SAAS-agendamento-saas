'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Calendar, Lock, Mail, User, Phone } from 'lucide-react'
import { authService } from '@/services/api'

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  full_name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  phone: z.string().optional(),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      await authService.register({ ...data, role: 'client', company_id: 1 })
      toast.success('Conta criada! Faça login para continuar.')
      router.push('/login')
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
            <p className="text-gray-600 mt-2">Cadastre-se para começar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
