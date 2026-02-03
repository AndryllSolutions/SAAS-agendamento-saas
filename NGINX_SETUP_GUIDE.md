# 🌐 CONFIGURAÇÃO NGINX - PRODUÇÃO COMPLETA

## ✅ Script Criado: `setup-nginx.sh`

Este script configura **TUDO** que você precisa para o Nginx em produção:

### 🚀 **O Que o Script Faz:**

1. **Instalação Completa**
   - Nginx + Certbot + SSL
   - Configuração de segurança
   - Firewall automático

2. **SSL/TLS Automático**
   - Let's Encrypt gratuito
   - Renovação automática
   - Headers de segurança

3. **Proxy Reverso**
   - Frontend: porta 3001 → 443
   - Backend API: porta 8001 → 443
   - Rate limiting e proteção

4. **Segurança Avançada**
   - Rate limiting (10 req/s API, 1 req/s login)
   - Headers de segurança completos
   - Bloqueio de arquivos sensíveis
   - Firewall configurado

5. **Manutenção**
   - Script de modo manutenção
   - Página de manutenção profissional
   - Logs configurados

---

## 🔧 **Como Usar:**

### Na VPS (após deploy dos containers):
```bash
# 1. Acessar VPS
ssh root@72.62.138.239

# 2. Navegar até o projeto
cd /opt/saas/atendo

# 3. Executar setup Nginx
chmod +x setup-nginx.sh
./setup-nginx.sh seu-dominio.com admin@seu-dominio.com

# Exemplo real:
./setup-nginx.sh atendo.com contato@atendo.com
```

---

## 📋 **Pré-requisitos:**

### 1. **DNS Configurado**
   - Seu domínio deve apontar para a VPS: `72.62.138.239`
   - Registro A: `@` → `72.62.138.239`
   - Registro A: `www` → `72.62.138.239`

### 2. **Containers Rodando**
   - Frontend: porta 3001
   - Backend: porta 8001
   - Deploy já executado

---

## 🌐 **URLs Após Configuração:**

```
Frontend:     https://seu-dominio.com
API:          https://seu-dominio.com/api/
Login:        https://seu-dominio.com/api/auth/login
Uploads:      https://seu-dominio.com/api/upload
Health Check: https://seu-dominio.com/health
```

---

## 🔒 **Segurança Implementada:**

### Rate Limiting:
- **API geral**: 10 requisições/segundo
- **Login**: 1 requisição/segundo (anti-brute force)
- **Uploads**: 3 requisições/segundo

### Headers de Segurança:
- HSTS (HTTPS obrigatório)
- XSS Protection
- Content Security Policy
- Frame Options (anti-clickjacking)
- Referrer Policy

### SSL/TLS:
- TLS 1.2 e 1.3 apenas
- Certificado Let's Encrypt
- Renovação automática diária
- Configuração otimizada

---

## 🛠️ **Comandos Úteis:**

### Manutenção:
```bash
# Ativar modo manutenção
nginx-maintenance on

# Desativar modo manutenção
nginx-maintenance off
```

### Logs:
```bash
# Verificar logs de acesso
tail -f /var/log/nginx/access.log

# Verificar logs de erro
tail -f /var/log/nginx/error.log

# Verificar status do Nginx
systemctl status nginx
```

### SSL:
```bash
# Renovar certificado manualmente
certbot renew

# Verificar certificado
certbot certificates

# Testar configuração SSL
openssl s_client -connect seu-dominio.com:443
```

---

## 📊 **Monitoramento:**

### Health Checks:
- **Nginx**: Verificação HTTP
- **SSL**: Renovação automática
- **Containers**: Via docker-compose

### Logs Centralizados:
- **Access**: `/var/log/nginx/access.log`
- **Error**: `/var/log/nginx/error.log`
- **SSL**: `/var/log/letsencrypt/`

---

## 🚨 **Troubleshooting:**

### SSL não funciona:
```bash
# Verificar DNS
nslookup seu-dominio.com

# Verificar se domínio aponta para VPS
dig seu-dominio.com

# Reemitir certificado
certbot delete --cert-name seu-dominio.com
certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

### Nginx não inicia:
```bash
# Testar configuração
nginx -t

# Verificar logs
journalctl -u nginx

# Verificar portas
netstat -tlnp | grep :80
netstat -tlnp | grep :443
```

### Proxy não funciona:
```bash
# Verificar se containers estão rodando
docker-compose ps

# Testar acesso direto
curl http://localhost:3001
curl http://localhost:8001/health
```

---

## 🎯 **Fluxo Completo:**

1. **Migrar arquivos** (SCP já rodando)
2. **Configurar .env.production** 
3. **Deploy produção** (`./deploy-production.sh`)
4. **Configurar Nginx** (`./setup-nginx.sh`)
5. **Configurar DNS** (apontar domínio)
6. **Testar tudo** ✅

---

## 🔄 **Atualização do Nginx:**

Se precisar atualizar a configuração:
```bash
# Editar configuração
nano /etc/nginx/sites-enabled/seu-dominio.com

# Testar
nginx -t

# Recarregar
systemctl reload nginx
```

---

## 🎉 **Resultado Final:**

- ✅ **HTTPS automático** com Let's Encrypt
- ✅ **Performance otimizada** com cache e gzip
- ✅ **Segurança enterprise** com rate limiting
- ✅ **Manutenção fácil** com scripts
- ✅ **Monitoramento completo** com logs

**Seu Nginx estará 100% pronto para produção!** 🚀
