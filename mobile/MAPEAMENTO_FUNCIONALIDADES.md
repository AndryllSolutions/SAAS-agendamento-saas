# Mapeamento Frontend Web → Mobile

## 📊 Resumo das Funcionalidades do Frontend Web

### 1. **SaaS Admin** (Super Administrador)
| Funcionalidade | Status Mobile | Prioridade |
|----------------|---------------|------------|
| Dashboard com métricas | ❌ Não existe | Alta |
| Gerenciar Empresas (CRUD) | ❌ Não existe | Alta |
| Gerenciar Usuários (promover admins) | ❌ Não existe | Alta |
| Assinaturas e Planos | ❌ Não existe | Média |
| Analytics/Revenue | ❌ Não existe | Média |
| Addons/Serviços SaaS | ❌ Não existe | Baixa |
| Impersonate (entrar como empresa) | ❌ Não existe | Alta |

### 2. **Admin da Empresa**
| Funcionalidade | Status Mobile | Prioridade |
|----------------|---------------|------------|
| Dashboard | ✅ HomeScreen | ✅ OK |
| Relatórios Gerais | ❌ Não existe | Alta |
| Configurações de Notificações | ❌ Não existe | Média |
| Gestão de Sistema | ❌ Não existe | Baixa |

### 3. **Marketing**
| Funcionalidade | Status Mobile | Prioridade |
|----------------|---------------|------------|
| WhatsApp Marketing | ❌ Não existe | Alta |
| Agendamento Online | ❌ Não existe | Média |
| Link de Agendamento | ❌ Não existe | Média |
| Promoções | ❌ Não existe | Média |

### 4. **Relatórios**
| Funcionalidade | Status Mobile | Prioridade |
|----------------|---------------|------------|
| Por Cliente | ❌ Não existe | Alta |
| Por Período | ❌ Não existe | Alta |
| Por Profissional | ❌ Não existe | Alta |
| Por Serviço | ❌ Não existe | Média |
| Comissões | ❌ Não existe | Alta |
| Despesas | ❌ Não existe | Média |
| Resultados Financeiros | ❌ Não existe | Alta |
| Metas/Goals | ❌ Não existe | Média |
| Previsão de Receita | ❌ Não existe | Baixa |

### 5. **Financeiro**
| Funcionalidade | Status Mobile | Prioridade |
|----------------|---------------|------------|
| Dashboard Financeiro | ❌ Não existe | Alta |
| Caixas/PDV | ❌ Não existe | Alta |
| Contas Bancárias | ❌ Não existe | Média |
| Categorias | ❌ Não existe | Média |
| Formas de Pagamento | ❌ Não existe | Média |
| Transações | ❌ Não existe | Alta |

### 6. **Agenda/Agendamentos**
| Funcionalidade | Status Mobile | Prioridade |
|----------------|---------------|------------|
| Calendário Visual | ✅ CalendarScreen | ✅ OK |
| Lista de Agendamentos | ✅ AppointmentsScreen | ✅ OK |
| Criar/Editar | ✅ CreateAppointmentScreen | ✅ OK |
| Detalhes | ✅ AppointmentDetailScreen | ✅ OK |
| Nova Agenda (agenda-new) | ❌ Não existe | Baixa |

### 7. **Clientes**
| Funcionalidade | Status Mobile | Prioridade |
|----------------|---------------|------------|
| Lista de Clientes | ✅ ClientsScreen | ✅ OK |
| Detalhes do Cliente | ✅ ClientDetailScreen | ✅ OK |
| Criar/Editar | ✅ CreateClientScreen | ✅ OK |
| Anamneses | ❌ Não existe | Média |
| Avaliações | ❌ Não existe | Média |
| Documentos | ❌ Não existe | Baixa |

### 8. **Serviços**
| Funcionalidade | Status Mobile | Prioridade |
|----------------|---------------|------------|
| Lista de Serviços | ✅ ServicesScreen | ✅ OK |
| Detalhes do Serviço | ✅ ServiceDetailScreen | ✅ OK |
| Criar/Editar | ✅ CreateServiceScreen | ✅ OK |
| Pacotes | ❌ Não existe | Média |
| Comissões | ❌ Não existe | Média |

### 9. **Produtos**
| Funcionalidade | Status Mobile | Prioridade |
|----------------|---------------|------------|
| Lista de Produtos | ❌ Não existe | Média |
| Categorias | ❌ Não existe | Média |
| Estoque | ❌ Não existe | Média |
| Fornecedores | ❌ Não existe | Baixa |

### 10. **Profissionais/Usuários**
| Funcionalidade | Status Mobile | Prioridade |
|----------------|---------------|------------|
| Lista de Profissionais | ❌ Não existe | Alta |
| Agenda do Profissional | ❌ Não existe | Alta |
| Comissões | ❌ Não existe | Alta |
| Metas | ❌ Não existe | Média |

### 11. **Configurações**
| Funcionalidade | Status Mobile | Prioridade |
|----------------|---------------|------------|
| Perfil do Usuário | ✅ ProfileScreen | ✅ OK |
| Configurações Gerais | ✅ SettingsScreen | ✅ OK |
| Config. da Empresa | ❌ Não existe | Média |
| API Keys | ❌ Não existe | Baixa |
| Integrações | ❌ Não existe | Média |

### 12. **Comunicação**
| Funcionalidade | Status Mobile | Prioridade |
|----------------|---------------|------------|
| Notificações | ✅ NotificationsScreen | ✅ OK |
| WhatsApp | ❌ Não existe | Alta |
| Suporte | ❌ Não existe | Baixa |

### 13. **Autenticação**
| Funcionalidade | Status Mobile | Prioridade |
|----------------|---------------|------------|
| Login | ✅ LoginScreen | ✅ OK |
| Registro | ❌ Placeholder | Média |
| Esqueci Senha | ❌ Placeholder | Média |

---

## 📱 Telas Mobile Existentes (17)

### ✅ Já Implementadas:
1. LoginScreen
2. HomeScreen (Dashboard)
3. AppointmentsScreen (Lista)
4. AppointmentDetailScreen
5. CreateAppointmentScreen
6. ClientsScreen (Lista)
7. ClientDetailScreen
8. CreateClientScreen
9. ServicesScreen (Lista)
10. ServiceDetailScreen
11. CreateServiceScreen
12. CalendarScreen
13. NotificationsScreen
14. ProfileScreen
15. SettingsScreen

### 🔄 Placeholders:
16. RegisterScreen
17. ForgotPasswordScreen
18. AdminDashboardScreen
19. UsersManagementScreen
20. CompanySettingsScreen
21. ProfessionalDashboardScreen
22. ScheduleScreen

---

## 🎯 Prioridade de Implementação

### **PRIORIDADE ALTA** (Impacto no negócio)
1. **Relatórios** - Essencial para gestão
2. **Financeiro** - Caixa e transações
3. **SaaS Admin** - Para gestão do sistema
4. **WhatsApp** - Comunicação com clientes
5. **Profissionais** - Gestão de equipe

### **PRIORIDADE MÉDIA**
6. Registro e Esqueci Senha
7. Marketing (promoções, links)
8. Produtos e Estoque
9. Anamneses/Avaliações

### **PRIORIDADE BAIXA**
10. Metas avançadas
11. Previsões
12. Configurações avançadas

---

## 📋 Próximas Telas Recomendadas

1. **ReportsScreen** - Menu de relatórios
2. **FinancialDashboardScreen** - Dashboard financeiro
3. **CashRegisterScreen** - Controle de caixa
4. **WhatsAppScreen** - Integração WhatsApp
5. **ProfessionalsScreen** - Gestão de profissionais
6. **SaaSAdminDashboard** - Para super admins
