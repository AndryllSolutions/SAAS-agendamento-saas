/**
 * Diagnostic script to test authentication and page loading
 * Run in browser console to diagnose issues
 */

console.log('=== DIAGNOSTICO DE AUTENTICACAO ===');
console.log('');

// 1. Check localStorage tokens
console.log('1. TOKENS NO LOCALSTORAGE:');
const accessToken = localStorage.getItem('access_token');
const refreshToken = localStorage.getItem('refresh_token');
console.log('  - access_token:', accessToken ? 'Presente' : 'AUSENTE');
console.log('  - refresh_token:', refreshToken ? 'Presente' : 'AUSENTE');

// 2. Check authStore (Zustand)
console.log('');
console.log('2. AUTH STORE (ZUSTAND):');
const authStorage = localStorage.getItem('auth-storage');
if (authStorage) {
  try {
    const authData = JSON.parse(authStorage);
    console.log('  - user:', authData?.state?.user ? 'Presente' : 'AUSENTE');
    console.log('  - accessToken:', authData?.state?.accessToken ? 'Presente' : 'AUSENTE');
    console.log('  - refreshToken:', authData?.state?.refreshToken ? 'Presente' : 'AUSENTE');
    console.log('  - isAuthenticated:', authData?.state?.isAuthenticated);
    
    // Decode and check token expiry
    if (authData?.state?.accessToken) {
      try {
        const base64Url = authData.state.accessToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        const exp = new Date(payload.exp * 1000);
        const now = new Date();
        const isExpired = now >= exp;
        const timeLeft = Math.floor((exp - now) / 1000 / 60);
        
        console.log('  - Token expira em:', exp.toLocaleString());
        console.log('  - Token expirado:', isExpired ? 'SIM (PROBLEMA!)' : 'NAO');
        console.log('  - Tempo restante:', timeLeft, 'minutos');
      } catch (e) {
        console.error('  - Erro ao decodificar token:', e.message);
      }
    }
  } catch (e) {
    console.error('  - Erro ao parsear authStorage:', e.message);
  }
} else {
  console.log('  - AUSENTE (usuario nao autenticado)');
}

// 3. Test API connectivity
console.log('');
console.log('3. TESTANDO CONECTIVIDADE COM API:');

const apiUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
console.log('  - API URL:', apiUrl);

// Test /users/me endpoint
fetch(`${apiUrl}/api/v1/users/me`, {
  headers: {
    'Authorization': `Bearer ${accessToken || authData?.state?.accessToken}`,
    'ngrok-skip-browser-warning': 'true'
  }
})
.then(response => {
  console.log('  - GET /users/me:', response.status, response.statusText);
  if (response.status === 401) {
    console.warn('    PROBLEMA: Token invalido ou expirado!');
  } else if (response.status === 200) {
    console.log('    OK: Autenticacao funcionando');
  }
  return response.json();
})
.then(data => {
  console.log('  - Usuario:', data);
})
.catch(error => {
  console.error('  - ERRO:', error.message);
});

// 4. Check CORS
console.log('');
console.log('4. CONFIGURACAO CORS:');
console.log('  - Origin:', window.location.origin);
console.log('  - Protocolo:', window.location.protocol);

// 5. Check network performance
console.log('');
console.log('5. PERFORMANCE DE REDE:');
if (performance && performance.getEntriesByType) {
  const resources = performance.getEntriesByType('resource');
  const apiCalls = resources.filter(r => r.name.includes('/api/'));
  
  if (apiCalls.length > 0) {
    const avgDuration = apiCalls.reduce((sum, r) => sum + r.duration, 0) / apiCalls.length;
    const maxDuration = Math.max(...apiCalls.map(r => r.duration));
    const minDuration = Math.min(...apiCalls.map(r => r.duration));
    
    console.log('  - Chamadas API:', apiCalls.length);
    console.log('  - Tempo medio:', Math.round(avgDuration), 'ms');
    console.log('  - Tempo maximo:', Math.round(maxDuration), 'ms');
    console.log('  - Tempo minimo:', Math.round(minDuration), 'ms');
    
    if (avgDuration > 1000) {
      console.warn('    ATENCAO: Tempo medio muito alto (>1s)');
    }
  } else {
    console.log('  - Nenhuma chamada API encontrada no cache de performance');
  }
}

console.log('');
console.log('=== FIM DO DIAGNOSTICO ===');
console.log('');
console.log('RECOMENDACOES:');
console.log('- Se token estiver expirado, faca logout e login novamente');
console.log('- Se GET /users/me retornar 401, ha problema de autenticacao');
console.log('- Se tempo medio > 1s, ha problema de performance de rede');
