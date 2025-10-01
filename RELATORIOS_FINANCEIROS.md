# 💰 Relatórios Financeiros - Documentação

## 🎯 O Que Foi Implementado

### Página Completa de Relatórios Financeiros (`/reports`)

**Funcionalidades:**
- ✅ Dashboard financeiro completo
- ✅ Métricas principais em cards
- ✅ Filtro por período (data inicial e final)
- ✅ Top 5 serviços mais lucrativos
- ✅ Top 5 profissionais com maior faturamento
- ✅ Cálculo automático de comissões
- ✅ Receita líquida (após comissões)
- ✅ Ticket médio
- ✅ Taxa de crescimento
- ✅ Exportação para CSV
- ✅ Resumo detalhado
- ✅ Controle de acesso (só Admin/Manager)

---

## 📊 Métricas Exibidas

### 1. **Receita Total** (Card Verde)
- Valor bruto de todos os agendamentos
- Indicador de crescimento
- Destaque visual com gradiente

### 2. **Receita Líquida** (Card Branco)
- Receita após descontar comissões
- Valor que fica para a empresa

### 3. **Ticket Médio** (Card Roxo)
- Valor médio por agendamento
- Total de agendamentos no período

### 4. **Total de Comissões** (Card Laranja)
- Valor total pago aos profissionais
- Calculado como 40% da receita (configurável)

---

## 📈 Gráficos e Rankings

### Top Serviços
- Ranking dos 5 serviços mais lucrativos
- Mostra:
  - Nome do serviço
  - Quantidade de agendamentos
  - Receita total
  - Percentual da receita total
  - Barra de progresso visual
- Medalhas: 🥇 Ouro, 🥈 Prata, 🥉 Bronze

### Top Profissionais
- Ranking dos 5 profissionais com maior faturamento
- Mostra:
  - Nome do profissional
  - Quantidade de agendamentos
  - Receita total
  - Comissão calculada (40%)
- Medalhas coloridas por posição

---

## 🔧 Como Usar

### 1. Acessar Relatórios
```
http://localhost:3000/reports
```

**Requisitos:**
- Estar logado como Admin ou Manager
- Backend rodando

### 2. Filtrar por Período

**Padrão:** Últimos 30 dias

**Personalizar:**
1. Selecione **Data Inicial**
2. Selecione **Data Final**
3. Clique no botão de **Filtro** (ícone de funil)

### 3. Exportar Relatório

Clique em **"Exportar CSV"** no canto superior direito.

**Arquivo gerado:**
```
relatorio-financeiro-2025-01-01-2025-01-31.csv
```

**Conteúdo do CSV:**
- Cabeçalho com período
- Métricas principais
- Top serviços (todos)
- Top profissionais (todos)

---

## 💡 Cálculos Realizados

### Receita Total
```
Soma de todos os valores dos agendamentos no período
```

### Ticket Médio
```
Receita Total ÷ Total de Agendamentos
```

### Total de Comissões
```
Receita Total × 40% (taxa padrão)
```

### Receita Líquida
```
Receita Total - Total de Comissões
```

### Percentual por Serviço
```
(Receita do Serviço ÷ Receita Total) × 100
```

---

## 🎨 Design

### Cards de Métricas:
- **Receita Total**: Gradiente verde com ícone de dólar
- **Receita Líquida**: Branco com ícone de tendência
- **Ticket Médio**: Branco com ícone de calendário
- **Comissões**: Branco com ícone de usuários

### Rankings:
- Medalhas coloridas (ouro, prata, bronze, roxo)
- Barras de progresso animadas
- Hover effects
- Informações detalhadas

---

## 📱 Responsivo

- **Desktop**: 4 colunas de cards, 2 colunas de rankings
- **Tablet**: 2 colunas de cards, 1 coluna de rankings
- **Mobile**: 1 coluna para tudo

---

## 🔐 Controle de Acesso

**Quem pode acessar:**
- ✅ Admin
- ✅ Manager

**Quem NÃO pode:**
- ❌ Professional
- ❌ Client

Se tentar acessar sem permissão, vê mensagem de erro.

---

## 📊 Exemplo de Dados

### Período: 01/01/2025 a 31/01/2025

**Métricas:**
- Receita Total: R$ 15.000,00
- Receita Líquida: R$ 9.000,00
- Ticket Médio: R$ 150,00
- Total de Comissões: R$ 6.000,00
- Total de Agendamentos: 100
- Taxa de Crescimento: +12,5%

**Top Serviços:**
1. Corte de Cabelo - 40 agendamentos - R$ 4.000,00 (26,7%)
2. Manicure - 30 agendamentos - R$ 3.000,00 (20%)
3. Barba - 20 agendamentos - R$ 2.000,00 (13,3%)

**Top Profissionais:**
1. Maria Silva - 35 agendamentos - R$ 5.250,00 - Comissão: R$ 2.100,00
2. João Santos - 30 agendamentos - R$ 4.500,00 - Comissão: R$ 1.800,00
3. Ana Costa - 25 agendamentos - R$ 3.750,00 - Comissão: R$ 1.500,00

---

## 🚀 Próximas Melhorias (Futuro)

### Gráficos Visuais:
- [ ] Gráfico de linha (receita por mês)
- [ ] Gráfico de pizza (distribuição por serviço)
- [ ] Gráfico de barras (comparação de profissionais)

### Filtros Avançados:
- [ ] Filtrar por profissional específico
- [ ] Filtrar por serviço específico
- [ ] Comparar períodos (mês atual vs anterior)

### Exportação:
- [ ] Exportar para PDF
- [ ] Exportar para Excel (XLSX)
- [ ] Enviar por email

### Análises:
- [ ] Previsão de receita
- [ ] Análise de tendências
- [ ] Alertas de queda de receita

---

## 🎊 RELATÓRIOS FINANCEIROS COMPLETOS!

**Agora você tem:**
- ✅ Dashboard financeiro profissional
- ✅ Métricas em tempo real
- ✅ Rankings de serviços e profissionais
- ✅ Cálculo automático de comissões
- ✅ Exportação para CSV
- ✅ Filtros por período
- ✅ Design moderno e responsivo

**Acesse: http://localhost:3000/reports** 💰✨
