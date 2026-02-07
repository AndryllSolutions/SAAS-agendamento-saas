# 🚀 TUTORIAL COMPLETO - ATENDO MOBILE APP

## ⚠️ PROBLEMA COMUM
Você está vendo a tela padrão do React Native/Expo? Isso significa que o app não está carregando as telas customizadas. Vamos corrigir!

---

## 📋 PASSO 1: Verificar Estrutura de Pastas

Certifique-se que você tem esta estrutura:

```
atendo-mobile/
├── src/
│   ├── screens/          ← TELAS (53 arquivos)
│   ├── services/         ← SERVIÇOS API (23 arquivos)
│   ├── config/           ← CONFIGURAÇÃO
│   ├── navigation/       ← NAVEGAÇÃO
│   ├── components/       ← COMPONENTES
│   ├── constants/        ← CONSTANTES
│   └── utils/            ← UTILITÁRIOS
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   └── (tabs)/
├── package.json
├── .env.example
├── metro.config.js
├── babel.config.js
└── app.json
```

**Se a pasta `src/` não existir, o app não vai funcionar!**

---

## 📋 PASSO 2: Limpar e Reinstalar

### No PowerShell (Windows):

```powershell
# 1. Entrar na pasta do projeto
cd C:\PROJETOS\agendamento_SAAS\mobile\atendo-mobile

# 2. Limpar cache do npm
npm cache clean --force

# 3. Deletar node_modules e package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# 4. Reinstalar dependências
npm install

# 5. Limpar cache do Expo
npx expo start --clear
```

### No Terminal (macOS/Linux):

```bash
cd /caminho/para/atendo-mobile
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npx expo start --clear
```

---

## 📋 PASSO 3: Configurar o .env

### 1. Copiar arquivo de exemplo
```bash
cp .env.example .env
```

### 2. Editar .env com suas configurações

Abra o arquivo `.env` e configure:

```env
# URL do seu backend
REACT_APP_API_URL=http://seu-backend.com/api

# Timeout das requisições (em ms)
REACT_APP_API_TIMEOUT=30000

# Nome do app
REACT_APP_APP_NAME=Atendo

# Versão do app
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

## 📋 PASSO 4: Verificar app.json

Abra `app.json` e certifique-se que tem:

```json
{
  "expo": {
    "name": "Atendo",
    "slug": "atendo-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTabletMode": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png"
      }
    },
    "web": {
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      [
        "expo-router",
        {
          "origin": false,
          "asyncRoutes": true
        }
      ]
    ],
    "scheme": "atendo"
  }
}
```

---

## 📋 PASSO 5: Iniciar o App

### Opção A: Executar no Expo Go (Mais Fácil)

```bash
npm start
```

Você verá um QR code. Escaneie com:
- **Android**: App Expo Go
- **iOS**: Câmera do iPhone (abre Expo Go automaticamente)

### Opção B: Executar no Simulador

**Android:**
```bash
npm run android
```

**iOS (apenas macOS):**
```bash
npm run ios
```

### Opção C: Executar na Web

```bash
npm run web
```

---

## 🔧 TROUBLESHOOTING

### ❌ Problema: "Cannot find module 'src/screens'"

**Solução:**
```bash
# Limpar cache
npx expo start --clear

# Ou resetar projeto
npm run reset-project
```

### ❌ Problema: "Metro config error"

**Solução:**
```bash
# Deletar node_modules
rm -rf node_modules

# Reinstalar
npm install

# Iniciar com --clear
npx expo start --clear
```

### ❌ Problema: "Port 8081 already in use"

**Solução:**
```bash
# Usar porta diferente
npx expo start --port 8082
```

### ❌ Problema: "Cannot find .env file"

**Solução:**
```bash
# Criar arquivo .env
cp .env.example .env

# Editar com suas configurações
```

### ❌ Problema: "Tela branca ou tela padrão do Expo"

**Solução:**
1. Certifique-se que `src/screens/` existe
2. Limpe o cache: `npx expo start --clear`
3. Reinicie o app no seu dispositivo
4. Verifique se não há erros no console

---

## 📱 Testando no Dispositivo Real

### Android:
1. Instale o app **Expo Go** na Play Store
2. Execute `npm start`
3. Escaneie o QR code com a câmera do Android
4. Abre automaticamente no Expo Go

### iOS:
1. Instale o app **Expo Go** na App Store
2. Execute `npm start`
3. Escaneie o QR code com a câmera do iPhone
4. Abre automaticamente no Expo Go

---

## 🎯 Verificar se Está Funcionando

Quando o app iniciar corretamente, você deve ver:

1. ✅ **Tela de Login** (LoginScreen.js)
2. ✅ **Dashboard** (após login)
3. ✅ **Bottom Tab Navigation** com 4 abas:
   - Principal
   - Financeiro
   - Cadastros
   - Marketing

---

## 🚀 Build para Produção

### Gerar APK (Android):

```bash
eas build --platform android --local
```

### Gerar IPA (iOS):

```bash
eas build --platform ios --local
```

---

## 📞 Suporte

Se tiver problemas:

1. Verifique se Node.js 18+ está instalado: `node --version`
2. Verifique se npm 9+ está instalado: `npm --version`
3. Limpe cache: `npm cache clean --force`
4. Reinstale: `rm -rf node_modules && npm install`
5. Inicie com clear: `npx expo start --clear`

---

**Sucesso! Seu app Atendo está pronto! 🎉**
