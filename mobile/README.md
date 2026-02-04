# Atendo Mobile

Aplicativo React Native para o sistema de agendamento online multi-tenant Atendo.

## 📱 Sobre

O Atendo Mobile é o aplicativo oficial para dispositivos móveis do sistema Atendo, permitindo:

- **Profissionais**: Gerenciar agenda, ver agendamentos, confirmar/cancelar horários
- **Administradores**: Dashboard completo, gerenciamento de usuários e configurações
- **Clientes**: Agendar serviços, visualizar histórico e gerenciar perfil

## 🚀 Tecnologias

- **React Native** 0.72.6
- **TypeScript**
- **Expo** / React Native CLI
- **React Navigation** 6.x
- **Zustand** (State Management)
- **NativeWind** (Tailwind para RN)
- **React Native Paper** (UI Components)

## 📦 Estrutura do Projeto

```
mobile/
├── App.tsx                 # Entry point
├── package.json            # Dependências
├── tsconfig.json          # Config TypeScript
├── babel.config.js        # Config Babel
├── metro.config.js        # Config Metro
├── types/                 # Tipos TypeScript
│   └── index.ts          # Tipos do sistema
├── services/             # API Services
│   └── api.ts           # Cliente HTTP
├── store/               # State Management
│   └── authStore.ts    # Store de autenticação
├── navigation/          # Navegação
│   └── AppNavigator.tsx
├── screens/            # Telas
│   ├── auth/          # Autenticação
│   ├── home/          # Dashboard
│   ├── appointments/  # Agendamentos
│   ├── clients/       # Clientes
│   ├── profile/       # Perfil
│   └── ...
└── components/       # Componentes reutilizáveis
```

## 🔧 Instalação

### Pré-requisitos

- Node.js >= 16
- React Native CLI
- Android Studio (para Android)
- Xcode (para iOS - macOS apenas)

### Passos

1. **Clone e navegue até o diretório:**
   ```bash
   cd mobile
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```
   
   Edite `.env` com suas configurações:
   ```
   API_BASE_URL=http://localhost:8000/api/v1
   ```

4. **Inicie o Metro:**
   ```bash
   npx react-native start
   ```

5. **Execute o app:**
   
   **Android:**
   ```bash
   npx react-native run-android
   ```
   
   **iOS:**
   ```bash
   npx react-native run-ios
   ```

## 🌐 Conexão com Backend

O app se conecta ao backend FastAPI através de:

- **Desenvolvimento:** `http://localhost:8000/api/v1`
- **Produção:** `https://api.seudominio.com/api/v1`

### Endpoints Principais

- `POST /auth/mobile/login` - Login mobile otimizado
- `GET /users/me` - Perfil do usuário
- `GET /appointments` - Lista de agendamentos
- `POST /appointments` - Criar agendamento
- `GET /push/vapid-public-key` - Configuração push notifications

## 📱 Features Implementadas

### ✅ Completo
- [x] Autenticação mobile otimizada
- [x] Sistema de navegação por role (admin/professional/client)
- [x] Dashboard com estatísticas
- [x] Lista de agendamentos com filtros
- [x] Gerenciamento de perfil
- [x] Integração com API REST
- [x] State management com Zustand
- [x] Persistência local (AsyncStorage)

### 🚧 Em Desenvolvimento
- [ ] Push Notifications
- [ ] Calendário visual
- [ ] Sistema de clientes completo
- [ ] Pagamentos integrados
- [ ] Biometria (Face ID/Touch ID)

## 🎨 Design System

Cores baseadas no backend:
- **Primary:** `#6366f1` (indigo-500)
- **Secondary:** `#4f46e5` (indigo-600)
- **Success:** `#22c55e`
- **Error:** `#ef4444`
- **Warning:** `#f59e0b`

## 🔐 Autenticação

O app usa JWT tokens com refresh automático:
- Access token: 8 horas
- Refresh token: 30 dias
- Endpoint mobile otimizado: `/auth/mobile/login`

## 📋 Checklist para Produção

- [ ] Configurar variáveis de ambiente de produção
- [ ] Configurar Firebase para push notifications
- [ ] Assinar app para Play Store
- [ ] Configurar CI/CD
- [ ] Testes em dispositivos reais
- [ ] Otimizar bundle size

## 🐛 Troubleshooting

### Erro de CORS
Verifique se o backend permite o origin do app mobile em `CORS_ORIGIN`.

### Metro não inicia
```bash
npx react-native start --reset-cache
```

### Erro de dependências
```bash
cd ios && pod install && cd ..
# Android: ./gradlew clean
```

## 📄 Licença

Este projeto é proprietário e confidencial.

## 🤝 Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido para:** Atendo - Sistema de Agendamento Online  
**Versão:** 1.0.0  
**Data:** 2024
