/**
 * usePushNotifications Hook
 * 
 * Hook customizado para gerenciar Web Push Notifications facilmente.
 * 
 * Uso:
 * ```tsx
 * const { isSupported, isEnabled, enable, disable, sendTest } = usePushNotifications();
 * 
 * return (
 *   <button onClick={enable}>Ativar Notificações</button>
 * );
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { pushNotificationService } from '@/services/pushNotificationService';

interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  isEnabled: boolean;
  isLoading: boolean;
  enable: () => Promise<boolean>;
  disable: () => Promise<boolean>;
  sendTest: () => Promise<boolean>;
  requestPermission: () => Promise<NotificationPermission>;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar suporte e status ao montar
  useEffect(() => {
    const checkStatus = () => {
      const supported = pushNotificationService.isSupported();
      setIsSupported(supported);

      if (supported) {
        const currentPermission = pushNotificationService.getPermissionStatus();
        setPermission(currentPermission);
        setIsEnabled(currentPermission === 'granted');
      }
    };

    checkStatus();

    // Listener para mudanças de permissão (alguns navegadores suportam)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Ativar notificações
  const enable = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    setIsLoading(true);

    try {
      const success = await pushNotificationService.initialize();

      if (success) {
        setPermission('granted');
        setIsEnabled(true);
      }

      return success;
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Desativar notificações
  const disable = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);

    try {
      const success = await pushNotificationService.unsubscribe();

      if (success) {
        setIsEnabled(false);
        setPermission('default');
      }

      return success;
    } catch (error) {
      console.error('Error disabling push notifications:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enviar notificação de teste
  const sendTest = useCallback(async (): Promise<boolean> => {
    if (!isEnabled) {
      console.warn('Push notifications not enabled');
      return false;
    }

    try {
      return await pushNotificationService.sendTestNotification();
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }, [isEnabled]);

  // Solicitar permissão manualmente
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      return 'denied';
    }

    try {
      const newPermission = await pushNotificationService.requestPermission();
      setPermission(newPermission);
      return newPermission;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return 'denied';
    }
  }, [isSupported]);

  return {
    isSupported,
    permission,
    isEnabled,
    isLoading,
    enable,
    disable,
    sendTest,
    requestPermission
  };
};

export default usePushNotifications;
