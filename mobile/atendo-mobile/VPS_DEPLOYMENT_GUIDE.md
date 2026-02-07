# 🚀 GUIA COMPLETO DE DEPLOY NA VPS

## 📋 Pré-requisitos na VPS

### 1. Instalar Node.js 18+
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

### 2. Instalar Git
```bash
sudo apt-get install -y git
git --version
```

### 3. Instalar PM2 (para manter app rodando)
```bash
sudo npm install -g pm2
pm2 --version
```

---

## 📦 PASSO 1: Clonar/Copiar Projeto

### Opção A: Via Git
```bash
cd /home/seu-usuario
git clone seu-repositorio-aqui atendo-mobile
cd atendo-mobile
```

### Opção B: Via SCP (copiar arquivo)
```bash
# No seu computador local
scp -r atendo-mobile seu-usuario@seu-vps:/home/seu-usuario/

# Na VPS
cd /home/seu-usuario/atendo-mobile
```

---

## 🔧 PASSO 2: Configurar Ambiente

### 1. Criar arquivo .env
```bash
cp .env.example .env
nano .env
```

### 2. Editar .env com suas configurações
```env
# URL do seu backend
REACT_APP_API_URL=https://seu-backend.com/api

# Timeout das requisições
REACT_APP_API_TIMEOUT=30000

# Nome do app
REACT_APP_APP_NAME=Atendo

# Versão
REACT_APP_APP_VERSION=1.0.0

# Features
REACT_APP_ENABLE_PUSH_NOTIFICATIONS=true
REACT_APP_ENABLE_OFFLINE_MODE=true
REACT_APP_ENABLE_BIOMETRIC_AUTH=true
REACT_APP_ANALYTICS_ENABLED=true

# Log level
LOG_LEVEL=info
```

---

## 📥 PASSO 3: Instalar Dependências

```bash
# Limpar cache
npm cache clean --force

# Instalar
npm install

# Se tiver erro de peer dependencies
npm install --legacy-peer-deps
```

---

## 🏗️ PASSO 4: Build do Projeto

### Para Web (se quiser servir via HTTP)
```bash
npm run web
```

### Para Mobile (Expo)
```bash
# Apenas verificar se compila
npm start
```

---

## 🚀 PASSO 5: Executar na VPS

### Opção A: Com PM2 (RECOMENDADO)
```bash
# Iniciar com PM2
pm2 start "npm start" --name "atendo-mobile"

# Salvar configuração
pm2 save

# Iniciar no boot
pm2 startup

# Ver logs
pm2 logs atendo-mobile

# Parar
pm2 stop atendo-mobile

# Reiniciar
pm2 restart atendo-mobile
```

### Opção B: Com Screen
```bash
screen -S atendo-mobile
npm start

# Desanexar: Ctrl+A depois D
# Reanexar: screen -r atendo-mobile
```

### Opção C: Com Nohup
```bash
nohup npm start > app.log 2>&1 &
tail -f app.log
```

---

## 🌐 PASSO 6: Configurar Nginx (Opcional)

Se quiser servir via HTTP/HTTPS:

```bash
sudo nano /etc/nginx/sites-available/atendo-mobile
```

Adicione:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar:
```bash
sudo ln -s /etc/nginx/sites-available/atendo-mobile /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 📱 PASSO 7: Acessar o App

### No Expo Go (Recomendado)
1. Instale Expo Go no seu celular
2. Execute `npm start` na VPS
3. Escaneie o QR code

### Via Web
```
http://seu-vps:8081
```

### Via App Nativo (iOS/Android)
```bash
# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
```

---

## 🔍 TROUBLESHOOTING

### Porta 8081 já está em uso
```bash
# Encontrar processo
lsof -i :8081

# Matar processo
kill -9 PID

# Ou usar porta diferente
PORT=8082 npm start
```

### Erro de memória
```bash
# Aumentar limite
export NODE_OPTIONS="--max-old-space-size=4096"
npm start
```

### App não conecta ao backend
- Verifique `.env` com URL correta
- Teste conexão: `curl https://seu-backend.com/api`
- Verifique CORS no backend

### PM2 não inicia
```bash
# Reinstalar
sudo npm install -g pm2
pm2 startup
pm2 save
```

---

## 📊 Monitorar App

### Ver status
```bash
pm2 status
pm2 monit
```

### Ver logs
```bash
pm2 logs atendo-mobile
pm2 logs atendo-mobile --lines 100
```

### Reiniciar automático
```bash
pm2 restart atendo-mobile --cron "0 2 * * *"  # 2am todo dia
```

---

## 🔐 Segurança

### 1. Usar HTTPS
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d seu-dominio.com
```

### 2. Firewall
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 3. Backup
```bash
# Backup do projeto
tar -czf atendo-mobile-backup.tar.gz atendo-mobile/

# Backup do .env
cp .env .env.backup
```

---

## ✅ Checklist Final

- [ ] Node.js 18+ instalado
- [ ] npm install executado com sucesso
- [ ] .env configurado com URLs corretas
- [ ] npm start funciona localmente
- [ ] PM2 instalado e configurado
- [ ] Nginx configurado (se necessário)
- [ ] Firewall configurado
- [ ] Certificado SSL/HTTPS ativo
- [ ] Backups configurados
- [ ] Logs sendo monitorados

---

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs: `pm2 logs atendo-mobile`
2. Teste conexão com backend: `curl seu-backend.com/api`
3. Verifique permissões: `ls -la`
4. Reinstale dependências: `rm -rf node_modules && npm install`

---

**App pronto para produção!** 🎉
