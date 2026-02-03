'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle, XCircle, RefreshCw, Smartphone, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { whatsappService, WhatsAppProvider } from '@/services/whatsappService'

export default function WhatsAppSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [connected, setConnected] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showQRCode, setShowQRCode] = useState(false)
  const [provider, setProvider] = useState<WhatsAppProvider | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const providerData = await whatsappService.getProvider()
      setProvider(providerData)
      setConnected(providerData.is_connected)
      setPhoneNumber(providerData.settings?.phone_number || '')
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error)
      toast.error('Erro ao carregar configurações')
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = () => {
    setShowQRCode(true)
  }

  const handleDisconnect = async () => {
    if (!confirm('Deseja realmente desconectar o WhatsApp?')) return

    try {
      setSaving(true)
      if (provider) {
        await whatsappService.updateProvider(provider.id, { is_connected: false })
      }
      setConnected(false)
      toast.success('WhatsApp desconectado!')
      loadSettings()
    } catch (error: any) {
      console.error('Erro ao desconectar:', error)
      toast.error('Erro ao desconectar WhatsApp')
    } finally {
      setSaving(false)
    }
  }

  const handleSavePhone = async () => {
    try {
      setSaving(true)
      if (provider) {
        await whatsappService.updateProvider(provider.id, {
          settings: { ...provider.settings, phone_number: phoneNumber }
        })
      }
      toast.success('Número salvo com sucesso!')
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar número')
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    try {
      setSaving(true)
      const status = await whatsappService.checkConnection()
      setConnected(status.connected)
      toast.success(status.connected ? 'Conexão está ativa!' : 'Conexão falhou')
    } catch (error: any) {
      console.error('Erro ao testar conexão:', error)
      toast.error('Erro ao testar conexão')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configurações do WhatsApp
        </h1>
        <p className="text-gray-600">
          Configure o envio automático com o número do seu WhatsApp
        </p>
      </div>

      {/* Connection Status Card */}
      <div className={`border-2 rounded-lg p-6 mb-6 ${
        connected 
          ? 'border-green-300 bg-green-50' 
          : 'border-yellow-300 bg-yellow-50'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${
            connected ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            {connected ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold mb-1 ${
              connected ? 'text-green-900' : 'text-yellow-900'
            }`}>
              {connected ? 'WhatsApp Conectado' : 'WhatsApp Desconectado'}
            </h3>
            <p className={`text-sm mb-4 ${
              connected ? 'text-green-700' : 'text-yellow-700'
            }`}>
              {connected 
                ? 'Seu WhatsApp está conectado e pronto para enviar mensagens automáticas.'
                : 'Conecte seu WhatsApp para começar a enviar campanhas automáticas.'}
            </p>
            {connected ? (
              <button
                onClick={handleDisconnect}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-green-600 text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Desconectar
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleConnect}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md"
                >
                  <Smartphone className="w-5 h-5" />
                  Conectar WhatsApp
                </button>
                <button
                  onClick={handleTestConnection}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md disabled:opacity-50"
                >
                  <RefreshCw className="w-5 h-5" />
                  Testar Conexão
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Phone Number Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Número do WhatsApp
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Informe o número de WhatsApp que será usado para enviar as mensagens automáticas
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="+55 (00) 00000-0000"
          />
          <button
            onClick={handleSavePhone}
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      </div>

      {/* Provider Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Como funciona?
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>1.</strong> Clique em "Conectar WhatsApp" para gerar um QR Code
          </p>
          <p>
            <strong>2.</strong> Abra o WhatsApp no seu celular
          </p>
          <p>
            <strong>3.</strong> Vá em Configurações → Aparelhos Conectados → Conectar Aparelho
          </p>
          <p>
            <strong>4.</strong> Escaneie o QR Code exibido na tela
          </p>
          <p>
            <strong>5.</strong> Pronto! Seu WhatsApp está conectado e as campanhas automáticas começarão a funcionar
          </p>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-amber-900 mb-2">
          ⚠️ Importante
        </h3>
        <ul className="space-y-2 text-sm text-amber-800 list-disc list-inside">
          <li>Mantenha seu celular conectado à internet para garantir o funcionamento</li>
          <li>Não desconecte o aparelho pelo WhatsApp, use sempre o botão "Desconectar" aqui</li>
          <li>As mensagens serão enviadas respeitando os horários configurados em cada campanha</li>
          <li>Certifique-se de ter permissão dos clientes para enviar mensagens via WhatsApp</li>
        </ul>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <QRCodeModal onClose={() => setShowQRCode(false)} />
      )}
    </div>
  )
}

// Modal de QR Code
function QRCodeModal({ onClose }: { onClose: () => void }) {
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    // Simular conexão após 5 segundos
    const timer = setTimeout(() => {
      setConnecting(true)
      setTimeout(() => {
        toast.success('WhatsApp conectado com sucesso!')
        onClose()
      }, 2000)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Conectar WhatsApp
          </h2>
          <p className="text-sm text-gray-600">
            Escaneie o QR Code com seu celular
          </p>
        </div>

        {/* QR Code */}
        <div className="bg-gray-100 rounded-lg p-8 mb-6 flex items-center justify-center">
          {connecting ? (
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-sm text-gray-600">Conectando...</p>
            </div>
          ) : (
            <div className="w-64 h-64 bg-white border-4 border-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-2">📱</div>
                <p className="text-sm">QR Code</p>
                <p className="text-xs">(Simulado)</p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2 text-sm">
            Como escanear:
          </h4>
          <ol className="space-y-1 text-xs text-blue-800 list-decimal list-inside">
            <li>Abra o WhatsApp no seu celular</li>
            <li>Toque em Mais opções → Aparelhos conectados</li>
            <li>Toque em Conectar um aparelho</li>
            <li>Aponte seu celular para esta tela</li>
          </ol>
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
