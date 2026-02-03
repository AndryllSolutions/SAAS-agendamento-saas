/**
 * Push Notification Service
 * 
 * Service para gerenciar Web Push Notifications no frontend.
 * 
 * Funcionalidades:
 * - Registrar service worker
 * - Solicitar permissão de notificações
 * - Criar e enviar subscription para o backend
 * - Testar notificações
 */

import api from './api';

// Interface para subscription do navegador
interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

interface PushSubscriptionData {
  endpoint: string;
  keys: PushSubscriptionKeys;
}

interface SubscribeData {
  subscription: PushSubscriptionData;
  browser?: string;
  device_name?: string;
  user_agent?: string;
}

// Classe principal
class PushNotificationService {
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private vapidPublicKey: string | null = null;

  /**
   * Verifica se o navegador suporta notificações.
   */
  public isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * Verifica o estado da permissão de notificações.
   */
  public getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Detecta o navegador atual.
   */
  private detectBrowser(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.indexOf('edge') > -1 || userAgent.indexOf('edg') > -1) {
      return 'edge';
    } else if (userAgent.indexOf('chrome') > -1 && userAgent.indexOf('edg') === -1) {
      return 'chrome';
    } else if (userAgent.indexOf('firefox') > -1) {
      return 'firefox';
    } else if (userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') === -1) {
      return 'safari';
    } else {
      return 'unknown';
    }
  }

  /**
   * Detecta o nome do device/SO.
   */
  private detectDeviceName(): string {
    const userAgent = navigator.userAgent;
    
    if (/Windows/i.test(userAgent)) {
      return 'Windows';
    } else if (/Macintosh|MacIntel|MacPPC|Mac68K/i.test(userAgent)) {
      return 'MacOS';
    } else if (/Linux/i.test(userAgent)) {
      return 'Linux';
    } else if (/Android/i.test(userAgent)) {
      return 'Android';
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      return 'iOS';
    } else {
      return 'Unknown';
    }
  }

  /**
   * Converte Uint8Array para string base64 url-safe.
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Busca a chave pública VAPID do backend.
   */
  private async getVapidPublicKey(): Promise<string> {
    if (this.vapidPublicKey) {
      return this.vapidPublicKey;
    }

    try {
      const response = await api.get('/push/vapid-public-key');
      this.vapidPublicKey = response.data.public_key;
      return this.vapidPublicKey;
    } catch (error) {
      console.error('[Push] Error fetching VAPID public key:', error);
      throw new Error('Failed to get VAPID public key');
    }
  }

  /**
   * Registra o service worker.
   */
  public async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!this.isSupported()) {
      throw new Error('Push notifications not supported');
    }

    try {
      // Registrar service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[Push] Service Worker registered:', registration);
      this.serviceWorkerRegistration = registration;

      // Aguardar service worker estar pronto
      await navigator.serviceWorker.ready;

      return registration;
    } catch (error) {
      console.error('[Push] Service Worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Solicita permissão de notificações ao usuário.
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Push notifications not supported');
    }

    const permission = await Notification.requestPermission();
    console.log('[Push] Permission status:', permission);
    
    return permission;
  }

  /**
   * Cria subscription no navegador.
   */
  private async createPushSubscription(
    registration: ServiceWorkerRegistration
  ): Promise<PushSubscription> {
    // Buscar chave VAPID
    const vapidPublicKey = await this.getVapidPublicKey();
    const convertedVapidKey = this.urlBase64ToUint8Array(vapidPublicKey);

    // Criar subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true, // Obrigatório: sempre mostrar notificação
      applicationServerKey: convertedVapidKey
    });

    console.log('[Push] Subscription created:', subscription);
    return subscription;
  }

  /**
   * Envia subscription para o backend.
   */
  private async sendSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
    // Converter subscription para formato JSON
    const subscriptionJSON = subscription.toJSON();

    const data: SubscribeData = {
      subscription: {
        endpoint: subscriptionJSON.endpoint!,
        keys: {
          p256dh: subscriptionJSON.keys!.p256dh!,
          auth: subscriptionJSON.keys!.auth!
        }
      },
      browser: this.detectBrowser(),
      device_name: this.detectDeviceName(),
      user_agent: navigator.userAgent
    };

    try {
      await api.post('/push/subscribe', data);
      console.log('[Push] Subscription sent to backend');
    } catch (error) {
      console.error('[Push] Error sending subscription to backend:', error);
      throw error;
    }
  }

  /**
   * Inicializa o sistema de push completo.
   * 
   * Passo a passo:
   * 1. Registra service worker
   * 2. Solicita permissão
   * 3. Cria subscription
   * 4. Envia para backend
   */
  public async initialize(): Promise<boolean> {
    try {
      console.log('[Push] Initializing push notifications...');

      // 1. Verificar suporte
      if (!this.isSupported()) {
        console.warn('[Push] Push notifications not supported');
        return false;
      }

      // 2. Registrar service worker
      const registration = await this.registerServiceWorker();

      // 3. Solicitar permissão
      const permission = await this.requestPermission();

      if (permission !== 'granted') {
        console.warn('[Push] Permission denied');
        return false;
      }

      // 4. Verificar se já existe subscription
      let subscription = await registration.pushManager.getSubscription();

      // 5. Criar nova subscription se não existir
      if (!subscription) {
        subscription = await this.createPushSubscription(registration);
      }

      // 6. Enviar subscription para o backend
      await this.sendSubscriptionToBackend(subscription);

      console.log('[Push] Push notifications initialized successfully');
      return true;

    } catch (error) {
      console.error('[Push] Error initializing push notifications:', error);
      return false;
    }
  }

  /**
   * Desabilita notificações (unsubscribe).
   */
  public async unsubscribe(): Promise<boolean> {
    try {
      if (!this.serviceWorkerRegistration) {
        const registration = await navigator.serviceWorker.ready;
        this.serviceWorkerRegistration = registration;
      }

      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        console.log('[Push] Unsubscribed successfully');
        return true;
      }

      return false;
    } catch (error) {
      console.error('[Push] Error unsubscribing:', error);
      return false;
    }
  }

  /**
   * Envia uma notificação de teste.
   */
  public async sendTestNotification(): Promise<boolean> {
    try {
      const response = await api.post('/push/test', {
        title: '🔔 Teste de Notificação',
        body: 'Se você está vendo isso, as notificações estão funcionando perfeitamente!',
        url: '/notifications'
      });

      return response.data.success;
    } catch (error) {
      console.error('[Push] Error sending test notification:', error);
      return false;
    }
  }

  /**
   * Lista todas as subscriptions do usuário.
   */
  public async listSubscriptions(): Promise<any[]> {
    try {
      const response = await api.get('/push/subscriptions');
      return response.data;
    } catch (error) {
      console.error('[Push] Error listing subscriptions:', error);
      return [];
    }
  }

  /**
   * Busca estatísticas de push notifications.
   */
  public async getStats(): Promise<any> {
    try {
      const response = await api.get('/push/stats');
      return response.data;
    } catch (error) {
      console.error('[Push] Error fetching stats:', error);
      return null;
    }
  }
}

// Exportar instância singleton
export const pushNotificationService = new PushNotificationService();

// Exportar classe para uso avançado
export default PushNotificationService;
