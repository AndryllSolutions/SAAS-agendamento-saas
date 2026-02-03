/**
 * Service Worker para Web Push Notifications
 * 
 * Responsabilidades:
 * 1. Receber push messages do servidor
 * 2. Exibir notificações para o usuário
 * 3. Gerenciar cliques nas notificações
 * 4. Gerenciar fechamento de notificações
 */

// Versão do service worker (atualizar quando fizer mudanças)
const SW_VERSION = '1.0.0';

console.log('[Service Worker] Loading version:', SW_VERSION);

// ====== INSTALAÇÃO ======
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...', SW_VERSION);
  
  // Forçar ativação imediata
  self.skipWaiting();
});

// ====== ATIVAÇÃO ======
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...', SW_VERSION);
  
  // Tomar controle imediato de todas as páginas
  event.waitUntil(self.clients.claim());
});

// ====== RECEBER PUSH ======
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);
  
  // Extrair dados da notificação
  let notificationData = {
    title: 'Notificação',
    body: 'Você tem uma nova notificação',
    icon: '/logo.png',
    badge: '/badge.png',
    url: '/',
    data: {}
  };
  
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        image: payload.image,
        tag: payload.tag,
        url: payload.url || notificationData.url,
        data: payload.data || {}
      };
    } catch (e) {
      console.error('[Service Worker] Error parsing push data:', e);
      // Usar dados padrão se falhar
    }
  }
  
  // Configurações da notificação
  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    image: notificationData.image,
    tag: notificationData.tag || 'default',
    data: {
      url: notificationData.url,
      ...notificationData.data
    },
    requireInteraction: false, // Notificação não requer interação para fechar
    vibrate: [200, 100, 200], // Padrão de vibração (mobile)
    actions: [
      {
        action: 'open',
        title: 'Abrir',
        icon: '/icons/open.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/close.png'
      }
    ]
  };
  
  // Exibir notificação
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationOptions)
  );
});

// ====== CLIQUE NA NOTIFICAÇÃO ======
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);
  
  // Fechar notificação
  event.notification.close();
  
  // Obter URL da notificação
  const urlToOpen = event.notification.data.url || '/';
  const fullUrl = self.location.origin + urlToOpen;
  
  // Ação do botão
  if (event.action === 'close') {
    // Apenas fechar
    return;
  }
  
  // Abrir ou focar na janela
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Procurar janela já aberta com a URL
        for (let client of windowClients) {
          if (client.url === fullUrl && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Se não encontrou, abrir nova janela
        if (clients.openWindow) {
          return clients.openWindow(fullUrl);
        }
      })
  );
});

// ====== FECHAR NOTIFICAÇÃO ======
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed:', event);
  
  // Aqui você pode enviar analytics ou logs
  // Exemplo: fetch('/api/v1/push/analytics/closed', { method: 'POST', ... })
});

// ====== MENSAGEM DO CLIENTE ======
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Responder ao cliente
  event.ports[0].postMessage({
    version: SW_VERSION,
    status: 'ok'
  });
});

// ====== SYNC (Background Sync) ======
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

// Função auxiliar para sync
async function syncNotifications() {
  try {
    console.log('[Service Worker] Syncing notifications...');
    // Implementar lógica de sincronização se necessário
    return Promise.resolve();
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
    return Promise.reject(error);
  }
}

// ====== ERRO ======
self.addEventListener('error', (event) => {
  console.error('[Service Worker] Error:', event);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[Service Worker] Unhandled rejection:', event.reason);
});

console.log('[Service Worker] Loaded successfully', SW_VERSION);
