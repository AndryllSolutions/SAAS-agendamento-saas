'use client'

import { useState } from 'react'
import { X, Settings, Eye, Palette, Plus, Edit2, Trash2 } from 'lucide-react'

interface AgendaColor {
  id: string
  name: string
  hex: string
  statusKey: string | null
}

interface AgendaSettings {
  slotMinutes: number
  columnWidthMode: string
  defaultStatusKey: string
  showAvatars: boolean
  filterProfessionalsByService: boolean
  blockCancelledAppointments: boolean
}

interface AgendaSettingsDrawerProps {
  isOpen: boolean
  onClose: () => void
  settings: AgendaSettings
  colors: AgendaColor[]
  onSaveSettings: (settings: AgendaSettings) => void
  onSaveColors: (colors: AgendaColor[]) => void
}

export function AgendaSettingsDrawer({
  isOpen,
  onClose,
  settings,
  colors,
  onSaveSettings,
  onSaveColors
}: AgendaSettingsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'view' | 'colors'>('view')
  const [localSettings, setLocalSettings] = useState(settings)
  const [localColors, setLocalColors] = useState(colors)
  const [editingColor, setEditingColor] = useState<AgendaColor | null>(null)
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#3B82F6')
  const [newColorStatus, setNewColorStatus] = useState('')

  if (!isOpen) return null

  const handleSave = () => {
    onSaveSettings(localSettings)
    onSaveColors(localColors)
    onClose()
  }

  const handleAddColor = () => {
    if (!newColorName.trim()) return

    const newColor: AgendaColor = {
      id: Date.now().toString(),
      name: newColorName,
      hex: newColorHex,
      statusKey: newColorStatus || null
    }

    setLocalColors([...localColors, newColor])
    setNewColorName('')
    setNewColorHex('#3B82F6')
    setNewColorStatus('')
  }

  const handleDeleteColor = (id: string) => {
    setLocalColors(localColors.filter(c => c.id !== id))
  }

  const handleUpdateColor = (id: string, updates: Partial<AgendaColor>) => {
    setLocalColors(localColors.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const tabs = [
    { id: 'general' as const, label: 'Geral', icon: Settings },
    { id: 'view' as const, label: 'Visualização', icon: Eye },
    { id: 'colors' as const, label: 'Cores', icon: Palette },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Configurações da Agenda</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab Geral */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Importante:</strong> as configurações se aplicam a todo o sistema e afetam todos os usuários.
                </p>
              </div>

              <div className="flex items-center justify-between py-4 border border-gray-200 rounded-lg px-4">
                <div>
                  <p className="font-medium text-gray-900">Filtrar profissionais por serviço</p>
                  <p className="text-sm text-gray-600">Ao selecionar um serviço, mostrar apenas profissionais habilitados</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.filterProfessionalsByService}
                    onChange={(e) => setLocalSettings({ ...localSettings, filterProfessionalsByService: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-4 border border-gray-200 rounded-lg px-4">
                <div>
                  <p className="font-medium text-gray-900">Bloquear horários com agendamento cancelado</p>
                  <p className="text-sm text-gray-600">Define se horários cancelados ficam bloqueados na agenda</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.blockCancelledAppointments}
                    onChange={(e) => setLocalSettings({ ...localSettings, blockCancelledAppointments: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* Tab Visualização */}
          {activeTab === 'view' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Largura das colunas da agenda
                </label>
                <select
                  value={localSettings.columnWidthMode}
                  onChange={(e) => setLocalSettings({ ...localSettings, columnWidthMode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="auto">Todos</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visualização da agenda
                </label>
                <select
                  value={localSettings.slotMinutes}
                  onChange={(e) => setLocalSettings({ ...localSettings, slotMinutes: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="5">5 minutos</option>
                  <option value="10">10 minutos</option>
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="60">60 minutos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status padrão
                </label>
                <select
                  value={localSettings.defaultStatusKey}
                  onChange={(e) => setLocalSettings({ ...localSettings, defaultStatusKey: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="confirmed">Confirmado</option>
                  <option value="pending">Não confirmado</option>
                  <option value="pending">Aguardando</option>
                  <option value="cancelled">Cancelado</option>
                  <option value="completed">Faturado</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-4 border-t border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Exibir avatares</p>
                  <p className="text-sm text-gray-600">Mostrar foto dos profissionais nas colunas</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showAvatars}
                    onChange={(e) => setLocalSettings({ ...localSettings, showAvatars: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* Tab Cores */}
          {activeTab === 'colors' && (
            <div className="space-y-6">
              {/* Tabela de Cores */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Nome</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Cor</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {localColors.map((color) => (
                      <tr key={color.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={color.name}
                            onChange={(e) => handleUpdateColor(color.id, { name: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={color.hex}
                              onChange={(e) => handleUpdateColor(color.id, { hex: e.target.value })}
                              className="h-8 w-16 rounded border border-gray-300 cursor-pointer"
                            />
                            <span className="text-sm text-gray-600">{color.hex}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={color.statusKey || ''}
                            onChange={(e) => handleUpdateColor(color.id, { statusKey: e.target.value || null })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="">Nenhum</option>
                            <option value="confirmed">Confirmado</option>
                            <option value="pending">Pendente</option>
                            <option value="cancelled">Cancelado</option>
                            <option value="completed">Concluído</option>
                            <option value="checked_in">Check In</option>
                            <option value="in_progress">Em atendimento</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteColor(color.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Adicionar Nova Cor */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">+ Criar cor</h3>
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Nome da cor"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <button
                    onClick={handleAddColor}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
