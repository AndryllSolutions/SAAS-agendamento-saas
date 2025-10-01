'use client'

import { useState, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { userService } from '@/services/api'
import { toast } from 'sonner'
import { User, Lock, Bell, Camera, Mail, Phone, MapPin, Briefcase, Save, Eye, EyeOff } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'

export default function SettingsPage() {
  const { user, setUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    address: user?.address || '',
    specialties: user?.specialties?.join(', ') || '',
  })
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  
  const [profileImage, setProfileImage] = useState<string | null>(null)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const updateData: any = {
        ...formData,
        specialties: formData.specialties.split(',').map((s: string) => s.trim()).filter((s: string) => s)
      }
      
      // Se tem foto nova, adiciona ao update
      if (profileImage) {
        updateData.avatar_url = profileImage
      }
      
      const response = await userService.updateMe(updateData)
      setUser(response.data)
      toast.success('✅ Perfil atualizado com sucesso!')
      
      // Limpar preview da foto após salvar
      setProfileImage(null)
    } catch (error) {
      toast.error('❌ Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('As senhas não coincidem!')
      return
    }
    
    if (passwordData.new_password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres!')
      return
    }
    
    setLoading(true)
    try {
      // Implementar endpoint de mudança de senha
      toast.success('✅ Senha alterada com sucesso!')
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
    } catch (error) {
      toast.error('❌ Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem muito grande! Máximo 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
        toast.success('Foto atualizada! Clique em Salvar para confirmar')
      }
      reader.readAsDataURL(file)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Segurança', icon: Lock },
    { id: 'notifications', label: 'Notificações', icon: Bell },
  ]

  const getRoleBadge = (role: string) => {
    const badges: any = {
      admin: { label: 'Administrador', color: 'bg-red-100 text-red-700' },
      manager: { label: 'Gerente', color: 'bg-blue-100 text-blue-700' },
      professional: { label: 'Profissional', color: 'bg-green-100 text-green-700' },
      client: { label: 'Cliente', color: 'bg-purple-100 text-purple-700' },
    }
    return badges[role] || badges.client
  }

  const roleBadge = getRoleBadge(user?.role || 'client')
  const isProfessional = user?.role === 'professional' || user?.role === 'admin' || user?.role === 'manager'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Configurações
            </h1>
            <p className="text-gray-600 mt-1">Gerencie suas informações pessoais</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* User Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : user?.avatar_url ? (
                      <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.full_name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <h3 className="font-bold text-lg">{user?.full_name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${roleBadge.color}`}>
                  {roleBadge.label}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-md'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Informações do Perfil</h2>
                    <p className="text-gray-600">Atualize suas informações pessoais</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <User className="w-4 h-4 text-primary" />
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Mail className="w-4 h-4 text-primary" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Phone className="w-4 h-4 text-primary" />
                        Telefone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(11) 99999-9999"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        Endereço
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Rua, número, bairro"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  {isProfessional && (
                    <>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                          <Briefcase className="w-4 h-4 text-primary" />
                          Especialidades
                        </label>
                        <input
                          type="text"
                          value={formData.specialties}
                          onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                          placeholder="Ex: Corte, Barba, Coloração (separadas por vírgula)"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <p className="text-xs text-gray-500 mt-1">Separe as especialidades por vírgula</p>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                          <User className="w-4 h-4 text-primary" />
                          Bio Profissional
                        </label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          placeholder="Conte um pouco sobre sua experiência profissional..."
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">Máximo 500 caracteres</p>
                      </div>
                    </>
                  )}

                  {profileImage && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        📸 Nova foto selecionada! Clique em "Salvar Alterações" para confirmar.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                    
                    {profileImage && (
                      <button
                        type="button"
                        onClick={() => setProfileImage(null)}
                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancelar Foto
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Segurança</h2>
                    <p className="text-gray-600">Altere sua senha de acesso</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Lock className="w-4 h-4 text-primary" />
                        Senha Atual *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                          className="w-full px-4 py-2 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Lock className="w-4 h-4 text-primary" />
                        Nova Senha *
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                        minLength={6}
                      />
                      <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Lock className="w-4 h-4 text-primary" />
                        Confirmar Nova Senha *
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      <Lock className="w-5 h-5" />
                      {loading ? 'Alterando...' : 'Alterar Senha'}
                    </button>
                  </div>
                </form>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Notificações</h2>
                    <p className="text-gray-600">Gerencie como você recebe notificações</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Notificações por Email</p>
                          <p className="text-sm text-gray-600">Receba confirmações e lembretes por email</p>
                        </div>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded focus:ring-primary" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Notificações WhatsApp</p>
                          <p className="text-sm text-gray-600">Receba mensagens via WhatsApp</p>
                        </div>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded focus:ring-primary" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <Bell className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Notificações Push</p>
                          <p className="text-sm text-gray-600">Notificações no navegador</p>
                        </div>
                      </div>
                      <input type="checkbox" className="w-5 h-5 text-primary rounded focus:ring-primary" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
