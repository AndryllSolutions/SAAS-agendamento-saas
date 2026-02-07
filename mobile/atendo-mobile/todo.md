# Atendo Mobile App - TODO (PRODUÇÃO)

## FASE 1 - ARQUITETURA PROFISSIONAL
- [x] Configurar projeto React Native com Expo
- [x] Instalar dependências básicas
- [x] Estrutura de pastas profissional (src/screens, src/services, src/components, etc)
- [x] Configuração de API com interceptors JWT robusto
- [x] Sistema de autenticação JWT com refresh automático
- [x] Docker First (Dockerfile, docker-compose, .dockerignore)
- [ ] Gerenciamento de estado (Redux ou Context API)
- [ ] Tratamento de erros global
- [ ] Logger e monitoring
- [ ] Configuração de ambiente (dev, staging, prod)

## FASE 2 - MÓDULO PRINCIPAL
- [x] DashboardScreen (resumo do dia, próximos agendamentos)
- [x] AppointmentsScreen (lista com filtros: data, status, profissional)
- [x] CommandsScreen (gerenciar comandas)
- [x] PackagesScreen (pacotes de serviços)
- [ ] CreateAppointmentScreen (seleção de cliente, serviço, profissional, data/hora)
- [ ] AppointmentDetailsScreen (informações completas)
- [ ] EditAppointmentScreen (editar agendamento)
- [ ] CancelAppointmentScreen (cancelar com motivo)
- [ ] RescheduleAppointmentScreen (remarcar)
- [ ] CheckInScreen (QR Code, código de check-in)
- [ ] CalendarScreen (visualização em calendário)

## FASE 3 - MÓDULO FINANCEIRO
- [x] FinancialScreen (painel financeiro com módulos)
- [x] TransactionsScreen (histórico de transações)
- [x] PaymentsScreen (pagamentos e cobranças)
- [x] CommissionsScreen (comissões por profissional)
- [x] CashControlScreen (abrir/fechar caixa)
- [x] InvoicesScreen (notas fiscais)
- [x] ReportsScreen (DRE, receita, despesas, projeção)

## FASE 4 - MÓDULO CONTROLE
- [x] GoalsScreen (metas de vendas)
- [x] ReportsScreen (relatórios completos)
- [ ] AnamnesesScreen (histórico de clientes)
- [ ] PurchasesScreen (controle de compras)
- [ ] CashbackScreen (programa de cashback)
- [ ] AnalyticsScreen (análise de dados)

## FASE 5 - MÓDULO CADASTROS
- [x] ClientsScreen (lista com busca)
- [ ] ClientDetailsScreen (informações, histórico, notas)
- [ ] CreateClientScreen (criar novo cliente)
- [ ] EditClientScreen (editar dados)
- [x] ServicesScreen (lista de serviços)
- [ ] ServiceDetailsScreen (detalhes, preço, duração)
- [x] ProfessionalsScreen (lista de profissionais)
- [ ] ProfessionalDetailsScreen (especialidades, horários, avaliações)
- [ ] ProductsScreen (produtos)
- [ ] SuppliersScreen (fornecedores)
- [ ] CategoriesScreen (categorias)
- [ ] BrandsScreen (marcas)

## FASE 6 - MÓDULO MARKETING
- [ ] LinkAgendamentoScreen (link de agendamento online)
- [ ] AgendamentoOnlineScreen (agendamento público)
- [x] WhatsAppMarketingScreen (campanhas WhatsApp)
- [x] PromotionsScreen (promoções e descontos)
- [ ] SubscriptionSalesScreen (vendas por assinatura)
- [ ] EvaluationsScreen (avaliações de clientes)
- [ ] CRMWhatsAppScreen (CRM integrado com WhatsApp)

## FASE 7 - CONFIGURAÇÕES & EXTRAS
- [x] SettingsScreen (configurações gerais)
- [ ] NotificationsScreen (lista de notificações)
- [ ] ProfileScreen (perfil do usuário)
- [ ] HelpScreen (ajuda e suporte)
- [ ] AboutScreen (sobre o app)
- [ ] Push notifications setup (Firebase Cloud Messaging)
- [ ] Local notifications (lembretes de agendamentos)
- [ ] Sync com backend (sincronização de dados)
- [ ] Offline mode (usar dados em cache)
- [ ] Data persistence (SQLite ou AsyncStorage)
- [ ] Background sync (sincronizar quando voltar online)

## FASE 8 - ESTRUTURA DE NAVEGAÇÃO
- [x] AppNavigator.js (estrutura de abas e pilhas)
- [x] Bottom Tab Navigation (Principal, Financeiro, Cadastros, Marketing)
- [x] Stack Navigation para cada módulo
- [ ] Deep linking (links profundos)
- [ ] Notch handling (suporte a notch)
- [ ] Safe area (suporte a safe area)

## FASE 9 - TESTES & OTIMIZAçõES
- [ ] Unit tests (serviços, utils)
- [ ] Integration tests (fluxos completos)
- [ ] E2E tests (testes end-to-end)
- [ ] Performance optimization
- [ ] Memory leak fixes
- [ ] Battery optimization
- [ ] Network optimization
- [ ] Tratamento de erros robusto

## FASE 8 - PRODUÇÃO
- [ ] Build para iOS (App Store)
- [ ] Build para Android (Google Play)
- [ ] App Store submission
- [ ] Google Play submission
- [ ] Monitoring em produção
- [ ] Documentação
- [ ] Suporte ao usuário
- [ ] Analytics setup
