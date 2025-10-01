'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { usePermissions } from '@/hooks/usePermissions'
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  Users,
  DollarSign,
  Star,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  CalendarCheck,
  ShoppingBag,
  TrendingUp
} from 'lucide-react'
import { useState } from 'react'

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const permissions = usePermissions()
  const [isOpen, setIsOpen] = useState(false)

  const getRoleBadge = (role: string) => {
    const badges: any = {
      admin: { label: 'Admin', color: 'bg-red-500' },
      manager: { label: 'Gerente', color: 'bg-blue-500' },
      professional: { label: 'Profissional', color: 'bg-green-500' },
      client: { label: 'Cliente', color: 'bg-purple-500' },
    }
    return badges[role] || badges.client
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', show: permissions.canViewDashboard() },
    { icon: CalendarCheck, label: 'Meus Agendamentos', href: '/appointments', show: true },
    { icon: Calendar, label: 'Agenda', href: '/calendar', show: permissions.canViewCalendar() },
    { icon: Briefcase, label: 'Serviços', href: '/services', show: permissions.canManageServices() },
    { icon: Users, label: 'Profissionais', href: '/professionals', show: permissions.canManageUsers() },
    { icon: Users, label: 'Usuários', href: '/users', show: permissions.canManageUsers() },
    { icon: DollarSign, label: 'Pagamentos', href: '/payments', show: permissions.canManagePayments() },
    { icon: TrendingUp, label: 'Relatórios', href: '/reports', show: permissions.canManagePayments() },
    { icon: Star, label: 'Avaliações', href: '/reviews', show: permissions.canViewReviews() },
    { icon: Bell, label: 'Notificações', href: '/notifications', show: true },
    { icon: Settings, label: 'Configurações', href: '/settings', show: true },
  ]

  const filteredMenu = menuItems.filter(item => item.show)
  
  const roleBadge = getRoleBadge(user?.role || 'client')

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-primary">Agendamento</h1>
            <p className="text-sm text-gray-600">SaaS Platform</p>
          </div>

          {/* User Info */}
          <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate text-gray-900">{user?.full_name}</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white ${roleBadge.color} mt-1`}>
                  {roleBadge.label}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {filteredMenu.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
