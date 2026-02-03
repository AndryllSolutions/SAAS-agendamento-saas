/**
 * Push Notification Manager Component
 * 
 * Componente para gerenciar Web Push Notifications.
 * 
 * Uso:
 * - Adicionar no App.tsx ou layout principal
 * - Solicita permissão automaticamente ao carregar
 * - Mostra botão para ativar/desativar notificações
 */

import React, { useState, useEffect } from 'react';
import { pushNotificationService } from '@/services/pushNotificationService';

interface PushNotificationManagerProps {
  autoRequest?: boolean; // Solicitar permissão automaticamente
  showButton?: boolean; // Mostrar botão de ativar/desativar
}

const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({
  autoRequest = false,
  showButton = true
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar suporte e permissão ao carregar
  useEffect(() => {
    const checkSupport = async () => {
      const supported = pushNotificationService.isSupported();
      setIsSupported(supported);

      if (supported) {
        const currentPermission = pushNotificationService.getPermissionStatus();
        setPermission(currentPermission);
        setIsEnabled(currentPermission === 'granted');

        // Auto-request se configurado
        if (autoRequest && currentPermission === 'default') {
          await handleEnableNotifications();
        }
      }
    };

    checkSupport();
  }, [autoRequest]);

  // Habilitar notificações
  const handleEnableNotifications = async () => {
    setIsLoading(true);

    try {
      const success = await pushNotificationService.initialize();

      if (success) {
        setPermission('granted');
        setIsEnabled(true);
        
        // Mostrar notificação de sucesso (opcional)
        if (window.Notification && Notification.permission === 'granted') {
          new Notification('Notificações Ativadas! 🎉', {
            body: 'Você receberá alertas importantes sobre seus agendamentos.',
            icon: '/logo.png'
          });
        }
      } else {
        console.warn('Failed to enable push notifications');
      }
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      alert('Erro ao ativar notificações. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Desabilitar notificações
  const handleDisableNotifications = async () => {
    setIsLoading(true);

    try {
      await pushNotificationService.unsubscribe();
      setIsEnabled(false);
      setPermission('default');
    } catch (error) {
      console.error('Error disabling push notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Testar notificação
  const handleTestNotification = async () => {
    if (!isEnabled) {
      alert('Por favor, ative as notificações primeiro.');
      return;
    }

    try {
      const success = await pushNotificationService.sendTestNotification();
      
      if (success) {
        alert('Notificação de teste enviada! Verifique se apareceu.');
      } else {
        alert('Falha ao enviar notificação de teste.');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert('Erro ao enviar notificação de teste.');
    }
  };

  // Não renderizar nada se não houver suporte
  if (!isSupported) {
    return null;
  }

  // Não renderizar botão se showButton = false
  if (!showButton) {
    return null;
  }

  return (
    <div className="push-notification-manager">
      {permission === 'default' && (
        <div className="alert alert-info">
          <p>
            <strong>Quer receber notificações?</strong>
          </p>
          <p>
            Ative as notificações para receber alertas sobre agendamentos, lembretes e atualizações importantes.
          </p>
          <button
            onClick={handleEnableNotifications}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Ativando...' : 'Ativar Notificações'}
          </button>
        </div>
      )}

      {permission === 'granted' && isEnabled && (
        <div className="notification-controls">
          <div className="status">
            <span className="badge badge-success">Notificações Ativadas</span>
          </div>
          
          <div className="actions">
            <button
              onClick={handleTestNotification}
              className="btn btn-sm btn-outline-primary"
            >
              Testar Notificação
            </button>
            
            <button
              onClick={handleDisableNotifications}
              disabled={isLoading}
              className="btn btn-sm btn-outline-secondary"
            >
              Desativar
            </button>
          </div>
        </div>
      )}

      {permission === 'denied' && (
        <div className="alert alert-warning">
          <p>
            <strong>Notificações bloqueadas</strong>
          </p>
          <p>
            Para receber notificações, você precisa permitir nas configurações do navegador.
          </p>
          <details>
            <summary>Como permitir?</summary>
            <ul>
              <li><strong>Chrome/Edge:</strong> Clique no cadeado ao lado da URL → Configurações do site → Notificações → Permitir</li>
              <li><strong>Firefox:</strong> Clique no ícone de informações → Permissões → Notificações → Permitir</li>
              <li><strong>Safari:</strong> Safari → Preferências → Sites → Notificações → Permitir</li>
            </ul>
          </details>
        </div>
      )}

      <style jsx>{`
        .push-notification-manager {
          margin: 1rem 0;
        }

        .alert {
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .alert-info {
          background-color: #e7f3ff;
          border: 1px solid #b3d9ff;
          color: #004085;
        }

        .alert-warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
        }

        .notification-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          background-color: #f8f9fa;
          border-radius: 0.5rem;
        }

        .badge {
          padding: 0.35rem 0.65rem;
          font-size: 0.875rem;
          border-radius: 0.25rem;
        }

        .badge-success {
          background-color: #28a745;
          color: white;
        }

        .actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background-color: #007bff;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
        }

        .btn-outline-primary {
          background-color: transparent;
          color: #007bff;
          border: 1px solid #007bff;
        }

        .btn-outline-primary:hover:not(:disabled) {
          background-color: #007bff;
          color: white;
        }

        .btn-outline-secondary {
          background-color: transparent;
          color: #6c757d;
          border: 1px solid #6c757d;
        }

        .btn-outline-secondary:hover:not(:disabled) {
          background-color: #6c757d;
          color: white;
        }

        details {
          margin-top: 0.5rem;
        }

        summary {
          cursor: pointer;
          color: #007bff;
          font-weight: 500;
        }

        ul {
          margin-top: 0.5rem;
          padding-left: 1.5rem;
        }

        li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default PushNotificationManager;
